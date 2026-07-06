import axios from 'axios';

const BudgetNew = {
  data: {
    accounts: [],
    costCenters: [],
    loading: false,
    formData: {
      budgetName: '',
      budgetCode: '',
      fiscalYear: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      description: '',
      budgetType: 'Operating',
      lines: [{ account: '', costCenter: '', budgetAmount: 0, actualAmount: 0 }]
    }
  },

  generateBudgetCode(name = '') {
    if (!this._budgetCodeSuffix) {
      this._budgetCodeSuffix = Date.now().toString().slice(-6);
    }
    const prefix = (name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0].toUpperCase())
      .join('')
      .slice(0, 3) || 'GEN';
    return `BUD-${prefix}-${this._budgetCodeSuffix}`;
  },

  getDefaultFormData() {
    // reset suffix for a fresh form so code remains stable while typing
    this._budgetCodeSuffix = Date.now().toString().slice(-6);
    return {
      budgetName: '',
      budgetCode: this.generateBudgetCode(),
      fiscalYear: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      description: '',
      budgetType: 'Operating',
      lines: [{ account: '', costCenter: '', budgetAmount: 0, actualAmount: 0 }]
    };
  },

  resetForm() {
    this.data.formData = this.getDefaultFormData();
    this.updateView();
  },

  async fetchReferenceData() {
    this.data.loading = true;
    this.updateView();
    try {
      const [accountsResponse, costCentersResponse] = await Promise.all([
        axios.get('/api/accounting/chart-of-accounts/list', {
          params: { limit: 100, isActive: true },
          withCredentials: true
        }),
        axios.get('/api/accounting/cost-centers/list', {
          params: { limit: 100, isActive: true },
          withCredentials: true
        })
      ]);

      this.data.accounts = accountsResponse.data.accounts || [];
      this.data.costCenters = costCentersResponse.data.costCenters || [];
    } catch (error) {
      console.error('Error loading accounts or cost centers:', error);
      alert('Unable to load budget reference data.');
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  formatDateValue(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  },

  addLineItem() {
    this.data.formData.lines.push({ account: '', costCenter: '', budgetAmount: 0, actualAmount: 0 });
    this.updateView();
  },

  removeLineItem(index) {
    if (this.data.formData.lines.length > 1) {
      this.data.formData.lines.splice(index, 1);
      this.updateView();
    }
  },

  updateLine(index, field, value) {
    if (!this.data.formData.lines[index]) return;
    this.data.formData.lines[index][field] = field === 'budgetAmount' || field === 'actualAmount' ? Number(value || 0) : value;
  },

  getBudgetTotal(lines) {
    return (lines || []).reduce((sum, line) => sum + (parseFloat(line.budgetAmount) || 0), 0);
  },

  getActualTotal(lines) {
    return (lines || []).reduce((sum, line) => sum + (parseFloat(line.actualAmount) || 0), 0);
  },

  async handleSubmit() {
    try {
      this.data.loading = true;
      this.updateView();
      const payload = {
        ...this.data.formData,
        fiscalYear: Number(this.data.formData.fiscalYear || new Date().getFullYear()),
        startDate: this.data.formData.startDate || undefined,
        endDate: this.data.formData.endDate || undefined,
        lines: (this.data.formData.lines || [])
          .filter((line) => line.account || line.budgetAmount)
          .map((line) => ({
            account: line.account || undefined,
            costCenter: line.costCenter || undefined,
            budgetAmount: Number(line.budgetAmount || 0),
            actualAmount: Number(line.actualAmount || 0)
          }))
      };

      if (!payload.budgetName || !payload.fiscalYear || !payload.budgetType) {
        alert('Please complete the required budget fields.');
        this.data.loading = false;
        this.updateView();
        return;
      }

      if (!payload.lines.length || payload.lines.some((line) => !line.account || !line.budgetAmount)) {
        alert('Each budget line must include an account and a budget amount.');
        this.data.loading = false;
        this.updateView();
        return;
      }

      await axios.post('/api/accounting/budgets/create', payload, { withCredentials: true });
      alert('Budget created successfully.');
      sessionStorage.setItem('budgetCreated', 'true');
      window.location.hash = '#/budget';
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  render() {
    window.budgetNewInstance = this;
    const { accounts, costCenters, loading, formData } = this.data;
    const totalBudget = this.getBudgetTotal(formData.lines);

    if (loading && accounts.length === 0 && costCenters.length === 0) {
      return `
        <div class="budget-container">
          <div class="budget-form-card">
            <p>Loading budget setup data...</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="budget-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/budget" class="financial-nav-link">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>

        <h2>Create New Budget</h2>
        <p class="subtitle">Enter a budget name, assign lines to accounts and cost centers, then save to register it in the system.</p>

        <div class="budget-form-card">
          <div class="form-grid">
            <div class="form-group">
              <label>Budget Name</label>
              <input type="text" value="${formData.budgetName}" data-budget-name />
            </div>
            <div class="form-group">
              <label>Budget Code</label>
              <input type="text" readonly value="${formData.budgetCode}" data-budget-code />
            </div>
            <div class="form-group">
              <label>Fiscal Year</label>
              <input type="number" value="${formData.fiscalYear}" data-fiscal-year />
            </div>
            <div class="form-group">
              <label>Budget Type</label>
              <select data-budget-type>
                <option value="Operating" ${formData.budgetType === 'Operating' ? 'selected' : ''}>Operating</option>
                <option value="Capital" ${formData.budgetType === 'Capital' ? 'selected' : ''}>Capital</option>
                <option value="Cash" ${formData.budgetType === 'Cash' ? 'selected' : ''}>Cash</option>
                <option value="Project" ${formData.budgetType === 'Project' ? 'selected' : ''}>Project</option>
                <option value="Department" ${formData.budgetType === 'Department' ? 'selected' : ''}>Department</option>
              </select>
            </div>
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" value="${formData.startDate}" data-start-date />
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" value="${formData.endDate}" data-end-date />
            </div>
            <div class="form-group form-full">
              <label>Description</label>
              <textarea rows="3" data-description>${formData.description}</textarea>
            </div>
          </div>

          <div class="line-items-section">
            <div class="line-items-header">
              <h4>Budget Lines</h4>
              <button type="button" data-action="add-line" class="btn-add">+ Add Line</button>
            </div>
            <table class="line-items-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Cost Center</th>
                  <th>Budget Amount</th>
                  <th>Actual Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${formData.lines.map((line, index) => `
                  <tr data-line-row data-line-index="${index}">
                    <td>
                      <select data-line-account data-line-index="${index}">
                        <option value="">Select account</option>
                        ${accounts.map((account) => `<option value="${account._id}" ${line.account === account._id ? 'selected' : ''}>${account.accountCode} - ${account.accountName}</option>`).join('')}
                      </select>
                    </td>
                    <td>
                      <select data-line-cost-center data-line-index="${index}">
                        <option value="">Select cost center</option>
                        ${costCenters.map((costCenter) => `<option value="${costCenter._id}" ${line.costCenter === costCenter._id ? 'selected' : ''}>${costCenter.costCenterCode} - ${costCenter.costCenterName}</option>`).join('')}
                      </select>
                    </td>
                    <td><input type="number" step="0.01" value="${line.budgetAmount}" data-line-budget-amount data-line-index="${index}" /></td>
                    <td><input type="number" step="0.01" value="${line.actualAmount}" data-line-actual-amount data-line-index="${index}" /></td>
                    <td><button type="button" data-action="remove-line" data-index="${index}" class="btn-remove" ${formData.lines.length > 1 ? '' : 'disabled'}>Remove</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="budget-total">
              <div>Total budget: <strong>$<span data-total-budget>${totalBudget.toFixed(2)}</span></strong></div>
              <div>Total actual: <strong>$<span data-total-actual>${this.getActualTotal(formData.lines).toFixed(2)}</span></strong></div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" data-action="submit-budget" class="btn-submit" ${loading ? 'disabled' : ''}>${loading ? 'Saving...' : 'Create Budget'}</button>
            <button type="button" data-action="reset-budget" class="btn-secondary">Reset</button>
            <a href="#/budget" class="btn-secondary">Back to Budgets</a>
          </div>
        </div>

        <style>
          .budget-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .subtitle { color: #475569; margin-bottom: 20px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .financial-nav-link.active { background: #007bff; color: white; }
          .budget-form-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06); }
          .form-grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 15px; }
          .form-group { display: flex; flex-direction: column; gap: 6px; }
          .form-full { grid-column: 1 / -1; }
          .form-group input, .form-group select, .form-group textarea, .line-items-table input, .line-items-table select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          .line-items-section { margin-top: 20px; }
          .line-items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .line-items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .line-items-table th, .line-items-table td { padding: 12px; border: 1px solid #ddd; text-align: left; }
          .line-items-table th { background-color: #007bff; color: white; }
          .budget-total { margin-top: 10px; font-weight: 700; }
          .btn-submit, .btn-add, .btn-secondary, .btn-remove { padding: 10px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .btn-submit { background-color: #28a745; color: white; }
          .btn-secondary { background-color: #6c757d; color: white; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
          .btn-add { background-color: #17a2b8; color: white; }
          .btn-remove { background-color: #dc3545; color: white; }
          .form-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
          @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
        </style>
      </div>
    `;
  },

  updateBudgetSummary() {
    const container = document.getElementById('main-content');
    if (!container) return;

    const budgetTotal = container.querySelector('[data-total-budget]');
    if (budgetTotal) {
      budgetTotal.textContent = this.getBudgetTotal(this.data.formData.lines).toFixed(2);
    }

    const actualTotal = container.querySelector('[data-total-actual]');
    if (actualTotal) {
      actualTotal.textContent = this.getActualTotal(this.data.formData.lines).toFixed(2);
    }
  },

  registerEvents() {
    const container = document.getElementById('main-content');
    if (!container) return;

    const budgetNameInput = container.querySelector('[data-budget-name]');
    if (budgetNameInput) {
      budgetNameInput.addEventListener('input', (event) => {
        this.data.formData.budgetName = event.target.value;
        if (!this.data.formData.budgetCode || this.data.formData.budgetCode.startsWith('BUD-')) {
          this.data.formData.budgetCode = this.generateBudgetCode(event.target.value);
          const budgetCodeInput = container.querySelector('[data-budget-code]');
          if (budgetCodeInput) {
            budgetCodeInput.value = this.data.formData.budgetCode;
          }
        }
      });
    }

    const fiscalYearInput = container.querySelector('[data-fiscal-year]');
    if (fiscalYearInput) {
      fiscalYearInput.addEventListener('input', (event) => {
        this.data.formData.fiscalYear = Number(event.target.value || new Date().getFullYear());
      });
    }

    const budgetTypeSelect = container.querySelector('[data-budget-type]');
    if (budgetTypeSelect) {
      budgetTypeSelect.addEventListener('change', (event) => {
        this.data.formData.budgetType = event.target.value;
      });
    }

    const startDateInput = container.querySelector('[data-start-date]');
    if (startDateInput) {
      startDateInput.addEventListener('input', (event) => {
        this.data.formData.startDate = event.target.value;
      });
    }

    const endDateInput = container.querySelector('[data-end-date]');
    if (endDateInput) {
      endDateInput.addEventListener('input', (event) => {
        this.data.formData.endDate = event.target.value;
      });
    }

    const descriptionInput = container.querySelector('[data-description]');
    if (descriptionInput) {
      descriptionInput.addEventListener('input', (event) => {
        this.data.formData.description = event.target.value;
      });
    }

    const addLineButton = container.querySelector('[data-action="add-line"]');
    if (addLineButton) {
      addLineButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.addLineItem();
      });
    }

    container.querySelectorAll('[data-action="remove-line"]').forEach((button) => {
      const index = Number(button.getAttribute('data-index'));
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.removeLineItem(index);
      });
    });

    container.querySelectorAll('[data-line-row]').forEach((row) => {
      const index = Number(row.getAttribute('data-line-index'));
      const accountSelect = row.querySelector('[data-line-account]');
      const costCenterSelect = row.querySelector('[data-line-cost-center]');
      const budgetAmountInput = row.querySelector('[data-line-budget-amount]');
      const actualAmountInput = row.querySelector('[data-line-actual-amount]');

      if (accountSelect) {
        accountSelect.addEventListener('change', (event) => {
          this.updateLine(index, 'account', event.target.value);
          this.updateBudgetSummary();
        });
      }

      if (costCenterSelect) {
        costCenterSelect.addEventListener('change', (event) => {
          this.updateLine(index, 'costCenter', event.target.value);
        });
      }

      if (budgetAmountInput) {
        budgetAmountInput.addEventListener('input', (event) => {
          this.updateLine(index, 'budgetAmount', event.target.value);
          this.updateBudgetSummary();
        });
      }

      if (actualAmountInput) {
        actualAmountInput.addEventListener('input', (event) => {
          this.updateLine(index, 'actualAmount', event.target.value);
          this.updateBudgetSummary();
        });
      }
    });

    const submitButton = container.querySelector('[data-action="submit-budget"]');
    if (submitButton) {
      submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (document && document.activeElement && ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
          document.activeElement.blur();
        }
        this.handleSubmit();
      });
    }

    const resetButton = container.querySelector('[data-action="reset-budget"]');
    if (resetButton) {
      resetButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.resetForm();
      });
    }

    this.updateBudgetSummary();
  },

  bindEvents() {
    this.registerEvents();
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
      this.registerEvents();
    }
  },

  async init() {
    window.budgetNewInstance = this;
    await this.fetchReferenceData();
    this.updateView();
  },

  vignette() {
    return this.init();
  }
};

export default BudgetNew;