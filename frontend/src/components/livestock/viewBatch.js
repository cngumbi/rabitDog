import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const ViewBatch = {
  data: {
    loading: true,
    batch: null,
    records: [],
    livestockTypes: [],
    errorMessage: '',
    formData: {},
    formMode: 'create',
    saving: false
  },

  getBatchId() {
    const parts = window.location.hash.slice(1).split('/').filter(Boolean);
    return parts[2] || '';
  },

  formatDateForInput(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  },

  buildFormData(batch = null) {
    return {
      batchName: batch?.batchName || '',
      livestockType: batch?.livestockType?._id || batch?.livestockType || '',
      quantity: batch?.quantity || '',
      currentQuantity: batch?.currentQuantity || '',
      unitCost: batch?.unitCost || '',
      startDate: this.formatDateForInput(batch?.startDate),
      expectedEndDate: this.formatDateForInput(batch?.expectedEndDate),
      location: batch?.location || '',
      purpose: batch?.purpose || 'Production',
      status: batch?.status || 'Active',
      notes: batch?.notes || ''
    };
  },

  async fetchTypes() {
    try {
      const typesResponse = await livestockAPI.getAllTypes().catch(() => ({ data: [] }));
      this.data.livestockTypes = typesResponse.data || [];
      this.updateView();
    } catch (error) {
      console.error('Error fetching livestock types:', error);
    }
  },

  async fetchBatch() {
    const batchId = this.getBatchId();
    if (!batchId) {
      this.data.loading = false;
      this.data.errorMessage = '';
      this.data.formMode = 'create';
      this.data.formData = this.buildFormData();
      this.updateView();
      this.fetchTypes();
      return;
    }

    this.data.loading = true;
    this.data.errorMessage = '';
    this.updateView();

    try {
      const batchResponse = await livestockAPI.getBatch(batchId);
      const payload = batchResponse.data || {};
      this.data.batch = payload.batch || null;
      this.data.records = payload.records || [];
      this.data.formData = this.buildFormData(this.data.batch);
      this.data.formMode = this.data.batch ? 'edit' : 'create';
    } catch (error) {
      console.error('Error fetching batch:', error);
      this.data.errorMessage = 'Unable to load this batch right now.';
      this.data.batch = null;
      this.data.records = [];
      this.data.formData = this.buildFormData();
      this.data.formMode = 'create';
    }

    this.data.loading = false;
    this.updateView();
    this.fetchTypes();
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
    });

    container.addEventListener('change', (event) => {
      const field = event.target.dataset.field;
      if (field) {
        this.data.formData[field] = event.target.value;
      }
    });

    container.addEventListener('submit', (event) => {
      if (event.target.matches('form[data-batch-form]')) {
        event.preventDefault();
        this.submitBatchForm();
      }
    });

    container.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) {
        return;
      }

      switch (button.dataset.action) {
        case 'start-create':
          this.data.formMode = 'create';
          this.data.batch = null;
          this.data.formData = this.buildFormData();
          this.updateView();
          break;
        case 'cancel-edit':
          this.data.formData = this.buildFormData(this.data.batch);
          this.data.formMode = this.data.batch ? 'edit' : 'create';
          this.updateView();
          break;
        default:
          break;
      }
    });
  },

  async submitBatchForm() {
    const { batchName, livestockType, quantity, unitCost, startDate, expectedEndDate, location, purpose, status, notes, currentQuantity } = this.data.formData;

    if (!batchName || !livestockType || !quantity || !unitCost || !startDate) {
      alert('Please fill in all required fields.');
      return;
    }

    this.data.saving = true;
    this.updateView();

    try {
      const payload = {
        batchName,
        livestockType,
        quantity: parseInt(quantity, 10),
        currentQuantity: parseInt(currentQuantity || quantity, 10),
        unitCost: parseFloat(unitCost),
        startDate,
        expectedEndDate: expectedEndDate || null,
        location: location || '',
        purpose: purpose || 'Production',
        status: status || 'Active',
        notes: notes || ''
      };

      if (this.data.batch?._id) {
        await livestockAPI.updateBatch(this.data.batch._id, payload);
        alert('Batch updated successfully');
      } else {
        const response = await livestockAPI.createBatch(payload);
        const createdBatch = response.data || response;
        alert('Batch created successfully');
        if (createdBatch._id) {
          window.location.hash = `#/livestock/batch/${createdBatch._id}`;
          return;
        }
      }

      await this.fetchBatch();
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Unable to save batch right now.');
    } finally {
      this.data.saving = false;
      this.updateView();
    }
  },

  renderForm() {
    const { batchName, livestockType, quantity, currentQuantity, unitCost, startDate, expectedEndDate, location, purpose, status, notes } = this.data.formData;
    const isEditing = !!this.data.batch;

    return `
      <div class="content-panel">
        <div class="content-header">
          <h2>${isEditing ? 'Edit Batch' : 'Create Batch'}</h2>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            ${isEditing ? '<button type="button" class="btn-secondary" data-action="start-create">Create New</button>' : ''}
            ${isEditing ? '<button type="button" class="btn-secondary" data-action="cancel-edit">Reset</button>' : ''}
          </div>
        </div>

        <form data-batch-form="true" style="margin-top: 16px;">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Batch Name *</label>
              <input type="text" class="form-control" data-field="batchName" value="${batchName || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Livestock Type *</label>
              <select class="form-select" data-field="livestockType" required>
                <option value="">Select Type</option>
                ${this.data.livestockTypes.map((type) => `<option value="${type._id}" ${livestockType === type._id ? 'selected' : ''}>${type.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Initial Quantity *</label>
              <input type="number" class="form-control" data-field="quantity" value="${quantity || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Current Quantity</label>
              <input type="number" class="form-control" data-field="currentQuantity" value="${currentQuantity || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Unit Cost *</label>
              <input type="number" class="form-control" step="0.01" data-field="unitCost" value="${unitCost || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" data-field="status">
                <option value="Active" ${status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Completed" ${status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="Suspended" ${status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                <option value="Archived" ${status === 'Archived' ? 'selected' : ''}>Archived</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Start Date *</label>
              <input type="date" class="form-control" data-field="startDate" value="${startDate || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Expected End Date</label>
              <input type="date" class="form-control" data-field="expectedEndDate" value="${expectedEndDate || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Location</label>
              <input type="text" class="form-control" data-field="location" value="${location || ''}" placeholder="e.g., House 1">
            </div>
            <div class="form-group">
              <label class="form-label">Purpose</label>
              <select class="form-select" data-field="purpose">
                <option value="Production" ${purpose === 'Production' ? 'selected' : ''}>Production</option>
                <option value="Breeding" ${purpose === 'Breeding' ? 'selected' : ''}>Breeding</option>
                <option value="Fattening" ${purpose === 'Fattening' ? 'selected' : ''}>Fattening</option>
                <option value="Sales" ${purpose === 'Sales' ? 'selected' : ''}>Sales</option>
                <option value="Other" ${purpose === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Notes</label>
              <textarea class="form-control" data-field="notes" rows="4">${notes || ''}</textarea>
            </div>
          </div>

          <div class="form-actions" style="margin-top: 16px;">
            <button type="submit" class="btn-primary text-white">${this.data.saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Batch')}</button>
            <a href="/#/livestock" class="btn-secondary">Back</a>
          </div>
        </form>
      </div>
    `;
  },

  renderSummary() {
    if (!this.data.batch) {
      return '';
    }

    const batch = this.data.batch;
    const statusClass = `badge badge-${(batch.status || 'active').toLowerCase()}`;

    return `
      <div class="content-panel">
        <div class="content-header">
          <div>
            <h2>${batch.batchName || 'Unnamed Batch'}</h2>
            <p style="margin: 4px 0 0; color: #6b7280;">${batch.batchCode || 'No code yet'}</p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
            <span class="${statusClass}">${batch.status || 'Active'}</span>
            <a href="/#/livestock" class="btn-secondary text-white">← Back to Batches</a>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-top: 16px;">
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Type</div>
            <div style="font-weight:600;">${batch.livestockType?.name || 'Unassigned'}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Quantity</div>
            <div style="font-weight:600;">${batch.quantity || 0}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Current</div>
            <div style="font-weight:600;">${batch.currentQuantity || 0}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Unit Cost</div>
            <div style="font-weight:600;">${livestockUtils.formatCurrency(batch.unitCost)}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Start Date</div>
            <div style="font-weight:600;">${livestockUtils.formatDate(batch.startDate)}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Expected End</div>
            <div style="font-weight:600;">${batch.expectedEndDate ? livestockUtils.formatDate(batch.expectedEndDate) : 'Not set'}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Location</div>
            <div style="font-weight:600;">${batch.location || 'Not set'}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Purpose</div>
            <div style="font-weight:600;">${batch.purpose || 'Not set'}</div>
          </div>
        </div>

        <div style="margin-top: 20px;">
          <h3 style="margin-bottom: 8px;">Notes</h3>
          <p style="margin:0; color:#374151;">${batch.notes || 'No notes added for this batch yet.'}</p>
        </div>
      </div>
    `;
  },

  renderRecords() {
    if (!this.data.records.length) {
      return `
        <div class="content-panel">
          <div class="content-header">
            <h2>Batch Records</h2>
          </div>
          <p style="margin: 0; color: #6b7280;">No records have been added to this batch yet.</p>
        </div>
      `;
    }

    return `
      <div class="content-panel">
        <div class="content-header">
          <h2>Batch Records</h2>
          <span class="content-total">Total: ${this.data.records.length}</span>
        </div>
        <table class="batches-table">
          <thead>
            <tr>
              <th>Record Type</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.records.map((record) => `
              <tr>
                <td>${record.recordType || 'Record'}</td>
                <td>${livestockUtils.formatDate(record.date || record.createdAt)}</td>
                <td>${record.notes || record.description || 'No details'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  render() {
    const contentHtml = this.data.loading
      ? '<div class="loading-spinner"><p>Loading batch details...</p></div>'
      : this.data.errorMessage
        ? `
          <div class="content-panel">
            <div style="background:#f8d7da; color:#721c24; padding:14px; border-radius:6px;">
              ✗ ${this.data.errorMessage}
            </div>
          </div>
        `
        : `${this.renderForm()} ${this.data.batch ? this.renderSummary() : ''} ${this.renderRecords()}`;

    return LivestockLayout.render({
      activePath: '/livestock',
      pageTitle: 'Batch Details',
      description: 'Create or update batch details and review related records.',
      heroActions: `
        <a class="btn-primary text-white" href="/#/livestock/add">+ New Batch</a>
        <a class="btn-secondary text-white" href="/#/livestock">Back to Batches</a>
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
    window.viewBatchInstance = this;
    this.fetchBatch();
  },

  vignette() {
    this.init();
  }
};

export default ViewBatch;
