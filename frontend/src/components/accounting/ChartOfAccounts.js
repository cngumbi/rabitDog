import axios from 'axios';

const ChartOfAccounts = {
  data: {
    accounts: [],
    loading: false,
    search: '',
    filter: 'all',
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    selectedAccountId: null,
    selectedAccount: null
  },

  async fetchAccounts() {
    this.data.loading = true;
    try {
      const params = {
        skip: (this.data.currentPage - 1) * this.data.itemsPerPage,
        limit: this.data.itemsPerPage
      };
      if (this.data.search) params.search = this.data.search;
      if (this.data.filter === 'active') params.isActive = true;
      if (this.data.filter === 'inactive') params.isActive = false;

      const response = await axios.get('/api/accounting/chart-of-accounts/list', {
        params,
        withCredentials: true
      });
      this.data.accounts = response.data.accounts || [];
      this.data.totalItems = response.data.total || 0;
      this.syncSelectedAccount();
    } catch (error) {
      console.error('Error fetching chart of accounts:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
      this.data.accounts = [];
      this.data.totalItems = 0;
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  async handleDeactivate(accountId) {
    if (!confirm('Are you sure you want to deactivate this account?')) return;
    try {
      this.data.loading = true;
      await axios.delete(`/api/accounting/chart-of-accounts/${accountId}`, { withCredentials: true });
      alert('Account deactivated successfully.');
      await this.fetchAccounts();
    } catch (error) {
      console.error('Error deactivating account:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  async handlePageChange(page) {
    const totalPages = Math.max(1, Math.ceil(this.data.totalItems / this.data.itemsPerPage));
    if (page < 1 || page > totalPages || page === this.data.currentPage) return;
    this.data.currentPage = page;
    await this.fetchAccounts();
  },

  syncSelectedAccount() {
    if (!this.data.accounts.length) {
      this.data.selectedAccount = null;
      this.data.selectedAccountId = null;
      return;
    }

    if (this.data.selectedAccountId) {
      const match = this.data.accounts.find((account) => account._id === this.data.selectedAccountId);
      if (match) {
        this.data.selectedAccount = match;
        return;
      }
    }

    const firstAccount = this.data.accounts[0];
    this.data.selectedAccountId = firstAccount?._id || null;
    this.data.selectedAccount = firstAccount || null;
  },

  selectAccount(accountId) {
    this.data.selectedAccountId = accountId;
    this.data.selectedAccount = this.data.accounts.find((account) => account._id === accountId) || null;
    this.updateView();
  },

  formatCurrency(value) {
    const amount = Number(value || 0);
    return `Ksh${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  setFilter(filter) {
    this.data.filter = filter;
    this.data.currentPage = 1;
    this.fetchAccounts();
  },

  setSearch(value) {
    this.data.search = value;
    this.data.currentPage = 1;
    this.fetchAccounts();
  },

  render() {
    const { accounts, loading, filter, search, currentPage, itemsPerPage, totalItems, selectedAccount } = this.data;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    return `
      <div class="chart-account-container">
        <div class="financial-nav">
          <a href="#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="#/budget" class="financial-nav-link">Budgets</a>
          <a href="#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="#/invoices" class="financial-nav-link">Invoices</a>
          <a href="#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>

        <div class="page-header">
          <div>
            <h2>Chart of Accounts</h2>
            <p class="subtitle">Manage account ledger definitions, balances, and status.</p>
          </div>
          <div class="actions-row">
            <a href="#/account/add" class="btn-create">New Account</a>
          </div>
        </div>

        <div class="list-controls">
          <div class="search-box">
            <input type="text" placeholder="Search by code or name" value="${search}" data-search-input />
          </div>
          <div class="filter-box">
            <select data-filter-select>
              <option value="all" ${filter === 'all' ? 'selected' : ''}>All accounts</option>
              <option value="active" ${filter === 'active' ? 'selected' : ''}>Active</option>
              <option value="inactive" ${filter === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
        </div>

        <div class="accounts-list">
          ${loading ? '<p>Loading accounts...</p>' : `
            <div class="account-layout">
              <div class="account-table-panel">
                <table>
                  <thead>
                    <tr>
                      <th>Account Code</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Sub Type</th>
                      <th>Balance</th>
                      <th>Normal Balance</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${accounts.length ? accounts.map((account) => `
                      <tr class="account-row ${selectedAccount && selectedAccount._id === account._id ? 'selected-row' : ''}" data-select-account="${account._id}">
                        <td>${account.accountCode}</td>
                        <td>${account.accountName}</td>
                        <td>${account.accountType}</td>
                        <td>${account.subType || '—'}</td>
                        <td class="amount">${this.formatCurrency(account.liveBalance ?? account.currentBalance ?? 0)}</td>
                        <td>${account.normalBalance}</td>
                        <td>${account.isActive ? 'Active' : 'Inactive'}</td>
                        <td class="actions-cell">
                          <a href="#/account/${account._id}/edit" class="btn-action btn-edit">Edit</a>
                          ${account.isActive ? `<button type="button" class="btn-action btn-delete" data-deactivate="${account._id}">Deactivate</button>` : ''}
                        </td>
                      </tr>
                    `).join('') : '<tr><td colspan="8">No accounts found.</td></tr>'}
                  </tbody>
                </table>
              </div>

              <div class="account-detail-panel">
                ${selectedAccount ? `
                  <div class="account-detail-card">
                    <h3>${selectedAccount.accountName}</h3>
                    <p class="detail-code">${selectedAccount.accountCode}</p>
                    <div class="detail-grid">
                      <div>
                        <span class="detail-label">Type</span>
                        <strong>${selectedAccount.accountType}</strong>
                      </div>
                      <div>
                        <span class="detail-label">Sub Type</span>
                        <strong>${selectedAccount.subType || '—'}</strong>
                      </div>
                      <div>
                        <span class="detail-label">Live Balance</span>
                        <strong>${this.formatCurrency(selectedAccount.liveBalance ?? selectedAccount.currentBalance ?? 0)}</strong>
                      </div>
                      <div>
                        <span class="detail-label">Opening Balance</span>
                        <strong>${this.formatCurrency(selectedAccount.openingBalance || 0)}</strong>
                      </div>
                    </div>
                    <p class="detail-status">Status: ${selectedAccount.isActive ? 'Active' : 'Inactive'} • Normal balance: ${selectedAccount.normalBalance}</p>
                  </div>
                ` : '<p>Select an account to see details.</p>'}
              </div>
            </div>

            <div class="pagination-controls">
              <button type="button" class="btn-page" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>Previous</button>
              <span>Page ${currentPage} of ${totalPages}</span>
              <button type="button" class="btn-page" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
            </div>
          `}
        </div>

        <style>
          .chart-account-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
          .subtitle { color: #475569; margin: 4px 0 0; }
          .actions-row { display: flex; gap: 10px; }
          .btn-create, .btn-action { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
          .btn-create { background: #16a34a; color: white; }
          .btn-action { background: #2563eb; color: white; margin-right: 8px; }
          .btn-delete { background: #dc2626; }
          .list-controls { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
          .search-box input, .filter-box select { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; width: 250px; }
          .accounts-list table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 12px 10px; border: 1px solid #e2e8f0; text-align: left; }
          th { background: #2563eb; color: white; }
          .amount { text-align: right; font-family: monospace; }
          .actions-cell { white-space: nowrap; }
          .account-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items: start; }
          .account-table-panel { overflow-x: auto; }
          .account-row { cursor: pointer; }
          .account-row:hover, .selected-row { background: #eff6ff; }
          .account-detail-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
          .account-detail-card h3 { margin: 0 0 4px; }
          .detail-code { color: #475569; margin: 0 0 12px; font-weight: 600; }
          .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
          .detail-label { display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 4px; }
          .detail-status { color: #334155; margin: 0; font-size: 0.95rem; }
          @media (max-width: 900px) { .account-layout { grid-template-columns: 1fr; } }
          .pagination-controls { display: flex; gap: 10px; align-items: center; margin-top: 14px; }
          .btn-page { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: white; color: #0f172a; cursor: pointer; }
          .btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
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

  registerEvents() {
    const container = document.getElementById('main-content');
    if (!container) return;

    const searchInput = container.querySelector('[data-search-input]');
    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        this.data.search = event.target.value;
        this.data.currentPage = 1;
        this.fetchAccounts();
      });
    }

    const filterSelect = container.querySelector('[data-filter-select]');
    if (filterSelect) {
      filterSelect.addEventListener('change', (event) => {
        this.setFilter(event.target.value);
      });
    }

    container.querySelectorAll('[data-select-account]').forEach((row) => {
      row.addEventListener('click', () => this.selectAccount(row.dataset.selectAccount));
    });

    container.querySelectorAll('[data-deactivate]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        this.handleDeactivate(button.dataset.deactivate);
      });
    });

    container.querySelectorAll('[data-page]').forEach((button) => {
      const page = Number(button.dataset.page);
      if (!Number.isNaN(page)) {
        button.addEventListener('click', () => this.handlePageChange(page));
      }
    });
  },

  async init() {
    await this.fetchAccounts();
  },

  vignette() {
    return this.init();
  }
};

export default ChartOfAccounts;
