import axios from 'axios';

const Budget = {
  data: {
    budgets: [],
    accounts: [],
    costCenters: [],
    selectedBudget: null,
    budgetAnalysis: null,
    loading: false,
    showForm: false,
    editingBudgetId: null,
    successMessage: '',
    filter: {
      status: '',
      budgetType: '',
      fiscalYear: new Date().getFullYear()
    },
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

  getDefaultFormData() {
    return {
      budgetName: '',
      budgetCode: '',
      fiscalYear: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      description: '',
      budgetType: 'Operating',
      lines: [{ account: '', costCenter: '', budgetAmount: 0, actualAmount: 0 }]
    };
  },

  async fetchBudgets() {
    this.data.loading = true;
    try {
      const response = await axios.get('/api/accounting/budgets/list', {
        params: this.data.filter,
        withCredentials: true
      });
      this.data.budgets = response.data.budgets || [];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
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
      console.error('Error fetching reference data:', error);
    }
  },

  async handleSubmit() {
    try {
      this.data.loading = true;
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

      if (!payload.budgetName || !payload.budgetCode || !payload.fiscalYear || !payload.budgetType) {
        alert('Please complete the required budget fields.');
        return;
      }

      if (!payload.lines.length || payload.lines.some((line) => !line.account || !line.budgetAmount)) {
        alert('Each budget line needs an account and an amount.');
        return;
      }

      if (this.data.editingBudgetId) {
        await axios.put(`/api/accounting/budgets/${this.data.editingBudgetId}`, payload, { withCredentials: true });
        alert('Budget updated successfully.');
      } else {
        await axios.post('/api/accounting/budgets/create', payload, { withCredentials: true });
        alert('Budget created successfully.');
      }

      this.data.showForm = false;
      this.data.editingBudgetId = null;
      this.data.formData = this.getDefaultFormData();
      await this.fetchBudgets();
      this.updateView();
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  async handleApproveBudget(budgetId) {
    try {
      this.data.loading = true;
      await axios.post(`/api/accounting/budgets/${budgetId}/approve`, {}, { withCredentials: true });
      alert('Budget approved successfully.');
      await this.fetchBudgets();
      this.updateView();
    } catch (error) {
      console.error('Error approving budget:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  async handleActivateBudget(budgetId) {
    try {
      this.data.loading = true;
      await axios.post(`/api/accounting/budgets/${budgetId}/activate`, {}, { withCredentials: true });
      alert('Budget activated successfully.');
      await this.fetchBudgets();
      this.updateView();
    } catch (error) {
      console.error('Error activating budget:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  async handleDeleteBudget(budgetId) {
    if (!confirm('Delete this budget?')) return;

    try {
      this.data.loading = true;
      await axios.delete(`/api/accounting/budgets/${budgetId}`, { withCredentials: true });
      alert('Budget deleted successfully.');
      await this.fetchBudgets();
      this.updateView();
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  async handleAnalyzeBudget(budgetId) {
    try {
      this.data.loading = true;
      const response = await axios.get(`/api/accounting/budgets/${budgetId}/analysis`, { withCredentials: true });
      this.data.selectedBudget = budgetId;
      this.data.budgetAnalysis = response.data;
      this.updateView();
    } catch (error) {
      console.error('Error analyzing budget:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  startCreateBudget() {
    this.data.showForm = true;
    this.data.editingBudgetId = null;
    this.data.formData = this.getDefaultFormData();
    this.data.selectedBudget = null;
    this.updateView();
  },

  startEditBudget(budget) {
    this.data.showForm = true;
    this.data.editingBudgetId = budget._id;
    this.data.formData = {
      budgetName: budget.budgetName || '',
      budgetCode: budget.budgetCode || '',
      fiscalYear: budget.fiscalYear || new Date().getFullYear(),
      startDate: this.formatDateValue(budget.startDate),
      endDate: this.formatDateValue(budget.endDate),
      description: budget.description || '',
      budgetType: budget.budgetType || 'Operating',
      lines: (budget.lines || []).map((line) => ({
        account: line.account?._id || line.account || '',
        costCenter: line.costCenter?._id || line.costCenter || '',
        budgetAmount: line.budgetAmount || 0,
        actualAmount: line.actualAmount || 0
      }))
    };
    if (!this.data.formData.lines.length) {
      this.data.formData.lines = [{ account: '', costCenter: '', budgetAmount: 0, actualAmount: 0 }];
    }
    this.updateView();
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
    this.data.formData.lines[index][field] = field === 'budgetAmount' || field === 'actualAmount' ? parseFloat(value || 0) : value;
    this.updateView();
  },

  getVarianceColor(variance) {
    if (variance > 0) return '#28a745';
    if (variance < 0) return '#dc3545';
    return '#000';
  },

  getBudgetTotal(lines) {
    return (lines || []).reduce((sum, line) => sum + (parseFloat(line.budgetAmount) || 0), 0);
  },

  render() {
    const { budgets, accounts, costCenters, selectedBudget, budgetAnalysis, loading, showForm, editingBudgetId, filter, formData, successMessage } = this.data;
    const totalBudgetValue = budgets.reduce((sum, budget) => sum + (budget.totalBudgetAmount || 0), 0);
    const activeBudgets = budgets.filter((budget) => budget.status === 'Active').length;
    const totalActualValue = budgets.reduce((sum, budget) => sum + (budget.totalActualAmount || 0), 0);

    let content = '';
    if (showForm) {
      const totalBudget = this.getBudgetTotal(formData.lines);
      content = `
        <div class="budget-form-card">
          <div class="budget-form-header">
            <h3>${editingBudgetId ? 'Edit Budget' : 'Create Budget'}</h3>
            <button onclick="window.budgetInstance.data.showForm = false; window.budgetInstance.data.editingBudgetId = null; window.budgetInstance.data.formData = window.budgetInstance.getDefaultFormData(); window.budgetInstance.updateView();" class="btn-secondary">Cancel</button>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Budget Name</label>
              <input type="text" value="${formData.budgetName}" onchange="window.budgetInstance.data.formData.budgetName = this.value; window.budgetInstance.updateView();" required />
            </div>
            <div class="form-group">
              <label>Budget Code</label>
              <input type="text" value="${formData.budgetCode}" onchange="window.budgetInstance.data.formData.budgetCode = this.value; window.budgetInstance.updateView();" required />
            </div>
            <div class="form-group">
              <label>Fiscal Year</label>
              <input type="number" value="${formData.fiscalYear}" onchange="window.budgetInstance.data.formData.fiscalYear = parseInt(this.value) || new Date().getFullYear(); window.budgetInstance.updateView();" required />
            </div>
            <div class="form-group">
              <label>Budget Type</label>
              <select onchange="window.budgetInstance.data.formData.budgetType = this.value; window.budgetInstance.updateView();">
                <option value="Operating" ${formData.budgetType === 'Operating' ? 'selected' : ''}>Operating</option>
                <option value="Capital" ${formData.budgetType === 'Capital' ? 'selected' : ''}>Capital</option>
                <option value="Cash" ${formData.budgetType === 'Cash' ? 'selected' : ''}>Cash</option>
                <option value="Project" ${formData.budgetType === 'Project' ? 'selected' : ''}>Project</option>
                <option value="Department" ${formData.budgetType === 'Department' ? 'selected' : ''}>Department</option>
              </select>
            </div>
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" value="${formData.startDate}" onchange="window.budgetInstance.data.formData.startDate = this.value; window.budgetInstance.updateView();" />
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" value="${formData.endDate}" onchange="window.budgetInstance.data.formData.endDate = this.value; window.budgetInstance.updateView();" />
            </div>
            <div class="form-group form-full">
              <label>Description</label>
              <textarea rows="3" onchange="window.budgetInstance.data.formData.description = this.value; window.budgetInstance.updateView();">${formData.description}</textarea>
            </div>
          </div>

          <div class="line-items-section">
            <div class="line-items-header">
              <h4>Budget Lines</h4>
              <button onclick="window.budgetInstance.addLineItem();" class="btn-add">+ Add Line</button>
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
                  <tr>
                    <td>
                      <select onchange="window.budgetInstance.updateLine(${index}, 'account', this.value);">
                        <option value="">Select account</option>
                        ${accounts.map((account) => `<option value="${account._id}" ${line.account === account._id ? 'selected' : ''}>${account.accountCode} - ${account.accountName}</option>`).join('')}
                      </select>
                    </td>
                    <td>
                      <select onchange="window.budgetInstance.updateLine(${index}, 'costCenter', this.value);">
                        <option value="">Select cost center</option>
                        ${costCenters.map((costCenter) => `<option value="${costCenter._id}" ${line.costCenter === costCenter._id ? 'selected' : ''}>${costCenter.costCenterCode} - ${costCenter.costCenterName}</option>`).join('')}
                      </select>
                    </td>
                    <td><input type="number" step="0.01" value="${line.budgetAmount}" onchange="window.budgetInstance.updateLine(${index}, 'budgetAmount', this.value);" /></td>
                    <td><input type="number" step="0.01" value="${line.actualAmount}" onchange="window.budgetInstance.updateLine(${index}, 'actualAmount', this.value);" /></td>
                    <td><button onclick="window.budgetInstance.removeLineItem(${index});" class="btn-remove" ${formData.lines.length > 1 ? '' : 'disabled'}>Remove</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="budget-total">Total budget: <strong>$${totalBudget.toFixed(2)}</strong></div>
          </div>

          <div class="form-actions">
            <button onclick="window.budgetInstance.handleSubmit();" class="btn-submit" ${loading ? 'disabled' : ''}>${loading ? 'Saving...' : editingBudgetId ? 'Update Budget' : 'Create Budget'}</button>
          </div>
        </div>
      `;
    } else if (selectedBudget && budgetAnalysis) {
      content = `
        <div class="budget-analysis">
          <button onclick="window.budgetInstance.data.selectedBudget = null; window.budgetInstance.data.budgetAnalysis = null; window.budgetInstance.updateView();" class="btn-back">← Back to Budgets</button>
          <h3>${budgetAnalysis.budgetName} - Budget vs Actual Analysis</h3>
          <p>Fiscal Year: ${budgetAnalysis.fiscalYear}</p>
          <div class="summary">
            <div class="summary-item"><p>Total Budget</p><p class="amount">$${(budgetAnalysis.totalBudget || 0).toFixed(2)}</p></div>
            <div class="summary-item"><p>Total Actual</p><p class="amount">$${(budgetAnalysis.totalActual || 0).toFixed(2)}</p></div>
            <div class="summary-item"><p>Total Variance</p><p class="amount" style="color: ${this.getVarianceColor(budgetAnalysis.totalVariance)}">$${(budgetAnalysis.totalVariance || 0).toFixed(2)}</p></div>
            <div class="summary-item"><p>Variance %</p><p class="amount" style="color: ${this.getVarianceColor(budgetAnalysis.totalVariance)}">${(budgetAnalysis.variancePercent || 0).toFixed(2)}%</p></div>
          </div>
          <h4>Line Items</h4>
          <table>
            <thead><tr><th>Account</th><th>Budget</th><th>Actual</th><th>Variance</th><th>% Variance</th></tr></thead>
            <tbody>${budgetAnalysis.lines ? budgetAnalysis.lines.map((line) => {
              const variance = (line.budgetAmount || 0) - (line.actualAmount || 0);
              const variancePercent = line.budgetAmount ? ((variance / line.budgetAmount) * 100).toFixed(2) : 0;
              return `<tr><td>${line.account?.accountName || 'Unknown'}</td><td class="amount">$${(line.budgetAmount || 0).toFixed(2)}</td><td class="amount">$${(line.actualAmount || 0).toFixed(2)}</td><td class="amount" style="color:${this.getVarianceColor(variance)}">$${variance.toFixed(2)}</td><td class="amount" style="color:${this.getVarianceColor(variance)}">${variancePercent}%</td></tr>`;
            }).join('') : ''}</tbody>
          </table>
        </div>
      `;
    } else {
      content = `
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-label">Budgets</div>
            <div class="summary-value">${budgets.length}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Active budgets</div>
            <div class="summary-value">${activeBudgets}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total budgeted</div>
            <div class="summary-value">$${totalBudgetValue.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total actual</div>
            <div class="summary-value">$${totalActualValue.toFixed(2)}</div>
          </div>
        </div>

        <div class="budgets-list">
          <div class="list-header">
            <h3>Budget Register</h3>
            <a href="#/budget/new" class="btn-create">+ New Budget</a>
          </div>

          <div class="controls">
            <div class="control-group">
              <label>Status</label>
              <select onchange="window.budgetInstance.data.filter.status = this.value; window.budgetInstance.fetchBudgets().then(() => window.budgetInstance.updateView());">
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div class="control-group">
              <label>Type</label>
              <select onchange="window.budgetInstance.data.filter.budgetType = this.value; window.budgetInstance.fetchBudgets().then(() => window.budgetInstance.updateView());">
                <option value="">All Types</option>
                <option value="Operating">Operating</option>
                <option value="Capital">Capital</option>
                <option value="Cash">Cash</option>
                <option value="Project">Project</option>
                <option value="Department">Department</option>
              </select>
            </div>
            <div class="control-group">
              <label>Fiscal Year</label>
              <input type="number" value="${filter.fiscalYear}" onchange="window.budgetInstance.data.filter.fiscalYear = parseInt(this.value) || new Date().getFullYear(); window.budgetInstance.fetchBudgets().then(() => window.budgetInstance.updateView());" />
            </div>
          </div>

          ${loading ? '<p>Loading budgets...</p>' : budgets.length === 0 ? '<p>No budgets found. Create one to get started.</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Budget Code</th>
                  <th>Budget Name</th>
                  <th>Fiscal Year</th>
                  <th>Type</th>
                  <th>Total Budget</th>
                  <th>Total Actual</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${budgets.map((budget) => `
                  <tr>
                    <td>${budget.budgetCode}</td>
                    <td>${budget.budgetName}</td>
                    <td>${budget.fiscalYear}</td>
                    <td>${budget.budgetType}</td>
                    <td class="amount">$${(budget.totalBudgetAmount || 0).toFixed(2)}</td>
                    <td class="amount">$${(budget.totalActualAmount || 0).toFixed(2)}</td>
                    <td>${budget.status}</td>
                    <td>
                      <div class="action-buttons">
                        <button onclick="window.budgetInstance.handleAnalyzeBudget('${budget._id}');" class="btn-action">Analyze</button>
                        ${budget.status === 'Draft' ? `<button onclick="window.budgetInstance.startEditBudget(${JSON.stringify(budget).replace(/'/g, "\\'")});" class="btn-action btn-edit">Edit</button>` : ''}
                        ${budget.status === 'Draft' ? `<button onclick="window.budgetInstance.handleApproveBudget('${budget._id}');" class="btn-action btn-approve">Approve</button>` : ''}
                        ${budget.status === 'Approved' ? `<button onclick="window.budgetInstance.handleActivateBudget('${budget._id}');" class="btn-action btn-activate">Activate</button>` : ''}
                        ${budget.status === 'Draft' ? `<button onclick="window.budgetInstance.handleDeleteBudget('${budget._id}');" class="btn-action btn-delete">Delete</button>` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      `;
    }

    return `
      <div class="budget-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/budget" class="financial-nav-link active">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>
        <h2>Budget Management</h2>
        <p class="subtitle">Create, review, approve, activate, and analyze budgets linked to your chart of accounts and cost centers.</p>
        ${successMessage ? `<div class="success-banner">${successMessage}</div>` : ''}
        ${content}

        <style>
          .budget-container { padding: 20px; max-width: 1400px; margin: 0 auto; }
          .subtitle { color: #475569; margin-bottom: 20px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .financial-nav-link.active { background: #007bff; color: white; }
          .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; }
          .summary-card { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 16px; border-radius: 10px; }
          .summary-label { font-size: 0.9rem; opacity: 0.9; }
          .summary-value { font-size: 1.5rem; font-weight: 700; margin-top: 6px; }
          .controls { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 15px; flex-wrap: wrap; }
          .control-group { flex: 1; min-width: 200px; }
          .control-group label { display: block; margin-bottom: 5px; font-weight: bold; }
          .control-group select, .control-group input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          .budgets-list, .budget-analysis, .budget-form-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06); }
          .list-header, .budget-form-header, .line-items-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 15px; }
          .budgets-list table, .budget-analysis table, .line-items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .budgets-list th, .budgets-list td, .budget-analysis th, .budget-analysis td, .line-items-table th, .line-items-table td { padding: 12px; border: 1px solid #ddd; text-align: left; }
          .budgets-list th, .budget-analysis th, .line-items-table th { background-color: #007bff; color: white; }
          .amount { text-align: right; font-family: monospace; font-weight: bold; }
          .action-buttons { display: flex; gap: 6px; flex-wrap: wrap; }
          .btn-create, .btn-submit, .btn-add, .btn-action, .btn-secondary, .btn-back, .btn-remove { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .btn-create, .btn-submit { background-color: #28a745; color: white; }
          .btn-secondary, .btn-back { background-color: #6c757d; color: white; }
          .btn-add { background-color: #17a2b8; color: white; }
          .btn-remove { background-color: #dc3545; color: white; }
          .btn-action { background-color: #007bff; color: white; }
          .btn-edit { background-color: #ffc107; color: #1f2937; }
          .btn-approve { background-color: #6f42c1; color: white; }
          .btn-activate { background-color: #198754; color: white; }
          .btn-delete { background-color: #dc3545; color: white; }
          .form-grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 15px; }
          .form-group { display: flex; flex-direction: column; gap: 6px; }
          .form-full { grid-column: 1 / -1; }
          .form-group input, .form-group select, .form-group textarea, .line-items-table input, .line-items-table select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
          .line-items-section { margin-top: 20px; }
          .budget-total { margin-top: 8px; font-weight: 700; }
          .form-actions { margin-top: 20px; }
          .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .summary-item { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #ddd; }
          .summary-item p:first-child { font-weight: bold; margin-bottom: 10px; color: #333; }
          .summary-item p:last-child { font-size: 1.5em; margin: 0; }
          .success-banner { background: #d1fae5; border: 1px solid #10b981; color: #064e3b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
          @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
        </style>
      </div>
    `;
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
    }
  },

  async init() {
    window.budgetInstance = this;
    const budgetCreated = sessionStorage.getItem('budgetCreated');
    if (budgetCreated) {
      sessionStorage.removeItem('budgetCreated');
      this.data.successMessage = 'Budget created successfully.';
    }
    await this.fetchReferenceData();
    await this.fetchBudgets();
    this.updateView();
  },

  vignette() {
    return this.init();
  }
};

export default Budget;
