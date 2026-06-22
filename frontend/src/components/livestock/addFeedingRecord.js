import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const AddFeedingRecord = {
  data: {
    batches: [],
    formData: {},
    loading: false,
    success: false,
    errorMessage: ''
  },

  async fetchBatches() {
    try {
      const res = await livestockAPI.getAllBatches().catch(() => ({ data: [] }));
      this.data.batches = res.data || [];
    } catch (error) {
      console.error('Error fetching batches', error);
      this.data.batches = [];
    }
  },

  validate() {
    const { batch, feedType, quantityFed, quantityAllocated, costPerKg } = this.data.formData;
    const errors = [];
    if (!batch) errors.push('Batch is required');
    if (!feedType) errors.push('Feed type is required');
    if (!quantityFed || parseFloat(quantityFed) <= 0) errors.push('Quantity fed must be greater than zero');
    if (!quantityAllocated || parseFloat(quantityAllocated) <= 0) errors.push('Quantity allocated must be greater than zero');
    if (!costPerKg || parseFloat(costPerKg) < 0) errors.push('Cost per kg is required');
    return errors;
  },

  async submit() {
    const errs = this.validate();
    if (errs.length) {
      this.data.errorMessage = errs.join('; ');
      this.updateView();
      return;
    }

    const { batch, feedType, quantityFed, quantityAllocated, costPerKg, feedQuality } = this.data.formData;
    try {
      this.data.loading = true;
      this.data.errorMessage = '';
      await livestockAPI.createFeedingRecord({
        batch,
        feedingDate: new Date(),
        feedType,
        quantityFed: parseFloat(quantityFed),
        quantityAllocated: parseFloat(quantityAllocated),
        costPerKg: parseFloat(costPerKg),
        feedQuality: feedQuality || 'Good',
        animalCondition: 'Normal consumption',
        wastage: 0
      });
      this.data.success = true;
      this.updateView();
      setTimeout(() => { window.location.hash = '#/livestock/feeding'; }, 800);
    } catch (error) {
      this.data.errorMessage = 'Error creating record: ' + livestockUtils.parseError(error);
      this.updateView();
    } finally {
      this.data.loading = false;
    }
  },

  render() {
    const { batch, feedType, quantityFed, quantityAllocated, costPerKg, feedQuality } = this.data.formData;
    return LivestockLayout.render({
      activePath: '/livestock/feeding/add',
      heroHtml: `
        <section class="dashboard-hero card livestock-hero-card">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Livestock Management</span>
            <h1>Add Feeding Record</h1>
            <p>Log feeding activity and cost for a batch.</p>
          </div>
        </section>
      `,
      contentHtml: `
        <div class="content-panel page-card">
            ${this.data.success ? `<div style="background-color:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:12px;">✓ Feeding record created — redirecting...</div>` : ''}
            ${this.data.errorMessage ? `<div style="background-color:#f8d7da;color:#721c24;padding:12px;border-radius:6px;margin-bottom:12px;">✗ ${this.data.errorMessage}</div>` : ''}

            <div class="form-panel">
              <form onsubmit="event.preventDefault(); window.addFeedingRecordInstance.submit();">
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Batch *</label>
                    <select class="form-select" onchange="window.addFeedingRecordInstance.data.formData.batch = this.value;" required>
                      <option value="">Select Batch</option>
                      ${this.data.batches.map(b => `<option value="${b._id}" ${batch === b._id ? 'selected' : ''}>${b.batchName}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Feed Type *</label>
                    <input type="text" class="form-control" value="${feedType || ''}" onchange="window.addFeedingRecordInstance.data.formData.feedType = this.value;" placeholder="e.g., Poultry Pellets" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantity Fed (kg) *</label>
                    <input type="number" step="0.1" class="form-control" value="${quantityFed || ''}" onchange="window.addFeedingRecordInstance.data.formData.quantityFed = this.value;" placeholder="0.00" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantity Allocated (kg) *</label>
                    <input type="number" step="0.1" class="form-control" value="${quantityAllocated || ''}" onchange="window.addFeedingRecordInstance.data.formData.quantityAllocated = this.value;" placeholder="0.00" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Cost per kg *</label>
                    <input type="number" step="0.01" class="form-control" value="${costPerKg || ''}" onchange="window.addFeedingRecordInstance.data.formData.costPerKg = this.value;" placeholder="0.00" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Feed Quality</label>
                    <select class="form-select" onchange="window.addFeedingRecordInstance.data.formData.feedQuality = this.value;">
                      <option value="Excellent" ${feedQuality === 'Excellent' ? 'selected' : ''}>Excellent</option>
                      <option value="Good" ${feedQuality === 'Good' ? 'selected' : ''}>Good</option>
                      <option value="Fair" ${feedQuality === 'Fair' ? 'selected' : ''}>Fair</option>
                      <option value="Poor" ${feedQuality === 'Poor' ? 'selected' : ''}>Poor</option>
                    </select>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary text-white" ${this.data.loading ? 'disabled' : ''}>${this.data.loading ? 'Saving...' : 'Create Record'}</button>
                  <a href="/#/livestock/feeding" class="btn-secondary">Cancel</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `,
    });
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) container.innerHTML = this.render();
  },

  vignette() { this.init(); },

  async init() {
    window.addFeedingRecordInstance = this;
    this.data.formData = {};
    this.data.loading = false;
    this.data.success = false;
    this.data.errorMessage = '';
    await this.fetchBatches();
  }
};

export default AddFeedingRecord;
