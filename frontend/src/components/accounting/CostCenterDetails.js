import axios from 'axios';

const CostCenterDetails = {
  data: {
    costCenterId: '',
    loading: false,
    costCenter: null
  },

  async fetchCostCenter() {
    if (!this.data.costCenterId) return;
    this.data.loading = true;
    this.updateView();
    try {
      const response = await axios.get(`/api/accounting/cost-centers/${this.data.costCenterId}`, {
        withCredentials: true
      });
      this.data.costCenter = response.data;
    } catch (error) {
      console.error('Error loading cost center:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
      this.data.costCenter = null;
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  formatCurrency(value) {
    const amount = Number(value || 0);
    return `Ksh${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  render() {
    window.costCenterDetailsInstance = this;
    const { loading, costCenter } = this.data;

    return `
      <div class="budget-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/accounts" class="financial-nav-link">Chart of Accounts</a>
          <a href="/#/cost-centers" class="financial-nav-link">Cost Centers</a>
          <a href="/#/budget" class="financial-nav-link">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>

        <h2>Cost Center Details</h2>
        <p class="subtitle">Review the code, budget, and spending for this cost center.</p>

        ${loading ? '<p>Loading cost center details...</p>' : costCenter ? `
          <div class="detail-card">
            <div class="detail-grid">
              <div>
                <span class="detail-label">Code</span>
                <strong>${costCenter.costCenterCode}</strong>
              </div>
              <div>
                <span class="detail-label">Name</span>
                <strong>${costCenter.costCenterName}</strong>
              </div>
              <div>
                <span class="detail-label">Department</span>
                <strong>${costCenter.department || '—'}</strong>
              </div>
              <div>
                <span class="detail-label">Type</span>
                <strong>${costCenter.costType || 'Other'}</strong>
              </div>
              <div>
                <span class="detail-label">Budget</span>
                <strong>${this.formatCurrency(costCenter.budget)}</strong>
              </div>
              <div>
                <span class="detail-label">Spent</span>
                <strong>${this.formatCurrency(costCenter.spent)}</strong>
              </div>
              <div>
                <span class="detail-label">Status</span>
                <strong>${costCenter.isActive ? 'Active' : 'Inactive'}</strong>
              </div>
              <div class="detail-actions">
                <a href="/#/cost-centers/${this.data.costCenterId}/edit" class="btn-action btn-edit">Edit Cost Center</a>
                <a href="/#/cost-centers" class="btn-secondary">Back to List</a>
              </div>
            </div>
            <div class="detail-description">
              <h3>Description</h3>
              <p>${costCenter.description || 'No description provided.'}</p>
            </div>
          </div>
        ` : '<p>Cost center not found.</p>'}

        <style>
          .budget-container { padding: 20px; max-width: 900px; margin: 0 auto; }
          .subtitle { color: #475569; margin-bottom: 20px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .detail-card { background: white; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 16px; }
          .detail-label { display: block; color: #64748b; margin-bottom: 6px; }
          .detail-actions { display: flex; gap: 10px; align-items: center; grid-column: 1 / -1; margin-top: 10px; }
          .btn-action, .btn-secondary { padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
          .btn-edit { background: #2563eb; color: white; }
          .btn-secondary { background: #6c757d; color: white; }
          .detail-description { margin-top: 24px; }
          .detail-description h3 { margin-bottom: 8px; }
          @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
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
    this.data.costCenterId = request?.id || '';
    await this.fetchCostCenter();
  },

  vignette(request) {
    return this.init(request);
  }
};

export default CostCenterDetails;
