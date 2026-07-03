import axios from 'axios';

const JournalEntryDetails = {
  data: {
    entry: null,
    loading: false
  },

  async fetchEntry(id) {
    this.data.loading = true;
    try {
      const response = await axios.get(`/api/accounting/journal-entries/${id}`, { withCredentials: true });
      this.data.entry = response.data;
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  async handlePostEntry() {
    const entryId = this.data.entry?._id;
    if (!entryId) return;

    try {
      this.data.loading = true;
      await axios.post(`/api/accounting/journal-entries/${entryId}/post`, {}, { withCredentials: true });
      alert('Journal entry posted successfully!');
      await this.fetchEntry(entryId);
      this.updateView();
    } catch (error) {
      console.error('Error posting entry:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  render() {
    const { entry, loading } = this.data;

    if (loading && !entry) {
      return '<div class="journal-entry-container"><p>Loading journal entry...</p></div>';
    }

    if (!entry) {
      return '<div class="journal-entry-container"><p>Journal entry not found.</p></div>';
    }

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
            <h2>${entry.entryNumber}</h2>
            <p class="subtitle">${entry.description}</p>
          </div>
          <div class="actions">
            <a href="#/journal-entries" class="btn-cancel">Back</a>
            ${entry.status === 'Draft' ? `<button type="button" class="btn-submit" data-post-entry>Post Entry</button>` : ''}
          </div>
        </div>

        <div class="entry-details-card">
          <div class="meta-grid">
            <div><strong>Status</strong><div>${entry.status}</div></div>
            <div><strong>Entry Type</strong><div>${entry.entryType}</div></div>
            <div><strong>Reference</strong><div>${entry.referenceNumber || '—'}</div></div>
            <div><strong>Total Debit</strong><div>Ksh${Number(entry.totalDebit || 0).toFixed(2)}</div></div>
            <div><strong>Total Credit</strong><div>Ksh${Number(entry.totalCredit || 0).toFixed(2)}</div></div>
            <div><strong>Balanced</strong><div>${entry.isBalanced ? 'Yes' : 'No'}</div></div>
          </div>

          <h3>Line Items</h3>
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              ${(entry.lines || []).map((line) => `
                <tr>
                  <td>${line.account?.accountCode || line.account || '—'}${line.account?.accountName ? ` - ${line.account.accountName}` : ''}</td>
                  <td>${line.description || '—'}</td>
                  <td>Ksh${Number(line.debit || 0).toFixed(2)}</td>
                  <td>Ksh${Number(line.credit || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <style>
          .journal-entry-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
          .subtitle { color: #475569; margin: 4px 0 0; }
          .actions { display: flex; gap: 10px; }
          .entry-details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
          .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
          .meta-grid > div { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background: #2563eb; color: white; }
          .btn-submit, .btn-cancel { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; text-decoration: none; }
          .btn-submit { background: #16a34a; color: white; }
          .btn-cancel { background: #64748b; color: white; }
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

    const button = container.querySelector('[data-post-entry]');
    if (button) {
      button.addEventListener('click', () => this.handlePostEntry());
    }
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
      this.registerEvents();
    }
  },

  async init(request) {
    const id = request?.id || request?.params?.id;
    if (id) {
      await this.fetchEntry(id);
      this.updateView();
    }
  },

  async vignette(request) {
    return this.init(request);
  }
};

export default JournalEntryDetails;
