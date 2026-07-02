import axios from 'axios';

const JournalEntry = {
  data: {
    entries: [],
    loading: false,
    showForm: false,
    filter: { status: '' },
    formData: {
      description: '',
      entryType: 'Manual',
      lines: [{ account: '', debit: 0, credit: 0 }],
    }
  },

  async fetchEntries() {
    this.data.loading = true;
    try {
      const response = await axios.get('/api/accounting/journal-entries/list', { 
        params: this.data.filter 
      });
      this.data.entries = response.data.entries || [];
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
      await axios.post(`/api/accounting/journal-entries/${entryId}/post`);
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

  async handleSubmit() {
    try {
      this.data.loading = true;
      await axios.post('/api/accounting/journal-entries/create', this.data.formData);
      alert('Journal entry created successfully!');
      this.data.formData = {
        description: '',
        entryType: 'Manual',
        lines: [{ account: '', debit: 0, credit: 0 }],
      };
      this.data.showForm = false;
      await this.fetchEntries();
      this.updateView();
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  calculateTotals() {
    const totalDebit = this.data.formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredit = this.data.formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    return { totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 };
  },

  render() {
    const { entries, loading, showForm, filter, formData } = this.data;
    const { totalDebit, totalCredit, isBalanced } = this.calculateTotals();

    let formContent = '';
    if (showForm) {
      formContent = `
        <div class="create-entry-form">
          <h3>Create New Entry</h3>
          <div class="form-group">
            <label>Description</label>
            <input type="text" value="${formData.description}" onchange="window.journalEntryInstance.data.formData.description = this.value;" required />
          </div>
          <div class="form-group">
            <label>Entry Type</label>
            <select onchange="window.journalEntryInstance.data.formData.entryType = this.value;">
              <option value="Manual">Manual</option>
              <option value="Sales">Sales</option>
              <option value="Purchase">Purchase</option>
              <option value="Payment">Payment</option>
              <option value="Adjustment">Adjustment</option>
            </select>
          </div>

          <div class="line-items">
            <h4>Line Items</h4>
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${formData.lines.map((line, idx) => `
                  <tr>
                    <td><input type="text" value="${line.account}" onchange="window.journalEntryInstance.data.formData.lines[${idx}].account = this.value;" /></td>
                    <td><input type="number" step="0.01" value="${line.debit}" onchange="window.journalEntryInstance.data.formData.lines[${idx}].debit = parseFloat(this.value); window.journalEntryInstance.updateView();" /></td>
                    <td><input type="number" step="0.01" value="${line.credit}" onchange="window.journalEntryInstance.data.formData.lines[${idx}].credit = parseFloat(this.value); window.journalEntryInstance.updateView();" /></td>
                    <td><button onclick="window.journalEntryInstance.data.formData.lines.splice(${idx}, 1); window.journalEntryInstance.updateView();" class="btn-remove">Remove</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="line-totals">
              <p>Total Debit: <span class="amount">$${totalDebit.toFixed(2)}</span></p>
              <p>Total Credit: <span class="amount">$${totalCredit.toFixed(2)}</span></p>
              <p class="${isBalanced ? 'balanced' : 'unbalanced'}">
                ${isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
              </p>
            </div>

            <button onclick="window.journalEntryInstance.data.formData.lines.push({ account: '', debit: 0, credit: 0 }); window.journalEntryInstance.updateView();" class="btn-add">Add Line Item</button>
          </div>

          <div class="form-actions">
            <button onclick="window.journalEntryInstance.handleSubmit();" class="btn-submit" ${!isBalanced ? 'disabled' : ''}>Create Entry</button>
            <button onclick="window.journalEntryInstance.data.showForm = false; window.journalEntryInstance.updateView();" class="btn-cancel">Cancel</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="journal-entry-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/budget" class="financial-nav-link">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link active">Journal Entries</a>
        </div>
        <h2>Journal Entry Management</h2>

        <div class="controls">
          <button onclick="window.journalEntryInstance.data.showForm = true; window.journalEntryInstance.updateView();" class="btn-create">Create New Entry</button>

          <div class="filter-group">
            <label>Filter by Status:</label>
            <select onchange="window.journalEntryInstance.data.filter.status = this.value; window.journalEntryInstance.fetchEntries().then(() => window.journalEntryInstance.updateView());">
              <option value="">All</option>
              <option value="Draft">Draft</option>
              <option value="Posted">Posted</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>
        </div>

        ${formContent}

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
                ${entries.map(entry => `
                  <tr>
                    <td>${entry.entryNumber}</td>
                    <td>${entry.description}</td>
                    <td>${entry.entryType}</td>
                    <td>${entry.status}</td>
                    <td class="amount">$${(entry.totalDebit || 0).toFixed(2)}</td>
                    <td class="amount">$${(entry.totalCredit || 0).toFixed(2)}</td>
                    <td>
                      ${entry.status === 'Draft' ? `<button onclick="window.journalEntryInstance.handlePostEntry('${entry._id}');" class="btn-action">Post</button>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>

        <style>
          .journal-entry-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .controls { margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
          .btn-create { padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .filter-group { display: flex; gap: 10px; align-items: center; }
          .filter-group label { font-weight: bold; }
          .filter-group select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          .create-entry-form { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .form-group { margin-bottom: 15px; }
          .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
          .form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
          .line-items { margin-top: 20px; }
          .line-items table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .line-items th, .line-items td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          .line-items th { background-color: #007bff; color: white; }
          .line-items input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
          .line-totals { background: #e8f4f8; padding: 15px; border-radius: 4px; margin: 10px 0; font-weight: bold; }
          .amount { text-align: right; font-family: monospace; }
          .balanced { color: green; }
          .unbalanced { color: red; }
          .btn-remove, .btn-add, .btn-submit, .btn-cancel, .btn-action { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .btn-add { background-color: #17a2b8; color: white; margin-top: 10px; }
          .btn-remove { background-color: #dc3545; color: white; }
          .btn-submit { background-color: #28a745; color: white; }
          .btn-submit:disabled { background-color: #ccc; cursor: not-allowed; }
          .btn-cancel { background-color: #6c757d; color: white; }
          .btn-action { background-color: #007bff; color: white; font-size: 0.9em; }
          .form-actions { display: flex; gap: 10px; margin-top: 20px; }
          .form-actions button { flex: 1; }
          .entries-list { background: white; padding: 20px; border-radius: 8px; }
          .entries-list table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .financial-nav-link.active { background: #007bff; color: white; }
          .entries-list th, .entries-list td { padding: 12px; border: 1px solid #ddd; text-align: left; }
          .entries-list th { background-color: #007bff; color: white; }
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
    window.journalEntryInstance = this;
    this.fetchEntries().then(() => this.updateView());
  }
};

export default JournalEntry;
