import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const ViewAnimal = {
  data: {
    loading: true,
    saving: false,
    animal: null,
    batches: [],
    livestockTypes: [],
    errorMessage: '',
    successMessage: '',
    formData: {}
  },

  getAnimalId() {
    const parts = window.location.hash.slice(1).split('/').filter(Boolean);
    return parts[2] || '';
  },

  formatDateForInput(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  },

  buildFormData(animal = null) {
    const productionMetrics = animal?.productionMetrics || {};
    const feedingSchedule = animal?.feedingSchedule || {};
    const pregnancyStatus = animal?.pregnancyStatus || {};

    return {
      identificationNumber: animal?.identificationNumber || '',
      batch: animal?.batch?._id || animal?.batch || '',
      livestockType: animal?.livestockType?._id || animal?.livestockType || '',
      gender: animal?.gender || 'Unknown',
      dateOfBirth: this.formatDateForInput(animal?.dateOfBirth),
      weight: animal?.weight ?? '',
      health: animal?.health || 'Healthy',
      status: animal?.status || 'Active',
      notes: animal?.notes || '',
      dailyProduction: productionMetrics.dailyProduction ?? '',
      productivityPercentage: productionMetrics.productivityPercentage ?? '',
      dailyAllowance: feedingSchedule.dailyAllowance ?? '',
      feedType: feedingSchedule.feedType || '',
      specialDiet: !!feedingSchedule.specialDiet,
      dietNotes: feedingSchedule.dietNotes || '',
      isPregnant: !!pregnancyStatus.isPregnant,
      conceivedDate: this.formatDateForInput(pregnancyStatus.conceivedDate),
      expectedDeliveryDate: this.formatDateForInput(pregnancyStatus.expectedDeliveryDate),
      numberOfOffsprings: pregnancyStatus.numberOfOffsprings ?? ''
    };
  },

  async fetchAnimal() {
    const animalId = this.getAnimalId();
    if (!animalId) {
      this.data.loading = false;
      this.data.errorMessage = 'Animal not found.';
      this.data.formData = this.buildFormData();
      this.updateView();
      return;
    }

    this.data.loading = true;
    this.data.errorMessage = '';
    this.data.successMessage = '';
    this.updateView();

    try {
      const [animalRes, batchesRes, typesRes] = await Promise.all([
        livestockAPI.getRecord(animalId).catch(() => ({ data: null })),
        livestockAPI.getAllBatches().catch(() => ({ data: [] })),
        livestockAPI.getAllTypes().catch(() => ({ data: [] }))
      ]);

      this.data.animal = animalRes.data || animalRes || null;
      this.data.batches = batchesRes.data || [];
      this.data.livestockTypes = typesRes.data || [];
      this.data.formData = this.buildFormData(this.data.animal);
    } catch (error) {
      console.error('Error fetching animal:', error);
      this.data.errorMessage = 'Unable to load the animal right now.';
      this.data.animal = null;
      this.data.batches = [];
      this.data.livestockTypes = [];
      this.data.formData = this.buildFormData();
    } finally {
      this.data.loading = false;
      this.updateView();
    }
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

      if (event.target.type === 'checkbox') {
        this.data.formData[field] = event.target.checked;
      } else {
        this.data.formData[field] = event.target.value;
      }

      if (this.data.errorMessage) {
        this.data.errorMessage = '';
      }
    });

    container.addEventListener('change', (event) => {
      const field = event.target.dataset.field;
      if (!field) {
        return;
      }

      if (event.target.type === 'checkbox') {
        this.data.formData[field] = event.target.checked;
      } else {
        this.data.formData[field] = event.target.value;
      }
    });

    container.addEventListener('submit', (event) => {
      if (event.target.matches('form[data-animal-edit-form]')) {
        event.preventDefault();
        this.submitForm();
      }
    });
  },

  async submitForm() {
    const animalId = this.getAnimalId();
    const { identificationNumber, batch, livestockType, gender, dateOfBirth, weight, health, status, notes, dailyProduction, productivityPercentage, dailyAllowance, feedType, specialDiet, dietNotes, isPregnant, conceivedDate, expectedDeliveryDate, numberOfOffsprings } = this.data.formData;

    if (!identificationNumber || !batch || !livestockType) {
      this.data.errorMessage = 'Please fill in the required fields.';
      this.updateView();
      return;
    }

    this.data.saving = true;
    this.data.errorMessage = '';
    this.data.successMessage = '';
    this.updateView();

    try {
      const payload = {
        identificationNumber: identificationNumber.trim(),
        batch,
        livestockType,
        gender,
        dateOfBirth: dateOfBirth || null,
        weight: weight === '' ? 0 : parseFloat(weight),
        health,
        status,
        notes: notes || '',
        productionMetrics: {
          dailyProduction: dailyProduction === '' ? 0 : parseFloat(dailyProduction),
          productivityPercentage: productivityPercentage === '' ? 0 : parseFloat(productivityPercentage)
        },
        feedingSchedule: {
          dailyAllowance: dailyAllowance === '' ? 0 : parseFloat(dailyAllowance),
          feedType: feedType || '',
          specialDiet: !!specialDiet,
          dietNotes: dietNotes || ''
        },
        pregnancyStatus: {
          isPregnant: !!isPregnant,
          conceivedDate: conceivedDate || null,
          expectedDeliveryDate: expectedDeliveryDate || null,
          numberOfOffsprings: numberOfOffsprings === '' ? 0 : parseInt(numberOfOffsprings, 10)
        }
      };

      const response = await livestockAPI.updateRecord(animalId, payload);
      this.data.animal = response.data || response || this.data.animal;
      this.data.formData = this.buildFormData(this.data.animal);
      this.data.successMessage = 'Animal updated successfully.';
    } catch (error) {
      console.error('Error updating animal:', error);
      this.data.errorMessage = 'Unable to update the animal right now.';
    } finally {
      this.data.saving = false;
      this.updateView();
    }
  },

  renderSummary() {
    if (!this.data.animal) {
      return '';
    }

    const animal = this.data.animal;
    return `
      <div class="content-panel">
        <div class="content-header">
          <div>
            <h2>${animal.identificationNumber || 'Animal Record'}</h2>
            <p style="margin: 4px 0 0; color: #6b7280;">${animal.animalCode || 'No code yet'}</p>
          </div>
          <a href="/#/livestock/animals" class="btn-secondary">← Back to Animals</a>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-top: 16px;">
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Batch</div>
            <div style="font-weight:600;">${animal.batch?.batchName || 'Unassigned'}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Type</div>
            <div style="font-weight:600;">${animal.livestockType?.name || 'Unassigned'}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Health</div>
            <div style="font-weight:600;">${animal.health || 'Healthy'}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Status</div>
            <div style="font-weight:600;">${animal.status || 'Active'}</div>
          </div>
        </div>
      </div>
    `;
  },

  renderForm() {
    const { identificationNumber, batch, livestockType, gender, dateOfBirth, weight, health, status, notes, dailyProduction, productivityPercentage, dailyAllowance, feedType, specialDiet, dietNotes, isPregnant, conceivedDate, expectedDeliveryDate, numberOfOffsprings } = this.data.formData;

    return `
      <div class="content-panel">
        <div class="content-header">
          <h2>Edit Animal</h2>
          <span class="content-total">Update details</span>
        </div>
        <form data-animal-edit-form="true" style="margin-top: 16px;">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Identification Number *</label>
              <input type="text" class="form-control" data-field="identificationNumber" value="${identificationNumber || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Batch *</label>
              <select class="form-select" data-field="batch" required>
                <option value="">Select Batch</option>
                ${this.data.batches.map((b) => `<option value="${b._id}" ${batch === b._id ? 'selected' : ''}>${b.batchName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Livestock Type *</label>
              <select class="form-select" data-field="livestockType" required>
                <option value="">Select Type</option>
                ${this.data.livestockTypes.map((type) => `<option value="${type._id}" ${livestockType === type._id ? 'selected' : ''}>${type.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Gender</label>
              <select class="form-select" data-field="gender">
                <option value="Male" ${gender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${gender === 'Female' ? 'selected' : ''}>Female</option>
                <option value="Mixed" ${gender === 'Mixed' ? 'selected' : ''}>Mixed</option>
                <option value="Unknown" ${gender === 'Unknown' ? 'selected' : ''}>Unknown</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Date of Birth</label>
              <input type="date" class="form-control" data-field="dateOfBirth" value="${dateOfBirth || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Weight (kg)</label>
              <input type="number" step="0.1" class="form-control" data-field="weight" value="${weight ?? ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Health</label>
              <select class="form-select" data-field="health">
                <option value="Healthy" ${health === 'Healthy' ? 'selected' : ''}>Healthy</option>
                <option value="Sick" ${health === 'Sick' ? 'selected' : ''}>Sick</option>
                <option value="Treated" ${health === 'Treated' ? 'selected' : ''}>Treated</option>
                <option value="Injured" ${health === 'Injured' ? 'selected' : ''}>Injured</option>
                <option value="Pregnant" ${health === 'Pregnant' ? 'selected' : ''}>Pregnant</option>
                <option value="Lactating" ${health === 'Lactating' ? 'selected' : ''}>Lactating</option>
                <option value="Deceased" ${health === 'Deceased' ? 'selected' : ''}>Deceased</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" data-field="status">
                <option value="Active" ${status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Sold" ${status === 'Sold' ? 'selected' : ''}>Sold</option>
                <option value="Transferred" ${status === 'Transferred' ? 'selected' : ''}>Transferred</option>
                <option value="Deceased" ${status === 'Deceased' ? 'selected' : ''}>Deceased</option>
                <option value="Culled" ${status === 'Culled' ? 'selected' : ''}>Culled</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Daily Production</label>
              <input type="number" step="0.1" class="form-control" data-field="dailyProduction" value="${dailyProduction ?? ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Productivity %</label>
              <input type="number" step="0.1" class="form-control" data-field="productivityPercentage" value="${productivityPercentage ?? ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Daily Allowance</label>
              <input type="number" step="0.1" class="form-control" data-field="dailyAllowance" value="${dailyAllowance ?? ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Feed Type</label>
              <input type="text" class="form-control" data-field="feedType" value="${feedType || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Special Diet</label>
              <label style="display:flex; align-items:center; gap:8px; margin-top:8px;">
                <input type="checkbox" data-field="specialDiet" ${specialDiet ? 'checked' : ''}>
                Enable special diet
              </label>
            </div>
            <div class="form-group">
              <label class="form-label">Pregnant</label>
              <label style="display:flex; align-items:center; gap:8px; margin-top:8px;">
                <input type="checkbox" data-field="isPregnant" ${isPregnant ? 'checked' : ''}>
                Mark as pregnant
              </label>
            </div>
            <div class="form-group">
              <label class="form-label">Conceived Date</label>
              <input type="date" class="form-control" data-field="conceivedDate" value="${conceivedDate || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Expected Delivery Date</label>
              <input type="date" class="form-control" data-field="expectedDeliveryDate" value="${expectedDeliveryDate || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Offspring Count</label>
              <input type="number" class="form-control" data-field="numberOfOffsprings" value="${numberOfOffsprings ?? ''}">
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Diet Notes</label>
              <textarea class="form-control" data-field="dietNotes" rows="3">${dietNotes || ''}</textarea>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Notes</label>
              <textarea class="form-control" data-field="notes" rows="4">${notes || ''}</textarea>
            </div>
          </div>

          <div class="form-actions" style="margin-top: 16px;">
            <button type="submit" class="btn-primary text-white" ${this.data.saving ? 'disabled' : ''}>${this.data.saving ? 'Saving...' : 'Save Changes'}</button>
            <a href="/#/livestock/animals" class="btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    `;
  },

  render() {
    const contentHtml = this.data.loading
      ? '<div class="loading-spinner"><p>Loading animal details...</p></div>'
      : this.data.errorMessage && !this.data.animal
        ? `
          <div class="content-panel">
            <div style="background:#f8d7da; color:#721c24; padding:14px; border-radius:6px;">
              ✗ ${this.data.errorMessage}
            </div>
          </div>
        `
        : `
          ${this.data.successMessage ? `<div class="flash-message success">✓ ${this.data.successMessage}</div>` : ''}
          ${this.data.errorMessage ? `<div class="flash-message error">✗ ${this.data.errorMessage}</div>` : ''}
          ${this.renderSummary()}
          ${this.renderForm()}
        `;

    return LivestockLayout.render({
      activePath: '/livestock/animals',
      pageTitle: 'Animal Details',
      description: 'View and update animal record details.',
      heroActions: `
        <a class="btn-primary text-white" href="/#/livestock/animals/add">+ Add Animal</a>
        <a class="btn-secondary text-white" href="/#/livestock/animals">Back to Animals</a>
      `,
      contentHtml
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

  init() {
    window.viewAnimalInstance = this;
    this.fetchAnimal();
  },

  vignette() {
    this.init();
  }
};

export default ViewAnimal;
