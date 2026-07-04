import axios from 'axios';

const CostCenters = {
  data: {
    costCenters: [],
    loading: false,
    search: '',
    filter: 'all',
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  },

  async fetchCostCenters() {
    this.data.loading = true;
    this.updateView();
    try {
      const params = {
        skip: (this.data.currentPage - 1) * this.data.itemsPerPage,
        limit: this.data.itemsPerPage
      };
      if (this.data.filter === 'active') params.isActive = true;
      if (this.data.filter === 'inactive') params.isActive = false;

      const response = await axios.get('/api/accounting/cost-centers/list', {
        params,
        withCredentials: true
      });
      this.data.costCenters = response.data.costCenters || [];
      this.data.totalItems = response.data.total || 0;
    } catch (error) {
      console.error('Error fetching cost centers:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
      this.data.costCenters = [];
      this.data.totalItems = 0;
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  async handleDeactivate(costCenterId) {
    if (!confirm('Are you sure you want to deactivate this cost center?')) return;
    try {
      this.data.loading = true;
      this.updateView();
      await axios.delete(`/api/accounting/cost-centers/${costCenterId}`, { withCredentials: true });
      alert('Cost center deactivated successfully.');
      await this.fetchCostCenters();
    } catch (error) {
      console.error('Error deactivating cost center:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  async handleFilterChange(filter) {
    this.data.filter = filter;
    this.data.currentPage = 1;
    await this.fetchCostCenters();
  },

  async handlePageChange(page) {
    const totalPages = Math.max(1, Math.ceil(this.data.totalItems / this.data.itemsPerPage));
    if (page < 1 || page > totalPages || page === this.data.currentPage) return;
    this.data.currentPage = page;
    await this.fetchCostCenters();
  },

  setSearch(value) {
    this.data.search = value;
    this.updateView();
  },

  formatCurrency(value) {
    const amount = Number(value || 0);
    return `Ksh${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  getFilteredCostCenters() {
    const searchTerm = String(this.data.search || '').trim().toLowerCase();
    if (!searchTerm) return this.data.costCenters;
    return this.data.costCenters.filter((center) => {
      return (
        String(center.costCenterCode || '').toLowerCase().includes(searchTerm) ||
        String(center.costCenterName || '').toLowerCase().includes(searchTerm) ||
        String(center.department || '').toLowerCase().includes(searchTerm)
      );
    });
  },

  render() {
    window.costCentersInstance = this;
    const { loading, filter, currentPage, itemsPerPage, totalItems } = this.data;
    const costCenters = this.getFilteredCostCenters();
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    return `
      <div class="cost-center-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/accounts" class="financial-nav-link">Chart of Accounts</a>
          <a href="/#/cost-centers" class="financial-nav-link active">Cost Centers</a>
          <a href="/#/budget" class="financial-nav-link">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>

        <div class="page-header">
          <div>
            <h2>Cost Centers</h2>
            <p class="subtitle">Manage cost center codes, departments, budgets, and spend status.</p>
          </div>
          <div class="actions-row">
            <a href="/#/cost-centers/new" class="btn-create">New Cost Center</a>
            <select data-filter-select>
              <option value="all" ${filter === 'all' ? 'selected' : ''}>All</option>
              <option value="active" ${filter === 'active' ? 'selected' : ''}>Active</option>
              <option value="inactive" ${filter === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
            <input type="text" placeholder="Search by code, name or department" value="${this.data.search}" data-search-input />
          </div>
        </div>

        <div class="table-card">
          ${loading ? '<p>Loading cost centers...</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${costCenters.length ? costCenters.map((center) => `
                  <tr>
                    <td>${center.costCenterCode}</td>
                    <td>${center.costCenterName}</td>
                    <td>${center.department || '—'}</td>
                    <td>${center.costType || 'Other'}</td>
                    <td class="amount">${this.formatCurrency(center.budget)}</td>
                    <td class="amount">${this.formatCurrency(center.spent)}</td>
                    <td>${center.isActive ? 'Active' : 'Inactive'}</td>
                    <td class="actions-cell">
                      <a href="/#/cost-centers/${center._id}" class="btn-action btn-view">View</a>
                      <a href="/#/cost-centers/${center._id}/edit" class="btn-action btn-edit">Edit</a>
                      ${center.isActive ? `<button type="button" class="btn-action btn-delete" data-deactivate="${center._id}">Deactivate</button>` : ''}
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="8">No cost centers found.</td></tr>'}
              </tbody>
            </table>
            <div class="pagination-controls">
              <button type="button" class="btn-page" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>Previous</button>
              <span>Page ${currentPage} of ${totalPages}</span>
              <button type="button" class="btn-page" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
            </div>
          `}
        </div>

        <style>
          .cost-center-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
          .subtitle { color: #475569; margin: 4px 0 0; }
          .actions-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
          .actions-row input, .actions-row select { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; }
          .btn-create, .btn-action { padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; color: white; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
          .btn-create { background: #16a34a; }
          .btn-action { background: #dc2626; }
          .table-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 12px 10px; border: 1px solid #e2e8f0; text-align: left; }
          th { background: #2563eb; color: white; }
          .amount { text-align: right; font-family: monospace; }
          .actions-cell { white-space: nowrap; }
          .pagination-controls { display: flex; gap: 10px; align-items: center; margin-top: 14px; }
          .btn-page { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: white; color: #0f172a; cursor: pointer; }
          .btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .financial-nav-link.active { background: #2563eb; color: white; }
          @media (max-width: 900px) { .actions-row { flex-direction: column; align-items: stretch; } }
        </style>
      </div>
    `;
  },

  registerEvents() {
    const container = document.getElementById('main-content');
    if (!container) return;

    const filterSelect = container.querySelector('[data-filter-select]');
    if (filterSelect) {
      filterSelect.addEventListener('change', (event) => {
        this.handleFilterChange(event.target.value);
      });
    }

    const searchInput = container.querySelector('[data-search-input]');
    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        this.setSearch(event.target.value);
      });
    }

    container.querySelectorAll('[data-deactivate]').forEach((button) => {
      button.addEventListener('click', () => {
        const costCenterId = button.getAttribute('data-deactivate');
        if (costCenterId) {
          this.handleDeactivate(costCenterId);
        }
      });
    });

    container.querySelectorAll('[data-page]').forEach((button) => {
      button.addEventListener('click', () => {
        const pageValue = Number(button.getAttribute('data-page'));
        this.handlePageChange(pageValue);
      });
    });
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
      this.registerEvents();
    }
  },

  init() {
    window.costCentersInstance = this;
    this.fetchCostCenters();
  },

  vignette() {
    return this.init();
  }
};

export default CostCenters;
