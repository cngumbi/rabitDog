import axios from 'axios';

const EditAccount = {
  data: {
    accountId: '',
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

  getDefaultFormData() {
    return {
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
    };
  },

  async fetchReferenceData() {
    this.data.loading = true;
    this.updateView();
    try {
      const [accountResponse, costCentersResponse, parentAccountsResponse] = await Promise.all([
        axios.get(`/api/accounting/chart-of-accounts/${this.data.accountId}`, { withCredentials: true }),
        axios.get('/api/accounting/cost-centers/list', {
          params: { limit: 100, isActive: true },
          withCredentials: true
        }),
        axios.get('/api/accounting/chart-of-accounts/list', {
          params: { limit: 100, isActive: true },
          withCredentials: true
        })
      ]);

      const account = accountResponse.data || {};
      this.data.costCenters = costCentersResponse.data.costCenters || [];
      this.data.parentAccounts = parentAccountsResponse.data.accounts || [];
      this.data.formData = {
        accountCode: account.accountCode || '',
        accountName: account.accountName || '',
        accountType: account.accountType || 'Asset',
        subType: account.subType || (this.data.subTypesMap[account.accountType] ? this.data.subTypesMap[account.accountType][0] : ''),
        normalBalance: account.normalBalance || 'Debit',
        description: account.description || '',
        costCenter: account.costCenter?._id || account.costCenter || '',
        parentAccount: account.parentAccount?._id || account.parentAccount || '',
        openingBalance: Number(account.openingBalance || 0),
        currentBalance: Number(account.currentBalance || 0),
        isActive: account.isActive !== false
      };
    } catch (error) {
      console.error('Error loading account details:', error);
      alert('Unable to load account details.');
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

      await axios.put(`/api/accounting/chart-of-accounts/${this.data.accountId}`, payload, { withCredentials: true });
      alert('Account updated successfully.');
      window.location.hash = '#/accounts';
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  render() {
    window.editAccountInstance = this;
    const { costCenters, parentAccounts, accountTypes, subTypesMap, normalBalances, loading, formData } = this.data;
    const subTypes = subTypesMap[formData.accountType] || [];

    return `
      <div class="budget-container">
        <div class="financial-nav">
          <a href="/#/accounts" class="financial-nav-link">Chart of Accounts</a>
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>

        <h2>Edit Account</h2>
        <p class="subtitle">Adjust account definitions, balances, and status without breaking the ledger structure.</p>

        <div class="budget-form-card">
          <div class="form-grid">
            <div class="form-group">
              <label>Account Name</label>
              <input type="text" value="${formData.accountName}" onchange="window.editAccountInstance.data.formData.accountName = this.value; window.editAccountInstance.updateView();" />
            </div>
            <div class="form-group">
              <label>Account Code</label>
              <input type="text" value="${formData.accountCode}" onchange="window.editAccountInstance.data.formData.accountCode = this.value; window.editAccountInstance.updateView();" />
            </div>
            <div class="form-group">
              <label>Account Type</label>
              <select onchange="window.editAccountInstance.data.formData.accountType = this.value; window.editAccountInstance.data.formData.subType = window.editAccountInstance.data.subTypesMap[this.value][0] || ''; window.editAccountInstance.updateView();">
                ${accountTypes.map((type) => `<option value="${type}" ${formData.accountType === type ? 'selected' : ''}>${type}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Sub Type</label>
              <select onchange="window.editAccountInstance.data.formData.subType = this.value; window.editAccountInstance.updateView();">
                ${subTypes.map((subType) => `<option value="${subType}" ${formData.subType === subType ? 'selected' : ''}>${subType}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Normal Balance</label>
              <select onchange="window.editAccountInstance.data.formData.normalBalance = this.value; window.editAccountInstance.updateView();">
                ${normalBalances.map((balance) => `<option value="${balance}" ${formData.normalBalance === balance ? 'selected' : ''}>${balance}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Cost Center</label>
              <select onchange="window.editAccountInstance.data.formData.costCenter = this.value; window.editAccountInstance.updateView();">
                <option value="">None</option>
                ${costCenters.map((center) => `<option value="${center._id}" ${formData.costCenter === center._id ? 'selected' : ''}>${center.costCenterCode} - ${center.costCenterName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Parent Account</label>
              <select onchange="window.editAccountInstance.data.formData.parentAccount = this.value; window.editAccountInstance.updateView();">
                <option value="">None</option>
                ${parentAccounts.map((account) => `<option value="${account._id}" ${formData.parentAccount === account._id ? 'selected' : ''}>${account.accountCode} - ${account.accountName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Opening Balance</label>
              <input type="number" step="0.01" value="${formData.openingBalance}" onchange="window.editAccountInstance.data.formData.openingBalance = this.value; window.editAccountInstance.updateView();" />
            </div>
            <div class="form-group">
              <label>Current Balance</label>
              <input type="number" step="0.01" value="${formData.currentBalance}" onchange="window.editAccountInstance.data.formData.currentBalance = this.value; window.editAccountInstance.updateView();" />
            </div>
            <div class="form-group form-full">
              <label>Description</label>
              <textarea rows="3" onchange="window.editAccountInstance.data.formData.description = this.value; window.editAccountInstance.updateView();">${formData.description}</textarea>
            </div>
            <div class="form-group form-full">
              <label><input type="checkbox" ${formData.isActive ? 'checked' : ''} onchange="window.editAccountInstance.data.formData.isActive = this.checked; window.editAccountInstance.updateView();" /> Active account</label>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" onclick="window.editAccountInstance.handleSubmit();" class="btn-submit" ${loading ? 'disabled' : ''}>${loading ? 'Saving...' : 'Save Changes'}</button>
            <a href="/#/accounts" class="btn-secondary">Back to Accounts</a>
          </div>
        </div>

        <style>
          .budget-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .subtitle { color: #475569; margin-bottom: 20px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
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

  async init(request) {
    this.data.accountId = request?.id || '';
    if (!this.data.accountId) {
      this.updateView();
      return;
    }
    await this.fetchReferenceData();
  },

  vignette(request) {
    return this.init(request);
  }
};

export default EditAccount;
