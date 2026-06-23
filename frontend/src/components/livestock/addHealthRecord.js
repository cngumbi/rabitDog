import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const AddHealthRecord = {
  data: {
    animals: [],
    loading: false,
    formData: {
      recordType: '',
      animal: '',
      severity: '',
      description: '',
      treatment: '',
      outcome: 'Ongoing'
    },
    errors: {}
  },

  async fetchAnimals() {
    try {
      const response = await livestockAPI.getAllRecords();
      this.data.animals = response.data || [];
      this.updateView();
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  },

  validateForm() {
    const errors = {};
    const { recordType, animal, severity } = this.data.formData;

    if (!recordType) errors.recordType = 'Record type is required';
    if (!animal) errors.animal = 'Please select an animal';
    if (!severity) errors.severity = 'Severity level is required';

    // description is required by backend model
    if (!this.data.formData.description || this.data.formData.description.trim() === '') {
      errors.description = 'Description is required';
    }

    this.data.errors = errors;
    return Object.keys(errors).length === 0;
  },

  attachEventListeners() {
    if (this._listenersAttached) {
      return;
    }

    const container = document.getElementById('main-content');
    if (!container) {
      return;
    }

    this._listenersAttached = true;

    container.addEventListener('input', (event) => {
      const field = event.target.dataset.field;
      if (!field) {
        return;
      }

      this.data.formData[field] = event.target.value;
      if (this.data.errors[field]) {
        delete this.data.errors[field];
      }
    });

    container.addEventListener('change', (event) => {
      const field = event.target.dataset.field;
      if (!field) {
        return;
      }

      this.data.formData[field] = event.target.value;
      if (this.data.errors[field]) {
        delete this.data.errors[field];
      }
    });

    container.addEventListener('submit', (event) => {
      if (event.target.matches('form[data-health-form]')) {
        event.preventDefault();
        this.submitForm();
      }
    });
  },

  async submitForm() {
    if (!this.validateForm()) {
      this.updateView();
      return;
    }

    const { recordType, animal, severity, description, treatment, outcome } = this.data.formData;

    try {
      this.data.loading = true;

      const payload = {
        recordType,
        animal,
        severity,
        description: description ? description.trim() : '',
        treatment: treatment ? { medicineName: treatment.trim() } : undefined,
        outcome: outcome || 'Ongoing',
        recordDate: new Date()
      };

      await livestockAPI.createHealthRecord(payload);

      this.data.formData = {
        recordType: '',
        animal: '',
        severity: '',
        description: '',
        treatment: '',
        outcome: 'Ongoing'
      };
      this.data.errors = {};
      this.updateView();

      setTimeout(() => {
        window.location.hash = '#/livestock/health';
      }, 500);
    } catch (error) {
      this.data.errors.submit = livestockUtils.parseError(error);
      this.updateView();
    } finally {
      this.data.loading = false;
    }
  },

  render() {
    const { recordType, animal, severity, description, treatment, outcome } = this.data.formData;
    const { errors } = this.data;

    return LivestockLayout.render({
      activePath: '/livestock/health/add',
      heroHtml: `
        <section class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Livestock Management</span>
            <h1>Record Health Event</h1>
            <p>Document animal health issues, treatments, vaccinations, and medical history.</p>
            <div class="dashboard-hero-actions">
              <a href="/#/livestock/health" class="btn-secondary text-white">← Back to Health Records</a>
            </div>
          </div>
          <div class="dashboard-hero-meta">
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Total Animals</span>
              <span class="dashboard-mini-stat-value">${this.data.animals.length}</span>
              <span class="dashboard-mini-stat-trend">Available to track</span>
            </div>
          </div>
        </section>
      `,
      contentHtml: `
        <div class="content-panel">
            <form data-health-form="true">
              
              <!-- Section 1: Identification -->
              <div class="form-section">
                <h3 class="form-section-title">1. Identification</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">
                      Record Type *
                      <span class="form-hint">Type of health event</span>
                    </label>
                    <select class="form-control ${errors.recordType ? 'error' : ''}" 
                            data-field="recordType"
                            required>
                      <option value="">-- Select Record Type --</option>
                      <option value="Illness" ${recordType === 'Illness' ? 'selected' : ''}>Illness / Disease</option>
                      <option value="Vaccination" ${recordType === 'Vaccination' ? 'selected' : ''}>Vaccination</option>
                      <option value="Treatment" ${recordType === 'Treatment' ? 'selected' : ''}>Treatment / Medication</option>
                      <option value="Routine Check" ${recordType === 'Routine Check' ? 'selected' : ''}>Routine Checkup</option>
                      <option value="Injury" ${recordType === 'Injury' ? 'selected' : ''}>Injury</option>
                    </select>
                    ${errors.recordType ? `<span class="form-error">${errors.recordType}</span>` : ''}
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      Animal *
                      <span class="form-hint">Which animal affected</span>
                    </label>
                    <select class="form-control ${errors.animal ? 'error' : ''}" 
                            data-field="animal"
                            required>
                      <option value="">-- Select Animal --</option>
                      ${this.data.animals.map(a => `<option value="${a._id}" ${animal === a._id ? 'selected' : ''}>${a.identificationNumber || a.animalCode}</option>`).join('')}
                    </select>
                    ${errors.animal ? `<span class="form-error">${errors.animal}</span>` : ''}
                  </div>
                </div>
              </div>

              <!-- Section 2: Severity & Outcome -->
              <div class="form-section">
                <h3 class="form-section-title">2. Assessment</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">
                      Severity Level *
                      <span class="form-hint">How serious is the issue</span>
                    </label>
                    <select class="form-control ${errors.severity ? 'error' : ''}" 
                            data-field="severity"
                            required>
                      <option value="">-- Select Severity --</option>
                      <option value="Mild" ${severity === 'Mild' ? 'selected' : ''}>Mild (Minor issue, no urgency)</option>
                      <option value="Moderate" ${severity === 'Moderate' ? 'selected' : ''}>Moderate (Noticeable, requires attention)</option>
                      <option value="Severe" ${severity === 'Severe' ? 'selected' : ''}>Severe (Significant concern, urgent)</option>
                      <option value="Critical" ${severity === 'Critical' ? 'selected' : ''}>Critical (Life-threatening, immediate action)</option>
                    </select>
                    ${errors.severity ? `<span class="form-error">${errors.severity}</span>` : ''}
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      Current Outcome
                      <span class="form-hint">Status of the condition</span>
                    </label>
                    <select class="form-control" 
                            data-field="outcome">
                      <option value="Ongoing" ${outcome === 'Ongoing' ? 'selected' : ''}>Ongoing (Still being monitored)</option>
                      <option value="Recovered" ${outcome === 'Recovered' ? 'selected' : ''}>Recovered (Animal healed)</option>
                      <option value="Deceased" ${outcome === 'Deceased' ? 'selected' : ''}>Deceased (Animal lost)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Section 3: Details -->
              <div class="form-section">
                <h3 class="form-section-title">3. Medical Details</h3>
                <div class="form-grid form-grid-full">
                  <div class="form-group">
                    <label class="form-label">
                      Description / Symptoms
                      <span class="form-hint">Detailed explanation of the condition</span>
                    </label>
                    <textarea class="form-control" 
                              rows="4"
                              data-field="description"
                              placeholder="Describe the health issue, symptoms, observations, etc.">${description || ''}</textarea>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      Treatment / Medicine Given
                      <span class="form-hint">Optional - if applicable</span>
                    </label>
                    <input type="text" 
                           class="form-control" 
                           data-field="treatment"
                           value="${treatment || ''}" 
                           placeholder="e.g., Amoxicillin 500mg, Vaccination XYZ">
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="submit" class="btn-primary text-white" ${this.data.loading ? 'disabled' : ''}>
                  ${this.data.loading ? 'Creating...' : '✓ Create Health Record'}
                </button>
                <a href="/#/livestock/health" class="btn-secondary">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    `,
    });
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
      this.attachEventListeners();
    }
  },

  vignette() {
    this.init();
  },

  init() {
    window.addHealthRecordInstance = this;
    this.fetchAnimals();
  }
};

export default AddHealthRecord;
