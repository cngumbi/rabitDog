import axios from 'axios';

const AddAccount = {
  data: {
    costCenters: [],
    parentAccounts: [],
    accountTypes: [
      'Asset',
      'Liability',
      'Equity',
      'Income',
      'Expense',
      'Cost of Goods Sold',
      'Contra-Asset',
      'Contra-Liability',
      'Contra-Equity'
    ],
    subTypesMap: {
      Asset: ['Current Asset', 'Fixed Asset', 'Intangible Asset'],
      Liability: ['Current Liability', 'Long-term Liability'],
      Equity: ['Equity'],
      Income: ['Operating Income', 'Non-Operating Income'],
      Expense: ['Operating Expense', 'Non-Operating Expense', 'Interest Expense', 'Tax Expense'],
      'Cost of Goods Sold': ['Cost of Goods Sold'],
      'Contra-Asset': ['Contra-Asset'],
      'Contra-Liability': ['Contra-Liability'],
      'Contra-Equity': ['Contra-Equity']
    },
    normalBalances: ['Debit', 'Credit'],
    loading: false,
    formData: {
      accountCode: '',
      accountName: '',
      accountType: 'Asset',
      subType: 'Current Asset',
      normalBalance: 'Debit',
      description: '',
      costCenter: '',
      parentAccount: '',
      openingBalance: 0,
      currentBalance: 0,
      isActive: true
    }
  },

  generateAccountCode(name = '') {
    const prefix = name
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0].toUpperCase())
      .join('')
      .slice(0, 4) || 'ACC';
    const suffix = Date.now().toString().slice(-5);
    return `ACCT-${prefix}-${suffix}`;
  },

  getDefaultFormData() {
    return {
      accountCode: this.generateAccountCode(),
      accountName: '',
      accountType: 'Asset',
      subType: 'Current Asset',
      normalBalance: 'Debit',
      description: '',
      costCenter: '',
      parentAccount: '',
      openingBalance: 0,
      currentBalance: 0,
      isActive: true
    };
  },

  async fetchReferenceData() {
    this.data.loading = true;
    this.updateView();
    try {
      const [costCentersResponse, parentAccountsResponse] = await Promise.all([
        axios.get('/api/accounting/cost-centers/list', {
          params: { limit: 100, isActive: true },
          withCredentials: true
        }),
        axios.get('/api/accounting/chart-of-accounts/list', {
          params: { limit: 100, isActive: true },
          withCredentials: true
        })
      ]);

      this.data.costCenters = costCentersResponse.data.costCenters || [];
      this.data.parentAccounts = parentAccountsResponse.data.accounts || [];
    } catch (error) {
      console.error('Error loading account references:', error);
      alert('Unable to load account reference data.');
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  async handleSubmit() {
    try {
      this.data.loading = true;
      this.updateView();

      const payload = {
        ...this.data.formData,
        openingBalance: Number(this.data.formData.openingBalance || 0),
        currentBalance: Number(this.data.formData.currentBalance || 0),
        costCenter: this.data.formData.costCenter || undefined,
        parentAccount: this.data.formData.parentAccount || undefined
      };

      if (!payload.accountCode || !payload.accountName || !payload.accountType || !payload.normalBalance) {
        alert('Please complete the required account fields.');
        return;
      }

      await axios.post('/api/accounting/chart-of-accounts/create', payload, { withCredentials: true });
      alert('Account created successfully.');
      window.location.hash = '#/cashbank';
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  render() {
    window.addAccountInstance = this;
    const { costCenters, parentAccounts, accountTypes, subTypesMap, normalBalances, loading, formData } = this.data;
    const subTypes = subTypesMap[formData.accountType] || [];

    return `
      <div class="budget-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/budget" class="financial-nav-link">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>

        <h2>Create New Account</h2>
        <p class="subtitle">Register a new chart of accounts entry to link cashbook and ledger activity across the system.</p>

        <div class="budget-form-card">
          <div class="form-grid">
            <div class="form-group">
              <label>Account Name</label>
              <input type="text" value="${formData.accountName}" onchange="window.addAccountInstance.data.formData.accountName = this.value; if (!window.addAccountInstance.data.formData.accountCode || window.addAccountInstance.data.formData.accountCode.startsWith('ACCT-')) { window.addAccountInstance.data.formData.accountCode = window.addAccountInstance.generateAccountCode(this.value); } window.addAccountInstance.updateView();" />
            </div>
            <div class="form-group">
              <label>Account Code</label>
              <input type="text" readonly value="${formData.accountCode}" />
            </div>
            <div class="form-group">
              <label>Account Type</label>
              <select onchange="window.addAccountInstance.data.formData.accountType = this.value; window.addAccountInstance.data.formData.subType = window.addAccountInstance.data.subTypesMap[this.value][0] || ''; window.addAccountInstance.updateView();">
                ${accountTypes.map((type) => `<option value="${type}" ${formData.accountType === type ? 'selected' : ''}>${type}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Sub Type</label>
              <select onchange="window.addAccountInstance.data.formData.subType = this.value; window.addAccountInstance.updateView();">
                ${subTypes.map((subType) => `<option value="${subType}" ${formData.subType === subType ? 'selected' : ''}>${subType}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Normal Balance</label>
              <select onchange="window.addAccountInstance.data.formData.normalBalance = this.value; window.addAccountInstance.updateView();">
                ${normalBalances.map((balance) => `<option value="${balance}" ${formData.normalBalance === balance ? 'selected' : ''}>${balance}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Cost Center</label>
              <select onchange="window.addAccountInstance.data.formData.costCenter = this.value; window.addAccountInstance.updateView();">
                <option value="">None</option>
                ${costCenters.map((center) => `<option value="${center._id}" ${formData.costCenter === center._id ? 'selected' : ''}>${center.costCenterCode} - ${center.costCenterName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Parent Account</label>
              <select onchange="window.addAccountInstance.data.formData.parentAccount = this.value; window.addAccountInstance.updateView();">
                <option value="">None</option>
                ${parentAccounts.map((account) => `<option value="${account._id}" ${formData.parentAccount === account._id ? 'selected' : ''}>${account.accountCode} - ${account.accountName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Opening Balance</label>
              <input type="number" step="0.01" value="${formData.openingBalance}" onchange="window.addAccountInstance.data.formData.openingBalance = this.value; window.addAccountInstance.updateView();" />
            </div>
            <div class="form-group">
              <label>Current Balance</label>
              <input type="number" step="0.01" value="${formData.currentBalance}" onchange="window.addAccountInstance.data.formData.currentBalance = this.value; window.addAccountInstance.updateView();" />
            </div>
            <div class="form-group form-full">
              <label>Description</label>
              <textarea rows="3" onchange="window.addAccountInstance.data.formData.description = this.value; window.addAccountInstance.updateView();">${formData.description}</textarea>
            </div>
            <div class="form-group form-full">
              <label><input type="checkbox" ${formData.isActive ? 'checked' : ''} onchange="window.addAccountInstance.data.formData.isActive = this.checked; window.addAccountInstance.updateView();" /> Active account</label>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" onclick="window.addAccountInstance.handleSubmit();" class="btn-submit" ${loading ? 'disabled' : ''}>${loading ? 'Saving...' : 'Create Account'}</button>
            <a href="/#/cashbank" class="btn-secondary">Back to Cashbook</a>
          </div>
        </div>

        <style>
          .budget-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .subtitle { color: #475569; margin-bottom: 20px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .financial-nav-link.active { background: #007bff; color: white; }
          .budget-form-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06); }
          .form-grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 15px; }
          .form-group { display: flex; flex-direction: column; gap: 6px; }
          .form-full { grid-column: 1 / -1; }
          .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          .form-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
          .btn-submit, .btn-secondary { padding: 10px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .btn-submit { background-color: #28a745; color: white; }
          .btn-secondary { background-color: #6c757d; color: white; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
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
    window.addAccountInstance = this;
    await this.fetchReferenceData();
    this.updateView();
  },

  vignette() {
    return this.init();
  }
};

export default AddAccount;
