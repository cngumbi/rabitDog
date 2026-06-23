import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const AddAnimal = {
  data: {
    formData: {},
    errors: {},
    loading: false,
    success: false,
    errorMessage: '',
    batches: []
  },

  async fetchBatches() {
    try {
      const response = await livestockAPI.getAllBatches().catch(e => ({ data: [] }));
      this.data.batches = response.data || [];
      this.updateView();
    } catch (error) {
      console.error('Error fetching batches:', error);
      this.data.batches = [];
    }
  },

  validateForm() {
    this.data.errors = {};
    const { identificationNumber, batch, gender } = this.data.formData;

    if (!identificationNumber || identificationNumber.trim() === '') {
      this.data.errors.identificationNumber = 'Animal ID number is required';
    }
    if (!batch || batch === '') {
      this.data.errors.batch = 'Batch is required';
    }
    if (!gender || gender === '') {
      this.data.errors.gender = 'Gender is required';
    }

    return Object.keys(this.data.errors).length === 0;
  },

  async submitForm() {
    if (!this.validateForm()) {
      this.updateView();
      return;
    }

    const { identificationNumber, batch, gender, weight, health } = this.data.formData;

    try {
      this.data.loading = true;
      this.data.errorMessage = '';

      // derive livestockType from selected batch to satisfy backend model requirements
      const selectedBatch = this.data.batches.find(b => b._id === batch) || {};
      const livestockType = selectedBatch.livestockType && (selectedBatch.livestockType._id || selectedBatch.livestockType) || undefined;

      await livestockAPI.createRecord({
        identificationNumber: identificationNumber.trim(),
        batch,
        livestockType,
        gender,
        weight: weight ? parseFloat(weight) : 0,
        health: health || 'Healthy',
        status: 'Active'
      });

      this.data.success = true;
      setTimeout(() => {
        window.location.hash = '#/livestock/animals';
      }, 1000);
    } catch (error) {
      this.data.errorMessage = 'Error creating animal record: ' + livestockUtils.parseError(error);
      this.updateView();
    } finally {
      this.data.loading = false;
    }
  },

  render() {
    const { identificationNumber, batch, gender, weight, health } = this.data.formData;

    return LivestockLayout.render({
      activePath: '/livestock/animals',
      heroHtml: `
        <section class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Livestock Management</span>
            <h1>Add Animal Record</h1>
            <p>Create a new animal record in your system.</p>
          </div>
        </section>
      `,
      contentHtml: `
        ${this.data.success ? `
          <div class="flash-message success">
            ✓ Animal record created successfully! Redirecting...
          </div>
        ` : ''}

        ${this.data.errorMessage ? `
          <div class="flash-message error">
            ✗ ${this.data.errorMessage}
          </div>
        ` : ''}

        <div class="form-panel">
          <form onsubmit="event.preventDefault(); window.addAnimalInstance.submitForm();">
            <div class="form-section">
              <h3 class="form-section-title">Identification</h3>
              
              <div class="form-group">
                <label class="form-label">Animal ID Number *</label>
                <p class="form-hint">Unique identifier for this animal (e.g., ANM-001, BIRD-245)</p>
                <input 
                  type="text" 
                  class="form-control ${this.data.errors.identificationNumber ? 'error' : ''}" 
                  value="${identificationNumber || ''}" 
                  onchange="window.addAnimalInstance.data.formData.identificationNumber = this.value;" 
                  placeholder="e.g., ANM-001"
                  required
                >
                ${this.data.errors.identificationNumber ? `<div class="form-error">${this.data.errors.identificationNumber}</div>` : ''}
              </div>

              <div class="form-group">
                <label class="form-label">Batch *</label>
                <p class="form-hint">Select which batch this animal belongs to</p>
                <select 
                  class="form-select ${this.data.errors.batch ? 'error' : ''}" 
                  onchange="window.addAnimalInstance.data.formData.batch = this.value;"
                  required
                >
                  <option value="">Select Batch</option>
                  ${this.data.batches.map(b => `<option value="${b._id}" ${batch === b._id ? 'selected' : ''}>${b.batchName}</option>`).join('')}
                </select>
                ${this.data.errors.batch ? `<div class="form-error">${this.data.errors.batch}</div>` : ''}
              </div>
            </div>

            <div class="form-section">
              <h3 class="form-section-title">Physical Characteristics</h3>
              
              <div class="form-group">
                <label class="form-label">Gender *</label>
                <p class="form-hint">Specify the gender of this animal</p>
                <select 
                  class="form-select ${this.data.errors.gender ? 'error' : ''}" 
                  onchange="window.addAnimalInstance.data.formData.gender = this.value;"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male" ${gender === 'Male' ? 'selected' : ''}>Male</option>
                  <option value="Female" ${gender === 'Female' ? 'selected' : ''}>Female</option>
                </select>
                ${this.data.errors.gender ? `<div class="form-error">${this.data.errors.gender}</div>` : ''}
              </div>

              <div class="form-group">
                <label class="form-label">Weight (kg)</label>
                <p class="form-hint">Current weight of the animal in kilograms</p>
                <input 
                  type="number" 
                  step="0.1" 
                  class="form-control" 
                  value="${weight || ''}" 
                  onchange="window.addAnimalInstance.data.formData.weight = this.value;" 
                  placeholder="0.00"
                >
              </div>
            </div>

            <div class="form-section">
              <h3 class="form-section-title">Health Status</h3>
              
              <div class="form-group">
                <label class="form-label">Health Status</label>
                <p class="form-hint">Initial health status of this animal</p>
                <select 
                  class="form-select" 
                  onchange="window.addAnimalInstance.data.formData.health = this.value;"
                >
                  <option value="Healthy" ${health === 'Healthy' ? 'selected' : ''}>Healthy</option>
                  <option value="Sick" ${health === 'Sick' ? 'selected' : ''}>Sick</option>
                  <option value="Treated" ${health === 'Treated' ? 'selected' : ''}>Treated</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                class="btn-primary text-white"
                ${this.data.loading ? 'disabled' : ''}
              >
                ${this.data.loading ? 'Creating...' : 'Create Animal Record'}
              </button>
              <a href="/#/livestock/animals" class="btn-secondary">Cancel</a>
            </div>
          </form>
        </div>
      `
    });
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
    }
  },

  vignette() {
    this.init();
  },

  init() {
    window.addAnimalInstance = this;
    this.data.formData = {};
    this.data.errors = {};
    this.data.loading = false;
    this.data.success = false;
    this.data.errorMessage = '';
    this.fetchBatches();
  }
};

export default AddAnimal;
