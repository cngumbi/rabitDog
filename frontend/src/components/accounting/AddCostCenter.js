import axios from 'axios';

const AddCostCenter = {
  data: {
    costTypes: ['Revenue', 'Support', 'Administrative', 'Production', 'Distribution', 'Other'],
    loading: false,
    formData: {
      costCenterCode: '',
      costCenterName: '',
      department: '',
      costType: 'Revenue',
      description: ''
    }
  },

  generateCostCenterCode(name = '') {
    const prefix = name
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0].toUpperCase())
      .join('')
      .slice(0, 4) || 'CC';
    const suffix = Date.now().toString().slice(-4);
    return `CC-${prefix}-${suffix}`;
  },

  getDefaultFormData() {
    return {
      costCenterCode: '',
      costCenterName: '',
      department: '',
      costType: 'Revenue',
      description: ''
    };
  },

  resetForm() {
    this.data.formData = this.getDefaultFormData();
    this.updateView();
  },

  async handleSubmit() {
    try {
      this.data.loading = true;
      this.updateView();

      const costCenterCode = String(this.data.formData.costCenterCode || '').trim() || this.generateCostCenterCode(this.data.formData.costCenterName);
      const costCenterName = String(this.data.formData.costCenterName || '').trim();
      const department = String(this.data.formData.department || '').trim();
      const costType = String(this.data.formData.costType || 'Revenue').trim();
      const description = String(this.data.formData.description || '').trim();

      if (!costCenterCode || !costCenterName) {
        alert('Cost center code and name are required.');
        this.data.loading = false;
        this.updateView();
        return;
      }

      const payload = {
        costCenterCode,
        costCenterName,
        department: department || undefined,
        costType,
        description: description || undefined
      };

      await axios.post('/api/accounting/cost-centers/create', payload, { withCredentials: true });
      alert('Cost center created successfully.');
      window.location.hash = '#/cost-centers';
    } catch (error) {
      console.error('Error creating cost center:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  render() {
    window.addCostCenterInstance = this;
    const { costTypes, loading, formData } = this.data;

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

        <h2>Create Cost Center</h2>
        <p class="subtitle">Add a new cost center and connect it to budgets, accounts, and expense tracking.</p>

        <div class="budget-form-card">
          <div class="form-grid">
            <div class="form-group">
              <label>Cost Center Code</label>
              <div class="input-with-button">
                <input type="text" readonly placeholder="Auto-generated code" value="${formData.costCenterCode}" data-cost-center-code />
                <button type="button" class="btn-regenerate" data-regenerate-code>Regenerate</button>
              </div>
            </div>
            <div class="form-group">
              <label>Cost Center Name</label>
              <input type="text" placeholder="Enter name" value="${formData.costCenterName}" data-cost-center-name />
            </div>
            <div class="form-group">
              <label>Department</label>
              <input type="text" placeholder="Department or team" value="${formData.department}" data-department />
            </div>
            <div class="form-group">
              <label>Cost Type</label>
              <select data-cost-type>
                ${costTypes.map((type) => `<option value="${type}" ${formData.costType === type ? 'selected' : ''}>${type}</option>`).join('')}
              </select>
            </div>
            <div class="form-group form-full">
              <label>Description</label>
              <textarea rows="4" placeholder="Optional description" data-description>${formData.description}</textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-submit" data-submit-cost-center ${loading ? 'disabled' : ''}>${loading ? 'Saving...' : 'Create Cost Center'}</button>
            <button type="button" class="btn-secondary" data-reset-form>Reset</button>
            <a href="/#/cost-centers" class="btn-secondary">Back to Cost Centers</a>
          </div>
        </div>

        <style>
          .budget-container { padding: 20px; max-width: 900px; margin: 0 auto; }
          .subtitle { color: #475569; margin-bottom: 20px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .budget-form-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06); }
          .form-grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 15px; }
          .form-group { display: flex; flex-direction: column; gap: 6px; }
          .form-full { grid-column: 1 / -1; }
          .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
          .input-with-button { display: flex; gap: 10px; align-items: center; }
          .input-with-button input { flex: 1; }
          .btn-regenerate { padding: 10px 16px; border: none; border-radius: 8px; background: #2563eb; color: white; cursor: pointer; font-weight: 700; }
          .btn-regenerate:hover { background: #1d4ed8; }
          .form-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
          .btn-submit, .btn-secondary { padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
          .btn-submit { background-color: #16a34a; color: white; }
          .btn-secondary { background-color: #6c757d; color: white; }
          @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
        </style>
      </div>
    `;
  },

  registerEvents() {
    const container = document.getElementById('main-content');
    if (!container) return;

    const codeInput = container.querySelector('[data-cost-center-code]');
    if (codeInput) {
      codeInput.addEventListener('input', (event) => {
        this.data.formData.costCenterCode = event.target.value;
      });
    }

    const nameInput = container.querySelector('[data-cost-center-name]');
    if (nameInput) {
      nameInput.addEventListener('input', (event) => {
        this.data.formData.costCenterName = event.target.value;
        const existingCode = String(this.data.formData.costCenterCode || '').trim();
        const generatedCode = this.generateCostCenterCode(event.target.value);
        if (!existingCode || existingCode.startsWith('CC-')) {
          this.data.formData.costCenterCode = generatedCode;
          const codeInput = container.querySelector('[data-cost-center-code]');
          if (codeInput) {
            codeInput.value = generatedCode;
          }
        }
      });
    }

    const departmentInput = container.querySelector('[data-department]');
    if (departmentInput) {
      departmentInput.addEventListener('input', (event) => {
        this.data.formData.department = event.target.value;
      });
    }

    const typeSelect = container.querySelector('[data-cost-type]');
    if (typeSelect) {
      typeSelect.addEventListener('change', (event) => {
        this.data.formData.costType = event.target.value;
      });
    }

    const descriptionInput = container.querySelector('[data-description]');
    if (descriptionInput) {
      descriptionInput.addEventListener('input', (event) => {
        this.data.formData.description = event.target.value;
      });
    }

    const regenerateButton = container.querySelector('[data-regenerate-code]');
    if (regenerateButton) {
      regenerateButton.addEventListener('click', () => {
        const generatedCode = this.generateCostCenterCode(this.data.formData.costCenterName);
        this.data.formData.costCenterCode = generatedCode;
        const codeInput = container.querySelector('[data-cost-center-code]');
        if (codeInput) {
          codeInput.value = generatedCode;
        }
      });
    }

    const submitButton = container.querySelector('[data-submit-cost-center]');
    if (submitButton) {
      submitButton.addEventListener('click', () => this.handleSubmit());
    }

    const resetButton = container.querySelector('[data-reset-form]');
    if (resetButton) {
      resetButton.addEventListener('click', () => this.resetForm());
    }
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
      this.registerEvents();
    }
  },

  vignette() {
    this.updateView();
  }
};

export default AddCostCenter;
