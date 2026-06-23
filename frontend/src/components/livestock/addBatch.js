import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const AddBatch = {
  data: {
    formData: {},
    errors: {},
    loading: false,
    success: false,
    errorMessage: '',
    livestockTypes: []
  },

  async fetchLivestockTypes() {
    try {
      const response = await livestockAPI.getAllTypes().catch(() => ({ data: [] }));
      this.data.livestockTypes = response.data || [];
      this.updateView();
    } catch (error) {
      console.error('Error fetching livestock types:', error);
      this.data.livestockTypes = [];
    }
  },

  validateForm() {
    this.data.errors = {};
    const { batchName, livestockTypeId, quantity, unitCost, startDate, location } = this.data.formData;

    if (!batchName || batchName.trim() === '') {
      this.data.errors.batchName = 'Batch name is required';
    }
    if (!livestockTypeId || livestockTypeId === '') {
      this.data.errors.livestockTypeId = 'Livestock type is required';
    }
    if (!quantity || parseInt(quantity, 10) <= 0) {
      this.data.errors.quantity = 'Initial quantity must be greater than zero';
    }
    if (!unitCost || parseFloat(unitCost) <= 0) {
      this.data.errors.unitCost = 'Unit cost must be greater than zero';
    }
    if (!startDate) {
      this.data.errors.startDate = 'Start date is required';
    }
    if (!location || location.trim() === '') {
      this.data.errors.location = 'Location is required';
    }

    return Object.keys(this.data.errors).length === 0;
  },

  async submitForm() {
    if (!this.validateForm()) {
      this.updateView();
      return;
    }

    const { batchName, livestockTypeId, quantity, unitCost, startDate, expectedEndDate, location, purpose } = this.data.formData;

    try {
      this.data.loading = true;
      this.data.errorMessage = '';

      await livestockAPI.createBatch({
        batchName: batchName.trim(),
        livestockType: livestockTypeId,
        quantity: parseInt(quantity, 10),
        currentQuantity: parseInt(quantity, 10),
        unitCost: parseFloat(unitCost),
        startDate,
        expectedEndDate: expectedEndDate || null,
        location: location?.trim() || '',
        purpose: purpose || 'Production',
        status: 'Active'
      });

      this.data.success = true;
      this.updateView();
      setTimeout(() => {
        window.location.hash = '#/livestock';
      }, 900);
    } catch (error) {
      this.data.errorMessage = 'Error creating batch: ' + livestockUtils.parseError(error);
      this.updateView();
    } finally {
      this.data.loading = false;
    }
  },

  render() {
    const { batchName, livestockTypeId, quantity, unitCost, startDate, expectedEndDate, location, purpose } = this.data.formData;

    return LivestockLayout.render({
      activePath: '/livestock/add',
      heroHtml: `
        <section class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Livestock Management</span>
            <h1>Create New Batch</h1>
            <p>Set up a new livestock batch for tracking production, feeding, and health.</p>
          </div>
        </section>
      `,
      contentHtml: `
        <div class="content-panel page-card">
          ${this.data.success ? `
            <div style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              ✓ Batch created successfully! Redirecting to livestock dashboard...
            </div>
          ` : ''}

          ${this.data.errorMessage ? `
            <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              ✗ ${this.data.errorMessage}
            </div>
          ` : ''}

          <div class="form-panel">
            <form id="add-batch-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Batch Name *</label>
                  <input id="batch-name" type="text" class="form-control ${this.data.errors.batchName ? 'error' : ''}" value="${batchName || ''}" placeholder="e.g., Batch A-01" required>
                  ${this.data.errors.batchName ? `<div class="form-error">${this.data.errors.batchName}</div>` : ''}
                </div>
                <div class="form-group">
                  <label class="form-label">Livestock Type *</label>
                  <select id="batch-livestock-type" class="form-select ${this.data.errors.livestockTypeId ? 'error' : ''}" required>
                    <option value="">Select Type</option>
                    ${this.data.livestockTypes.map(type => `<option value="${type._id}" ${livestockTypeId === type._id ? 'selected' : ''}>${type.name}</option>`).join('')}
                  </select>
                  ${this.data.errors.livestockTypeId ? `<div class="form-error">${this.data.errors.livestockTypeId}</div>` : ''}
                </div>
                <div class="form-group">
                  <label class="form-label">Initial Quantity *</label>
                  <input id="batch-quantity" type="number" class="form-control ${this.data.errors.quantity ? 'error' : ''}" value="${quantity || ''}" placeholder="100" required>
                  ${this.data.errors.quantity ? `<div class="form-error">${this.data.errors.quantity}</div>` : ''}
                </div>
                <div class="form-group">
                  <label class="form-label">Unit Cost *</label>
                  <input id="batch-unit-cost" type="number" step="0.01" class="form-control ${this.data.errors.unitCost ? 'error' : ''}" value="${unitCost || ''}" placeholder="500" required>
                  ${this.data.errors.unitCost ? `<div class="form-error">${this.data.errors.unitCost}</div>` : ''}
                </div>
                <div class="form-group">
                  <label class="form-label">Start Date *</label>
                  <input id="batch-start-date" type="date" class="form-control ${this.data.errors.startDate ? 'error' : ''}" value="${startDate || ''}" required>
                  ${this.data.errors.startDate ? `<div class="form-error">${this.data.errors.startDate}</div>` : ''}
                </div>
                <div class="form-group">
                  <label class="form-label">Expected End Date</label>
                  <input id="batch-end-date" type="date" class="form-control" value="${expectedEndDate || ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">Location *</label>
                  <input id="batch-location" type="text" class="form-control ${this.data.errors.location ? 'error' : ''}" value="${location || ''}" placeholder="e.g., House 1" required>
                  ${this.data.errors.location ? `<div class="form-error">${this.data.errors.location}</div>` : ''}
                </div>
                <div class="form-group">
                  <label class="form-label">Purpose</label>
                  <select id="batch-purpose" class="form-select">
                    <option value="">Select Purpose</option>
                    <option value="Production" ${purpose === 'Production' ? 'selected' : ''}>Production</option>
                    <option value="Breeding" ${purpose === 'Breeding' ? 'selected' : ''}>Breeding</option>
                    <option value="Fattening" ${purpose === 'Fattening' ? 'selected' : ''}>Fattening</option>
                  </select>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary text-white" ${this.data.loading ? 'disabled' : ''}>
                  ${this.data.loading ? 'Creating...' : 'Create Batch'}
                </button>
                <a href="/#/livestock" class="btn-secondary">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    `,
    });
  },

  scheduleRender() {
    if (this._renderScheduled) {
      return;
    }

    this._renderScheduled = true;
    const renderNow = () => {
      this._renderScheduled = false;
      const container = document.getElementById('main-content');
      if (container) {
        container.innerHTML = this.render();
        this.attachEventListeners();
      }
    };

    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(renderNow);
    } else {
      renderNow();
    }
  },

  updateView() {
    this.scheduleRender();
  },

  attachEventListeners() {
    const form = document.getElementById('add-batch-form');
    const batchNameInput = document.getElementById('batch-name');
    const livestockTypeSelect = document.getElementById('batch-livestock-type');
    const quantityInput = document.getElementById('batch-quantity');
    const unitCostInput = document.getElementById('batch-unit-cost');
    const startDateInput = document.getElementById('batch-start-date');
    const endDateInput = document.getElementById('batch-end-date');
    const locationInput = document.getElementById('batch-location');
    const purposeSelect = document.getElementById('batch-purpose');

    if (batchNameInput) {
      batchNameInput.addEventListener('input', (event) => {
        this.data.formData.batchName = event.target.value;
      });
    }

    if (livestockTypeSelect) {
      livestockTypeSelect.addEventListener('change', (event) => {
        this.data.formData.livestockTypeId = event.target.value;
      });
    }

    if (quantityInput) {
      quantityInput.addEventListener('input', (event) => {
        this.data.formData.quantity = event.target.value;
      });
    }

    if (unitCostInput) {
      unitCostInput.addEventListener('input', (event) => {
        this.data.formData.unitCost = event.target.value;
      });
    }

    if (startDateInput) {
      startDateInput.addEventListener('input', (event) => {
        this.data.formData.startDate = event.target.value;
      });
    }

    if (endDateInput) {
      endDateInput.addEventListener('input', (event) => {
        this.data.formData.expectedEndDate = event.target.value;
      });
    }

    if (locationInput) {
      locationInput.addEventListener('input', (event) => {
        this.data.formData.location = event.target.value;
      });
    }

    if (purposeSelect) {
      purposeSelect.addEventListener('change', (event) => {
        this.data.formData.purpose = event.target.value;
      });
    }

    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await this.submitForm();
      });
    }
  },

  vignette() {
    this.init();
    this.attachEventListeners();
  },

  async init() {
    window.addBatchInstance = this;
    this.data.formData = {};
    this.data.errors = {};
    this.data.loading = false;
    this.data.success = false;
    this.data.errorMessage = '';
    await this.fetchLivestockTypes();
  }
};

export default AddBatch;
