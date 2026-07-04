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
// Function to generate a unique account code based on the account name
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
      if (!this.data.formData.accountCode) {
        this.data.formData.accountCode = this.generateAccountCode(this.data.formData.accountName);
      }
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

      const accountName = String(this.data.formData.accountName || '').trim();
      const accountCode = String(this.data.formData.accountCode || '').trim() || this.generateAccountCode(accountName);
      const accountType = String(this.data.formData.accountType || '').trim();
      const normalBalance = String(this.data.formData.normalBalance || '').trim();

      this.data.formData.accountCode = accountCode;
      this.data.formData.accountName = accountName;
      this.data.formData.accountType = accountType;
      this.data.formData.normalBalance = normalBalance;

      const payload = {
        ...this.data.formData,
        openingBalance: Number(this.data.formData.openingBalance || 0),
        currentBalance: Number(this.data.formData.currentBalance || 0),
        costCenter: this.data.formData.costCenter || undefined,
        parentAccount: this.data.formData.parentAccount || undefined
      };

      const missingFields = [];
      if (!payload.accountName) missingFields.push('Account Name');
      if (!payload.accountCode) missingFields.push('Account Code');
      if (!payload.accountType) missingFields.push('Account Type');
      if (!payload.normalBalance) missingFields.push('Normal Balance');

      if (missingFields.length) {
        alert(`Please complete required fields: ${missingFields.join(', ')}`);
        this.data.loading = false;
        this.updateView();

        const selectorMap = {
          'Account Name': '[data-account-name]',
          'Account Code': '[data-account-code]',
          'Account Type': '[data-account-type]',
          'Normal Balance': '[data-normal-balance]'
        };
        const invalidField = document.querySelector(selectorMap[missingFields[0]]);
        if (invalidField) {
          invalidField.classList.add('input-error');
          invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          invalidField.focus?.();
        }
        return;
      }

      const sanitizedPayload = { ...payload };
      if (!sanitizedPayload.costCenter) delete sanitizedPayload.costCenter;
      if (!sanitizedPayload.parentAccount) delete sanitizedPayload.parentAccount;

      await axios.post('/api/accounting/chart-of-accounts/create', sanitizedPayload, { withCredentials: true });
      alert('Account created successfully.');
      window.location.hash = '#/accounts';
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
              <input type="text" required placeholder="Enter account name" value="${formData.accountName}" data-account-name />
            </div>
            <div class="form-group">
              <label>Account Code</label>
              <input type="text" readonly placeholder="Auto-generated code" value="${formData.accountCode}" data-account-code />
            </div>
            <div class="form-group">
              <label>Account Type</label>
              <select required data-account-type>
                ${accountTypes.map((type) => `<option value="${type}" ${formData.accountType === type ? 'selected' : ''}>${type}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Sub Type</label>
              <select data-sub-type>
                ${subTypes.map((subType) => `<option value="${subType}" ${formData.subType === subType ? 'selected' : ''}>${subType}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Normal Balance</label>
              <select data-normal-balance>
                ${normalBalances.map((balance) => `<option value="${balance}" ${formData.normalBalance === balance ? 'selected' : ''}>${balance}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Cost Center</label>
              <select data-cost-center>
                <option value="">-- No Cost Center --</option>
                ${costCenters.map((center) => `<option value="${center._id}" ${formData.costCenter === center._id ? 'selected' : ''}>${center.costCenterCode} - ${center.costCenterName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Parent Account</label>
              <select data-parent-account>
                <option value="">-- No Parent --</option>
                ${parentAccounts.map((account) => `<option value="${account._id}" ${formData.parentAccount === account._id ? 'selected' : ''}>${account.accountCode} - ${account.accountName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Opening Balance</label>
              <input type="number" step="0.01" value="${formData.openingBalance}" data-opening-balance />
            </div>
            <div class="form-group">
              <label>Current Balance</label>
              <input type="number" step="0.01" value="${formData.currentBalance}" data-current-balance />
            </div>
            <div class="form-group form-full">
              <label>Description</label>
              <textarea rows="3" data-description>${formData.description}</textarea>
            </div>
            <div class="form-group form-full">
              <label><input type="checkbox" ${formData.isActive ? 'checked' : ''} data-is-active /> Active account</label>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" data-submit-account class="btn-submit" ${loading ? 'disabled' : ''}>${loading ? 'Saving...' : 'Create Account'}</button>
            <a href="/#/accounts" class="btn-secondary">Back to Accounts</a>
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
          .input-error { border-color: #dc2626 !important; box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.14); }
          @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
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

    const submitButton = container.querySelector('[data-submit-account]');
    if (submitButton) {
      submitButton.addEventListener('click', () => this.handleSubmit());
    }

    const accountNameInput = container.querySelector('[data-account-name]');
    if (accountNameInput) {
      accountNameInput.addEventListener('input', (event) => {
        event.target.classList.remove('input-error');
        this.data.formData.accountName = event.target.value;
        if (!this.data.formData.accountCode && String(event.target.value).trim()) {
          this.data.formData.accountCode = this.generateAccountCode(this.data.formData.accountName);
          const accountCodeInput = container.querySelector('[data-account-code]');
          if (accountCodeInput) {
            accountCodeInput.value = this.data.formData.accountCode;
          }
        }
      });
    }

    const accountTypeSelect = container.querySelector('[data-account-type]');
    if (accountTypeSelect) {
      accountTypeSelect.addEventListener('change', (event) => {
        this.data.formData.accountType = event.target.value;
        this.data.formData.subType = this.data.subTypesMap[event.target.value][0] || '';
        this.updateView();
      });
    }

    const subTypeSelect = container.querySelector('[data-sub-type]');
    if (subTypeSelect) {
      subTypeSelect.addEventListener('change', (event) => {
        this.data.formData.subType = event.target.value;
      });
    }

    const normalBalanceSelect = container.querySelector('[data-normal-balance]');
    if (normalBalanceSelect) {
      normalBalanceSelect.addEventListener('change', (event) => {
        this.data.formData.normalBalance = event.target.value;
      });
    }

    const costCenterSelect = container.querySelector('[data-cost-center]');
    if (costCenterSelect) {
      costCenterSelect.addEventListener('change', (event) => {
        this.data.formData.costCenter = event.target.value;
      });
    }

    const parentAccountSelect = container.querySelector('[data-parent-account]');
    if (parentAccountSelect) {
      parentAccountSelect.addEventListener('change', (event) => {
        this.data.formData.parentAccount = event.target.value;
      });
    }

    const openingBalanceInput = container.querySelector('[data-opening-balance]');
    if (openingBalanceInput) {
      openingBalanceInput.addEventListener('input', (event) => {
        this.data.formData.openingBalance = event.target.value;
      });
    }

    const currentBalanceInput = container.querySelector('[data-current-balance]');
    if (currentBalanceInput) {
      currentBalanceInput.addEventListener('input', (event) => {
        this.data.formData.currentBalance = event.target.value;
      });
    }

    const descriptionInput = container.querySelector('[data-description]');
    if (descriptionInput) {
      descriptionInput.addEventListener('input', (event) => {
        this.data.formData.description = event.target.value;
      });
    }

    const isActiveCheckbox = container.querySelector('[data-is-active]');
    if (isActiveCheckbox) {
      isActiveCheckbox.addEventListener('change', (event) => {
        this.data.formData.isActive = event.target.checked;
      });
    }
  },

  async init() {
    window.addAccountInstance = this;
    this.data.formData = this.getDefaultFormData();
    this.updateView();
    await this.fetchReferenceData();
    this.updateView();
  },

  vignette() {
    return this.init();
  }
};

export default AddAccount;
