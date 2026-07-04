import axios from 'axios';

const EditCostCenter = {
  data: {
    costCenterId: '',
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

  async fetchCostCenter() {
    if (!this.data.costCenterId) return;
    this.data.loading = true;
    this.updateView();
    try {
      const response = await axios.get(`/api/accounting/cost-centers/${this.data.costCenterId}`, {
        withCredentials: true
      });
      const center = response.data || {};
      this.data.formData = {
        costCenterCode: center.costCenterCode || '',
        costCenterName: center.costCenterName || '',
        department: center.department || '',
        costType: center.costType || 'Revenue',
        description: center.description || ''
      };
    } catch (error) {
      console.error('Error loading cost center:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
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
        costCenterCode: String(this.data.formData.costCenterCode || '').trim(),
        costCenterName: String(this.data.formData.costCenterName || '').trim(),
        department: String(this.data.formData.department || '').trim() || undefined,
        costType: String(this.data.formData.costType || 'Revenue').trim(),
        description: String(this.data.formData.description || '').trim() || undefined
      };

      if (!payload.costCenterCode || !payload.costCenterName) {
        alert('Please enter both cost center code and name.');
        return;
      }

      await axios.put(`/api/accounting/cost-centers/${this.data.costCenterId}`, payload, {
        withCredentials: true
      });
      alert('Cost center updated successfully.');
      window.location.hash = `#/cost-centers/${this.data.costCenterId}`;
    } catch (error) {
      console.error('Error updating cost center:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  render() {
    window.editCostCenterInstance = this;
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

        <h2>Edit Cost Center</h2>
        <p class="subtitle">Update the code, name, department, or type for this cost center.</p>

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
              <input type="text" data-cost-center-name value="${formData.costCenterName}" />
            </div>
            <div class="form-group">
              <label>Department</label>
              <input type="text" data-department value="${formData.department}" />
            </div>
            <div class="form-group">
              <label>Cost Type</label>
              <select data-cost-type>
                ${costTypes.map((type) => `<option value="${type}" ${formData.costType === type ? 'selected' : ''}>${type}</option>`).join('')}
              </select>
            </div>
            <div class="form-group form-full">
              <label>Description</label>
              <textarea rows="4" data-description>${formData.description}</textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-submit" data-submit-cost-center ${loading ? 'disabled' : ''}>${loading ? 'Saving...' : 'Save Changes'}</button>
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
          .btn-submit, .btn-secondary { padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; color: white; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
          .btn-submit { background-color: #16a34a; }
          .btn-secondary { background-color: #6c757d; }
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
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
      this.registerEvents();
    }
  },

  async init(request) {
    this.data.costCenterId = request?.id || '';
    await this.fetchCostCenter();
  },

  vignette(request) {
    return this.init(request);
  }
};

export default EditCostCenter;
