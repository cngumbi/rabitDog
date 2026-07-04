import axios from 'axios';

const JournalEntryCreate = {
  data: {
    loading: false,
    accounts: [],
    accountSearch: '',
    activeLineIndex: 0,
    formData: {
      description: '',
      entryType: 'Manual',
      referenceNumber: '',
      lines: [{ account: '', debit: 0, credit: 0, description: '' }]
    }
  },

  filteredAccounts() {
    const query = (this.data.accountSearch || '').toLowerCase();
    if (!query) return this.data.accounts;
    return this.data.accounts.filter((account) => {
      const label = `${account.accountCode || ''} ${account.accountName || ''}`.toLowerCase();
      return label.includes(query);
    });
  },

  calculateTotals() {
    const totalDebit = this.data.formData.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = this.data.formData.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    return {
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
    };
  },

  generateReferenceNumber() {
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const randomSuffix = Math.floor(Math.random() * 900 + 100);
    return `REF-${timestamp}-${randomSuffix}`;
  },

  addLineItem() {
    this.data.formData.lines.push({ account: '', debit: 0, credit: 0, description: '' });
    this.updateView();
  },

  removeLineItem(index) {
    if (this.data.formData.lines.length <= 1) return;
    this.data.formData.lines.splice(index, 1);
    this.updateView();
  },

  updateLineValue(index, field, value) {
    const line = this.data.formData.lines[index];
    if (!line) return;

    if (field === 'account') {
      line.account = value;
    } else if (field === 'debit') {
      line.debit = Number(value) || 0;
    } else if (field === 'credit') {
      line.credit = Number(value) || 0;
    } else if (field === 'description') {
      line.description = value;
    }

    this.refreshTotals();
  },

  refreshTotals() {
    const container = document.getElementById('main-content');
    if (!container) return;

    const totals = this.calculateTotals();
    const debitEl = container.querySelector('[data-total-debit]');
    const creditEl = container.querySelector('[data-total-credit]');
    const balanceEl = container.querySelector('[data-balance-state]');

    if (debitEl) debitEl.textContent = `Ksh${totals.totalDebit.toFixed(2)}`;
    if (creditEl) creditEl.textContent = `Ksh${totals.totalCredit.toFixed(2)}`;
    if (balanceEl) {
      balanceEl.textContent = totals.isBalanced ? 'Balanced' : 'Not balanced';
      balanceEl.className = totals.isBalanced ? 'balance-pill balanced' : 'balance-pill unbalanced';
    }
  },

  async handleSubmit() {
    try {
      this.data.loading = true;

      if (!this.data.formData.referenceNumber) {
        this.data.formData.referenceNumber = this.generateReferenceNumber();
      }

      const description = (this.data.formData.description || '').trim();
      const lines = this.data.formData.lines
        .filter((line) => line.account || line.description || line.debit || line.credit)
        .map((line) => ({
          account: line.account,
          debit: Number(line.debit) || 0,
          credit: Number(line.credit) || 0,
          description: line.description || ''
        }));

      if (!description) {
        alert('Please enter a description for the journal entry.');
        return;
      }

      if (lines.length < 2) {
        alert('Please add at least two line items to the journal entry.');
        return;
      }

      const totals = this.calculateTotals();
      if (!totals.isBalanced) {
        alert('The journal entry must balance before it can be created.');
        return;
      }

      await axios.post('/api/accounting/journal-entries/create', {
        description,
        entryType: this.data.formData.entryType,
        referenceNumber: this.data.formData.referenceNumber,
        lines
      }, { withCredentials: true });

      alert('Journal entry created successfully!');
      window.location.hash = '#/journal-entries';
    } catch (error) {
      console.error('Error creating journal entry:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  registerEvents() {
    const container = document.getElementById('main-content');
    if (!container) return;

    container.querySelectorAll('[data-field]').forEach((input) => {
      input.addEventListener('input', (event) => {
        const field = input.dataset.field;
        this.data.formData[field] = event.target.value;
      });
    });

    const accountSearch = container.querySelector('[data-account-search]');
    if (accountSearch) {
      accountSearch.addEventListener('input', (event) => {
        this.data.accountSearch = event.target.value;
        this.updateView();
      });
    }

    container.querySelectorAll('[data-line-input]').forEach((input) => {
      const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(eventName, (event) => {
        const index = Number(input.dataset.index);
        const field = input.dataset.lineInput;
        this.updateLineValue(index, field, event.target.value);
      });
    });

    container.querySelectorAll('[data-account-select]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.accountSelect);
        this.data.activeLineIndex = index;
        this.updateView();
      });
    });

    container.querySelectorAll('[data-assign-account]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.assignAccount);
        const accountId = button.dataset.accountId;
        const accountName = button.dataset.accountName;
        const line = this.data.formData.lines[index];
        if (line) {
          line.account = accountId;
          line.description = line.description || accountName;
          this.updateView();
        }
      });
    });

    const addButton = container.querySelector('[data-add-line]');
    if (addButton) {
      addButton.addEventListener('click', () => this.addLineItem());
    }

    container.querySelectorAll('[data-remove-line]').forEach((button) => {
      const index = Number(button.dataset.removeLine);
      button.addEventListener('click', () => this.removeLineItem(index));
    });

    const submitButton = container.querySelector('[data-submit-entry]');
    if (submitButton) {
      submitButton.addEventListener('click', () => this.handleSubmit());
    }
  },

  async fetchAccounts() {
    try {
      const response = await axios.get('/api/accounting/chart-of-accounts/list', {
        params: { limit: 100, isActive: true },
        withCredentials: true
      });
      this.data.accounts = response.data.accounts || [];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      this.data.accounts = [];
    }
  },

  render() {
    const { loading, formData, accountSearch, activeLineIndex } = this.data;
    const accounts = this.filteredAccounts();
    const { totalDebit, totalCredit, isBalanced } = this.calculateTotals();

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
            <h2>Create Journal Entry</h2>
            <p class="subtitle">Record debits and credits for a balanced accounting entry.</p>
          </div>
          <a href="#/journal-entries" class="btn-cancel">Back to Entries</a>
        </div>

        <div class="entry-form-card">
          <div class="form-group">
            <label>Description</label>
            <input type="text" value="${formData.description}" data-field="description" placeholder="e.g. Monthly rent adjustment" />
          </div>

          <div class="form-group">
            <label>Entry Type</label>
            <select data-field="entryType">
              <option value="Manual" ${formData.entryType === 'Manual' ? 'selected' : ''}>Manual</option>
              <option value="Sales" ${formData.entryType === 'Sales' ? 'selected' : ''}>Sales</option>
              <option value="Purchase" ${formData.entryType === 'Purchase' ? 'selected' : ''}>Purchase</option>
              <option value="Payment" ${formData.entryType === 'Payment' ? 'selected' : ''}>Payment</option>
              <option value="Adjustment" ${formData.entryType === 'Adjustment' ? 'selected' : ''}>Adjustment</option>
            </select>
          </div>

          <div class="form-group">
            <label>Reference Number</label>
            <input type="text" value="${formData.referenceNumber}" data-field="referenceNumber" placeholder="Auto-generated" readonly />
          </div>

          <div class="account-selection-card">
            <div class="section-head">
              <div>
                <h3>Account Selection</h3>
                <p>Select an account and assign it to the active line item below.</p>
              </div>
              <div class="active-line">Active line: ${formData.lines[activeLineIndex] ? activeLineIndex + 1 : 'None'}</div>
            </div>
            <div class="form-group">
              <label>Search Accounts</label>
              <input type="text" value="${accountSearch}" data-account-search placeholder="Search account code or name" />
            </div>
            <div class="account-list">
              ${accounts.length ? accounts.slice(0, 25).map((account) => `
                <div class="account-item">
                  <div>
                    <div><strong>${account.accountCode || 'N/A'}</strong> - ${account.accountName || 'Unnamed'}</div>
                    <div class="account-meta">Balance: Ksh${Number(account.currentBalance || 0).toFixed(2)} | ${account.normalBalance || 'N/A'}</div>
                  </div>
                  <button type="button" class="btn-assign" data-assign-account="${activeLineIndex}" data-account-id="${account._id}" data-account-name="${account.accountName}">Assign</button>
                </div>
              `).join('') : '<div class="account-empty">No active accounts found.</div>'}
            </div>
          </div>

          <div class="line-items">
            <h3>Line Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Description</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${formData.lines.map((line, index) => `
                  <tr>
                    <td>
                      <select data-line-input="account" data-index="${index}">
                        <option value="">Select account</option>
                        ${accounts.map((account) => `
                          <option value="${account._id}" ${line.account === account._id ? 'selected' : ''}>${account.accountCode} - ${account.accountName}</option>
                        `).join('')}
                      </select>
                    </td>
                    <td><input type="text" value="${line.description}" data-line-input="description" data-index="${index}" /></td>
                    <td><input type="number" step="0.01" value="${line.debit}" data-line-input="debit" data-index="${index}" /></td>
                    <td><input type="number" step="0.01" value="${line.credit}" data-line-input="credit" data-index="${index}" /></td>
                    <td>
                      ${formData.lines.length > 1 ? `<button type="button" class="btn-remove" data-remove-line="${index}">Remove</button>` : ''}
                      <button type="button" class="btn-select-line" data-account-select="${index}">${activeLineIndex === index ? 'Active' : 'Select'}</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="line-totals">
              <p>Total Debit: <span data-total-debit>Ksh${totalDebit.toFixed(2)}</span></p>
              <p>Total Credit: <span data-total-credit>Ksh${totalCredit.toFixed(2)}</span></p>
              <p class="${isBalanced ? 'balanced' : 'unbalanced'}"><span class="balance-pill ${isBalanced ? 'balanced' : 'unbalanced'}" data-balance-state>${isBalanced ? 'Balanced' : 'Not balanced'}</span></p>
            </div>

            <button type="button" class="btn-add" data-add-line>Add Line Item</button>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-submit" data-submit-entry ${loading ? 'disabled' : ''}>${loading ? 'Creating...' : 'Create Entry'}</button>
            <a href="#/journal-entries" class="btn-cancel">Cancel</a>
          </div>
        </div>

        <style>
          .journal-entry-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .account-selection-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
          .section-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
          .active-line { font-size: 0.95rem; color: #475569; }
          .account-list { display: grid; gap: 12px; max-height: 320px; overflow-y: auto; margin-top: 10px; }
          .account-item { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; }
          .account-item .account-meta { color: #475569; font-size: 0.85rem; margin-top: 4px; }
          .account-empty { color: #64748b; padding: 12px; }
          .btn-assign { padding: 8px 12px; border: none; border-radius: 8px; background: #2563eb; color: white; cursor: pointer; font-weight: 700; }
          .account-selection-card .form-group input { width: 100%; }
          .page-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
          .subtitle { color: #475569; margin: 4px 0 0; }
          .entry-form-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
          .form-group { margin-bottom: 16px; }
          .form-group label { display: block; margin-bottom: 6px; font-weight: 700; }
          .form-group input, .form-group select, .line-items select, .line-items input { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
          .line-items table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          .line-items th, .line-items td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          .line-items th { background: #2563eb; color: white; }
          .line-totals { background: #e0f2fe; padding: 12px; border-radius: 8px; margin-top: 12px; font-weight: 600; }
          .balance-pill { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 0.9rem; }
          .balance-pill.balanced { background: #dcfce7; color: #166534; }
          .balance-pill.unbalanced { background: #fee2e2; color: #991b1b; }
          .btn-add, .btn-remove, .btn-submit, .btn-cancel, .btn-select-line { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; }
          .btn-add { background: #0f766e; color: white; margin-top: 10px; }
          .btn-remove { background: #dc2626; color: white; }
          .btn-select-line { background: #2563eb; color: white; margin-top: 6px; display: block; }
          .btn-submit { background: #16a34a; color: white; }
          .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; }
          .btn-cancel { background: #64748b; color: white; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
          .form-actions { display: flex; gap: 10px; margin-top: 20px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .financial-nav-link.active { background: #2563eb; color: white; }
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

  async init() {
    await this.fetchAccounts();
    if (!this.data.formData.referenceNumber) {
      this.data.formData.referenceNumber = this.generateReferenceNumber();
    }
    this.updateView();
  },

  async vignette() {
    return this.init();
  }
};

export default JournalEntryCreate;
