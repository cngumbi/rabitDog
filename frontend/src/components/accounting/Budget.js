import axios from 'axios';

const Budget = {
  data: {
    budgets: [],
    selectedBudget: null,
    budgetAnalysis: null,
    loading: false,
    filter: { status: '', fiscalYear: new Date().getFullYear() }
  },

  async fetchBudgets() {
    this.data.loading = true;
    try {
      const response = await axios.get('/api/accounting/budgets/list', { params: this.data.filter });
      this.data.budgets = response.data.budgets || [];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  async handleAnalyzeBudget(budgetId) {
    try {
      this.data.loading = true;
      const response = await axios.get(`/api/accounting/budgets/${budgetId}/analysis`);
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

  getVarianceColor(variance) {
    if (variance > 0) return '#28a745';
    if (variance < 0) return '#dc3545';
    return '#000';
  },

  render() {
    const { budgets, selectedBudget, budgetAnalysis, loading, filter } = this.data;

    let content = '';
    if (!selectedBudget) {
      content = `
        <div class="budgets-list">
          <h3>Budgets</h3>
          ${loading ? '<p>Loading...</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Budget Code</th>
                  <th>Budget Name</th>
                  <th>Fiscal Year</th>
                  <th>Total Budget</th>
                  <th>Total Actual</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${budgets.map(budget => `
                  <tr>
                    <td>${budget.budgetCode}</td>
                    <td>${budget.budgetName}</td>
                    <td>${budget.fiscalYear}</td>
                    <td class="amount">$${(budget.totalBudgetAmount || 0).toFixed(2)}</td>
                    <td class="amount">$${(budget.totalActualAmount || 0).toFixed(2)}</td>
                    <td>${budget.status}</td>
                    <td><button onclick="window.budgetInstance.handleAnalyzeBudget('${budget._id}');" class="btn-analyze">Analyze</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      `;
    } else {
      content = `
        <div class="budget-analysis">
          <button onclick="window.budgetInstance.data.selectedBudget = null; window.budgetInstance.updateView();" class="btn-back">← Back to Budgets</button>
          ${budgetAnalysis ? `
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
              <tbody>${budgetAnalysis.lines ? budgetAnalysis.lines.map(line => {const v = (line.budgetAmount||0)-(line.actualAmount||0); const vp = line.budgetAmount?((v/line.budgetAmount)*100).toFixed(2):0; return `<tr><td>${line.account?.accountName||'Unknown'}</td><td class="amount">$${(line.budgetAmount||0).toFixed(2)}</td><td class="amount">$${(line.actualAmount||0).toFixed(2)}</td><td class="amount" style="color:${this.getVarianceColor(v)}">$${v.toFixed(2)}</td><td class="amount" style="color:${this.getVarianceColor(v)}">${vp}%</td></tr>`;}).join('') : ''}</tbody>
            </table>
          ` : ''}
        </div>
      `;
    }

    return `
      <div class="budget-container">
        <h2>Budget Management</h2>

        <div class="controls">
          <div class="control-group">
            <label>Status:</label>
            <select onchange="window.budgetInstance.data.filter.status = this.value; window.budgetInstance.fetchBudgets().then(() => window.budgetInstance.updateView());">
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div class="control-group">
            <label>Fiscal Year:</label>
            <input type="number" value="${filter.fiscalYear}" onchange="window.budgetInstance.data.filter.fiscalYear = this.value; window.budgetInstance.fetchBudgets().then(() => window.budgetInstance.updateView());" />
          </div>
        </div>

        ${content}

        <style>
          .budget-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .controls { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 15px; flex-wrap: wrap; }
          .control-group { flex: 1; min-width: 200px; }
          .control-group label { display: block; margin-bottom: 5px; font-weight: bold; }
          .control-group select, .control-group input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          .budgets-list, .budget-analysis { background: white; padding: 20px; border-radius: 8px; }
          .budgets-list table, .budget-analysis table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .budgets-list th, .budgets-list td, .budget-analysis th, .budget-analysis td { padding: 12px; border: 1px solid #ddd; text-align: left; }
          .budgets-list th, .budget-analysis th { background-color: #007bff; color: white; }
          .amount { text-align: right; font-family: monospace; font-weight: bold; }
          .btn-analyze { padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .btn-back { padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 15px; }
          .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .summary-item { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #ddd; }
          .summary-item p:first-child { font-weight: bold; margin-bottom: 10px; color: #333; }
          .summary-item p:last-child { font-size: 1.5em; margin: 0; }
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

  init() {
    window.budgetInstance = this;
    this.fetchBudgets().then(() => this.updateView());
  }
};

export default Budget;
