import axios from 'axios';

const BudgetDetails = {
  data: {
    budgetId: '',
    budgetAnalysis: null,
    loading: false,
    error: ''
  },

  async fetchAnalysis() {
    if (!this.data.budgetId) {
      this.data.error = 'Budget not found.';
      return;
    }

    this.data.loading = true;
    this.updateView();
    try {
      const response = await axios.get(`/api/accounting/budgets/${this.data.budgetId}/analysis`, {
        withCredentials: true
      });
      this.data.budgetAnalysis = response.data;
      this.data.error = '';
    } catch (error) {
      console.error('Error loading budget analysis:', error);
      this.data.error = error.response?.data?.message || error.message || 'Unable to load budget analysis.';
      this.data.budgetAnalysis = null;
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  getVarianceColor(variance) {
    if (variance > 0) return '#28a745';
    if (variance < 0) return '#dc3545';
    return '#000';
  },

  formatCurrency(value) {
    const amount = Number(value || 0);
    return `$${amount.toFixed(2)}`;
  },

  render() {
    window.budgetDetailsInstance = this;
    const { loading, budgetAnalysis, error } = this.data;

    return `
      <div class="budget-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/budget" class="financial-nav-link">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>
        <nav class="breadcrumb">
          <a href="/#/budget" class="breadcrumb-link">Budgets</a>
          <span class="breadcrumb-separator">›</span>
          <span class="breadcrumb-current">Analysis</span>
        </nav>
        <h2>Budget Analysis</h2>
        <p class="subtitle">View a dedicated analysis page for this budget's planned versus actual performance.</p>

        ${loading ? '<p>Loading budget analysis...</p>' : error ? `<p class="error">${error}</p>` : budgetAnalysis ? `
          <div class="budget-analysis">
            <div class="budget-analysis-header">
              <div>
                <h3>${budgetAnalysis.budgetName || 'Budget Analysis'}</h3>
                <p class="subtitle">Fiscal Year: ${budgetAnalysis.fiscalYear || 'N/A'}</p>
              </div>
              <div class="detail-actions">
                <a href="/#/budget" class="btn-secondary">← Back to Budgets</a>
              </div>
            </div>

            <div class="summary">
              <div class="summary-item"><p>Total Budget</p><p class="amount">${this.formatCurrency(budgetAnalysis.totalBudget)}</p></div>
              <div class="summary-item"><p>Total Actual</p><p class="amount">${this.formatCurrency(budgetAnalysis.totalActual)}</p></div>
              <div class="summary-item"><p>Total Variance</p><p class="amount" style="color: ${this.getVarianceColor(budgetAnalysis.totalVariance)}">${this.formatCurrency(budgetAnalysis.totalVariance)}</p></div>
              <div class="summary-item"><p>Variance %</p><p class="amount" style="color: ${this.getVarianceColor(budgetAnalysis.totalVariance)}">${Number(budgetAnalysis.variancePercent || 0).toFixed(2)}%</p></div>
            </div>

            <h4>Line Item Analysis</h4>
            <table class="budget-analysis-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Cost Center</th>
                  <th class="amount">Budget</th>
                  <th class="amount">Actual</th>
                  <th class="amount">Variance</th>
                  <th class="amount">% Variance</th>
                </tr>
              </thead>
              <tbody>
                ${((budgetAnalysis.lines || []).map((line) => {
                  const budgetAmount = Number(line.budgetAmount || 0);
                  const actualAmount = Number(line.actualAmount || 0);
                  const variance = budgetAmount - actualAmount;
                  const variancePercent = budgetAmount ? ((variance / budgetAmount) * 100).toFixed(2) : '0.00';
                  return `
                    <tr>
                      <td>${line.account?.accountName || line.account || line.accountName || 'Unknown'}</td>
                      <td>${line.costCenter?.costCenterName || line.costCenter || line.costCenterName || '—'}</td>
                      <td class="amount">${this.formatCurrency(budgetAmount)}</td>
                      <td class="amount">${this.formatCurrency(actualAmount)}</td>
                      <td class="amount" style="color: ${this.getVarianceColor(variance)}">${this.formatCurrency(variance)}</td>
                      <td class="amount" style="color: ${this.getVarianceColor(variance)}">${variancePercent}%</td>
                    </tr>
                  `;
                })).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p>No analysis data available for this budget.</p>'}

        <style>
          .budget-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .subtitle { color: #475569; margin-bottom: 20px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 0.95rem; }
          .breadcrumb-link { color: #1d4ed8; text-decoration: none; font-weight: 700; }
          .breadcrumb-separator { color: #64748b; }
          .breadcrumb-current { color: #0f172a; font-weight: 700; }
          .budget-analysis { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06); }
          .budget-analysis-header { display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 20px; }
          .detail-actions { display: flex; gap: 10px; }
          .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 24px; }
          .summary-item { background: #f5f5f5; padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; }
          .summary-item p:first-child { margin-bottom: 10px; font-weight: 700; color: #334155; }
          .summary-item p:last-child { margin: 0; font-size: 1.35rem; font-weight: 700; }
          .budget-analysis-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .budget-analysis-table th, .budget-analysis-table td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
          .budget-analysis-table th { background: #007bff; color: white; }
          .amount { text-align: right; font-family: monospace; }
          .btn-secondary { display: inline-flex; align-items: center; justify-content: center; padding: 10px 14px; background: #6c757d; color: white; border-radius: 8px; text-decoration: none; font-weight: 700; }
          .error { color: #dc3545; font-weight: 700; }
          @media (max-width: 768px) { .budget-analysis-header { flex-direction: column; align-items: flex-start; } }
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

  async init(request) {
    this.data.budgetId = request?.id || '';
    await this.fetchAnalysis();
  },

  vignette(request) {
    return this.init(request);
  }
};

export default BudgetDetails;
