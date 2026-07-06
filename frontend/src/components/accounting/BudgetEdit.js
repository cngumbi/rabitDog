import axios from 'axios';

const BudgetEdit = {
  data: {
    loading: false,
    saving: false,
    budgetId: '',
    budget: null,
    accounts: [],
    costCenters: [],
    error: ''
  },

  formatDateValue(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  },

  getBudgetTotal(lines) {
    return (lines || []).reduce((sum, line) => sum + (Number(line.budgetAmount) || 0), 0);
  },

  getActualTotal(lines) {
    return (lines || []).reduce((sum, line) => sum + (Number(line.actualAmount) || 0), 0);
  },

  getDefaultLine() {
    return { account: '', costCenter: '', budgetAmount: 0, actualAmount: 0 };
  },

  async fetchReferenceData() {
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
      console.error('Error loading budget reference data:', error);
      this.data.accounts = [];
      this.data.costCenters = [];
    }
  },

  async fetchBudget() {
    this.data.loading = true;
    this.data.error = '';
    try {
      const response = await axios.get(`/api/accounting/budgets/${this.data.budgetId}`, {
        withCredentials: true
      });
      const budget = response.data;
      this.data.budget = {
        ...budget,
        startDate: this.formatDateValue(budget.startDate),
        endDate: this.formatDateValue(budget.endDate),
        lines: (budget.lines || []).map((line) => ({
          account: line.account?._id || line.account || '',
          costCenter: line.costCenter?._id || line.costCenter || '',
          budgetAmount: Number(line.budgetAmount || 0),
          actualAmount: Number(line.actualAmount || 0),
          _id: line._id || ''
        }))
      };
      if (!this.data.budget.lines.length) {
        this.data.budget.lines = [this.getDefaultLine()];
      }
    } catch (error) {
      console.error('Error loading budget for edit:', error);
      this.data.error = error.response?.data?.message || error.message || 'Unable to load budget.';
      this.data.budget = null;
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  addLineItem() {
    if (!this.data.budget) return;
    this.data.budget.lines.push(this.getDefaultLine());
    this.updateView();
  },

  removeLineItem(index) {
    if (!this.data.budget || this.data.budget.lines.length <= 1) return;
    this.data.budget.lines.splice(index, 1);
    this.updateView();
  },

  updateLine(index, field, value) {
    if (!this.data.budget || !this.data.budget.lines[index]) return;
    this.data.budget.lines[index][field] = field === 'budgetAmount' || field === 'actualAmount'
      ? Number(value || 0)
      : value;
    this.updateView();
  },

  async handleSubmit() {
    if (!this.data.budget) return;
    if (this.data.budget.status !== 'Draft') {
      alert('Only draft budgets can be edited.');
      return;
    }

    this.data.saving = true;
    this.updateView();

    try {
      const payload = {
        budgetName: this.data.budget.budgetName,
        budgetCode: this.data.budget.budgetCode,
        fiscalYear: Number(this.data.budget.fiscalYear || new Date().getFullYear()),
        startDate: this.data.budget.startDate || undefined,
        endDate: this.data.budget.endDate || undefined,
        description: this.data.budget.description,
        budgetType: this.data.budget.budgetType,
        lines: (this.data.budget.lines || [])
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
        return;
      }

      if (!payload.lines.length || payload.lines.some((line) => !line.account || !line.budgetAmount)) {
        alert('Each budget line must include an account and a budget amount.');
        return;
      }

      await axios.put(`/api/accounting/budgets/${this.data.budgetId}`, payload, { withCredentials: true });
      alert('Budget updated successfully.');
      window.location.hash = `#/budget/${this.data.budgetId}`;
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.saving = false;
      this.updateView();
    }
  },

  registerEvents() {
    const container = document.getElementById('main-content');
    if (!container) return;

    container.querySelectorAll('[data-input]').forEach((input) => {
      const field = input.dataset.input;
      input.addEventListener('input', (event) => {
        if (!this.data.budget) return;
        this.data.budget[field] = event.target.value;
      });
    });

    container.querySelectorAll('[data-line-account]').forEach((select) => {
      const index = Number(select.dataset.index);
      select.addEventListener('change', (event) => this.updateLine(index, 'account', event.target.value));
    });

    container.querySelectorAll('[data-line-cost-center]').forEach((select) => {
      const index = Number(select.dataset.index);
      select.addEventListener('change', (event) => this.updateLine(index, 'costCenter', event.target.value));
    });

    container.querySelectorAll('[data-line-amount]').forEach((input) => {
      const index = Number(input.dataset.index);
      const field = input.dataset.lineField;
      input.addEventListener('input', (event) => this.updateLine(index, field, event.target.value));
    });

    const addButton = container.querySelector('[data-action="add-line"]');
    if (addButton) {
      addButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.addLineItem();
      });
    }

    container.querySelectorAll('[data-action="remove-line"]').forEach((button) => {
      const index = Number(button.dataset.index);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        this.removeLineItem(index);
      });
    });

    const submitButton = container.querySelector('[data-action="save-budget"]');
    if (submitButton) {
      submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.handleSubmit();
      });
    }
  },

  render() {
    if (this.data.loading) {
      return `
        <div class="budget-container">
          <p>Loading budget details...</p>
        </div>
      `;
    }

    if (this.data.error) {
      return `
        <div class="budget-container">
          <p class="error">${this.data.error}</p>
          <a href="#/budget" class="btn-secondary">Back to budgets</a>
        </div>
      `;
    }

    if (!this.data.budget) {
      return `
        <div class="budget-container">
          <p>No budget loaded.</p>
        </div>
      `;
    }

    const budget = this.data.budget;
    const totalBudget = this.getBudgetTotal(budget.lines);
    const totalActual = this.getActualTotal(budget.lines);
    const editable = budget.status === 'Draft';

    return `
      <div class="budget-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/budget" class="financial-nav-link">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>

        <h2>Edit Budget</h2>
        <p class="subtitle">Update budget details and line item amounts for draft budgets.</p>

        <div class="budget-form-card">
          <div class="page-status">Status: <strong>${budget.status || 'Unknown'}</strong></div>
          <div class="form-grid">
            <div class="form-group">
              <label>Budget Name</label>
              <input type="text" value="${budget.budgetName || ''}" data-input="budgetName" ${editable ? '' : 'disabled'} />
            </div>
            <div class="form-group">
              <label>Budget Code</label>
              <input type="text" value="${budget.budgetCode || ''}" readonly />
            </div>
            <div class="form-group">
              <label>Fiscal Year</label>
              <input type="number" value="${budget.fiscalYear || new Date().getFullYear()}" data-input="fiscalYear" ${editable ? '' : 'disabled'} />
            </div>
            <div class="form-group">
              <label>Budget Type</label>
              <select data-input="budgetType" ${editable ? '' : 'disabled'}>
                <option value="Operating" ${budget.budgetType === 'Operating' ? 'selected' : ''}>Operating</option>
                <option value="Capital" ${budget.budgetType === 'Capital' ? 'selected' : ''}>Capital</option>
                <option value="Cash" ${budget.budgetType === 'Cash' ? 'selected' : ''}>Cash</option>
                <option value="Project" ${budget.budgetType === 'Project' ? 'selected' : ''}>Project</option>
                <option value="Department" ${budget.budgetType === 'Department' ? 'selected' : ''}>Department</option>
              </select>
            </div>
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" value="${budget.startDate || ''}" data-input="startDate" ${editable ? '' : 'disabled'} />
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" value="${budget.endDate || ''}" data-input="endDate" ${editable ? '' : 'disabled'} />
            </div>
            <div class="form-group form-full">
              <label>Description</label>
              <textarea rows="3" data-input="description" ${editable ? '' : 'disabled'}>${budget.description || ''}</textarea>
            </div>
          </div>

          <div class="line-items-section">
            <div class="line-items-header">
              <h4>Budget Lines</h4>
              <button type="button" data-action="add-line" class="btn-add" ${editable ? '' : 'disabled'}>+ Add Line</button>
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
                ${budget.lines.map((line, index) => `
                  <tr>
                    <td>
                      <select data-line-account data-index="${index}" ${editable ? '' : 'disabled'}>
                        <option value="">Select account</option>
                        ${this.data.accounts.map((account) => `
                          <option value="${account._id}" ${String(line.account) === String(account._id) ? 'selected' : ''}>${account.accountCode} - ${account.accountName}</option>
                        `).join('')}
                      </select>
                    </td>
                    <td>
                      <select data-line-cost-center data-index="${index}" ${editable ? '' : 'disabled'}>
                        <option value="">Select cost center</option>
                        ${this.data.costCenters.map((costCenter) => `
                          <option value="${costCenter._id}" ${String(line.costCenter) === String(costCenter._id) ? 'selected' : ''}>${costCenter.costCenterCode} - ${costCenter.costCenterName}</option>
                        `).join('')}
                      </select>
                    </td>
                    <td><input type="number" step="0.01" value="${line.budgetAmount || 0}" data-line-amount data-line-field="budgetAmount" data-index="${index}" ${editable ? '' : 'disabled'} /></td>
                    <td><input type="number" step="0.01" value="${line.actualAmount || 0}" data-line-amount data-line-field="actualAmount" data-index="${index}" ${editable ? '' : 'disabled'} /></td>
                    <td><button type="button" data-action="remove-line" data-index="${index}" class="btn-remove" ${editable && budget.lines.length > 1 ? '' : 'disabled'}>Remove</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="budget-total-row">
            <div>Total budget: <strong>$${totalBudget.toFixed(2)}</strong></div>
            <div>Total actual: <strong>$${totalActual.toFixed(2)}</strong></div>
          </div>

          <div class="form-actions">
            <button type="button" data-action="save-budget" class="btn-submit" ${editable ? '' : 'disabled'}>${this.data.saving ? 'Saving...' : 'Save Budget'}</button>
            <a href="/#/budget" class="btn-secondary">Back to Budgets</a>
          </div>
        </div>

        <style>
          .budget-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .subtitle { color: #475569; margin-bottom: 20px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .budget-form-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06); }
          .form-grid { display: grid; grid-template-columns: repeat(2, minmax(240px, 1fr)); gap: 15px; }
          .form-group { display: flex; flex-direction: column; gap: 6px; }
          .form-full { grid-column: 1 / -1; }
          .form-group input, .form-group select, .form-group textarea, .line-items-table input, .line-items-table select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
          .line-items-section { margin-top: 20px; }
          .line-items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .line-items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .line-items-table th, .line-items-table td { padding: 12px; border: 1px solid #e2e8f0; text-align: left; vertical-align: middle; }
          .line-items-table th { background: #007bff; color: white; }
          .btn-add, .btn-submit, .btn-secondary, .btn-remove { padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; }
          .btn-add { background: #0d6efd; color: white; }
          .btn-submit { background: #198754; color: white; }
          .btn-secondary { background: #6c757d; color: white; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
          .btn-remove { background: #dc3545; color: white; }
          .btn-submit:disabled, .btn-add:disabled, .btn-remove:disabled { opacity: 0.6; cursor: not-allowed; }
          .budget-total-row { display: flex; justify-content: space-between; gap: 20px; margin-top: 18px; font-weight: 700; }
          .form-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
          .page-status { margin-bottom: 16px; font-weight: 700; }
          .error { color: #dc3545; font-weight: 700; }
          @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .budget-total-row { flex-direction: column; } }
        </style>
      </div>
    `;
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
      this.registerEvents();
    }
  },

  async init(request) {
    this.data.budgetId = request?.id || '';
    await Promise.all([this.fetchReferenceData(), this.fetchBudget()]);
  },

  vignette(request) {
    return this.init(request);
  }
};

export default BudgetEdit;
