import axios from 'axios';

const JournalEntry = {
  data: {
    entries: [],
    loading: false,
    filter: { status: '' },
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  },

  async fetchEntries() {
    this.data.loading = true;
    try {
      const params = {
        skip: (this.data.currentPage - 1) * this.data.itemsPerPage,
        limit: this.data.itemsPerPage
      };

      const status = String(this.data.filter.status || '').trim();
      if (status) {
        params.status = status;
      }

      const response = await axios.get('/api/accounting/journal-entries/list', {
        params,
        withCredentials: true
      });
      this.data.entries = response.data.entries || [];
      this.data.totalItems = response.data.total || 0;
    } catch (error) {
      console.error('Error fetching entries:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  async handlePostEntry(entryId) {
    try {
      this.data.loading = true;
      await axios.post(`/api/accounting/journal-entries/${entryId}/post`, {}, { withCredentials: true });
      alert('Entry posted successfully!');
      await this.fetchEntries();
      this.updateView();
    } catch (error) {
      console.error('Error posting entry:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  async handleFilterChange(status) {
    this.data.filter.status = status;
    this.data.currentPage = 1;
    await this.fetchEntries();
    this.updateView();
  },

  render() {
    const { entries, loading, filter } = this.data;

    return `
      <div class="journal-entry-container">
        <div class="financial-nav">
          <a href="#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="#/budget" class="financial-nav-link">Budgets</a>
          <a href="#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="#/invoices" class="financial-nav-link">Invoices</a>
          <a href="#/journal-entries" class="financial-nav-link active">Journal Entries</a>
        </div>

        <div class="page-header">
          <div>
            <h2>Journal Entry Management</h2>
            <p class="subtitle">Review, post, and inspect manual journal entries.</p>
          </div>
          <div class="actions-row">
            <a href="#/journal-entries/create" class="btn-create">Create New Entry</a>
            <select data-status-filter>
              <option value="" ${filter.status === '' ? 'selected' : ''}>All Status</option>
              <option value="Draft" ${filter.status === 'Draft' ? 'selected' : ''}>Draft</option>
              <option value="Posted" ${filter.status === 'Posted' ? 'selected' : ''}>Posted</option>
              <option value="Reversed" ${filter.status === 'Reversed' ? 'selected' : ''}>Reversed</option>
            </select>
          </div>
        </div>

        <div class="entries-list">
          <h3>Journal Entries</h3>
          ${loading ? '<p>Loading...</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Entry Number</th>
                  <th>Description</th>
                  <th>Entry Type</th>
                  <th>Status</th>
                  <th>Total Debit</th>
                  <th>Total Credit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${entries.length ? entries.map((entry) => `
                  <tr>
                    <td>${entry.entryNumber}</td>
                    <td>${entry.description}</td>
                    <td>${entry.entryType}</td>
                    <td>${entry.status}</td>
                    <td class="amount">Ksh${(entry.totalDebit || 0).toFixed(2)}</td>
                    <td class="amount">Ksh${(entry.totalCredit || 0).toFixed(2)}</td>
                    <td class="actions-cell">
                      <a href="#/journal-entries/${entry._id}" class="btn-action btn-view">View</a>
                      ${entry.status === 'Draft' ? `<button type="button" onclick="window.journalEntryInstance.handlePostEntry('${entry._id}');" class="btn-action">Post</button>` : ''}
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="7">No journal entries found.</td></tr>'}
              </tbody>
            </table>
          `}
        </div>

        <style>
          .journal-entry-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
          .subtitle { color: #475569; margin: 4px 0 0; }
          .actions-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
          .actions-row select { padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
          .btn-create, .btn-action, .btn-view { padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
          .btn-create { background: #16a34a; color: white; }
          .btn-action { background: #2563eb; color: white; }
          .btn-view { background: #0f766e; color: white; }
          .entries-list { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .entries-list table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .entries-list th, .entries-list td { padding: 12px; border: 1px solid #e2e8f0; text-align: left; }
          .entries-list th { background-color: #2563eb; color: white; }
          .amount { text-align: right; font-family: monospace; }
          .actions-cell { white-space: nowrap; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .financial-nav-link.active { background: #2563eb; color: white; }
        </style>
      </div>
    `;
  },

  registerEvents() {
    const container = document.getElementById('main-content');
    if (!container) return;

    const filterSelect = container.querySelector('[data-status-filter]');
    if (filterSelect) {
      filterSelect.addEventListener('change', (event) => {
        this.handleFilterChange(event.target.value);
      });
    }
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
      this.registerEvents();
    }
  },

  init() {
    window.journalEntryInstance = this;
    this.fetchEntries().then(() => this.updateView());
  },

  vignette() {
    return this.init();
  }
};

export default JournalEntry;
