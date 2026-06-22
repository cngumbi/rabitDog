import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const AddProductionRecord = {
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
    const { batch, productionType, unit, quantity, pricePerUnit } = this.data.formData;
    const errors = [];
    if (!batch) errors.push('Batch is required');
    if (!productionType) errors.push('Production type is required');
    if (!unit) errors.push('Unit is required');
    if (!quantity || parseFloat(quantity) <= 0) errors.push('Quantity must be greater than zero');
    if (!pricePerUnit || parseFloat(pricePerUnit) < 0) errors.push('Price per unit is required');
    return errors;
  },

  async submit() {
    const errs = this.validate();
    if (errs.length) {
      this.data.errorMessage = errs.join('; ');
      this.updateView();
      return;
    }

    const { batch, productionType, unit, quantity, pricePerUnit, qualityGrade } = this.data.formData;
    try {
      this.data.loading = true;
      this.data.errorMessage = '';
      await livestockAPI.createProductionRecord({
        batch,
        productionType,
        unit,
        quantity: parseFloat(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        quality: qualityGrade || 'Grade A',
        productionDate: new Date(),
        status: 'Produced'
      });
      this.data.success = true;
      this.updateView();
      setTimeout(() => { window.location.hash = '#/livestock/production'; }, 800);
    } catch (error) {
      this.data.errorMessage = 'Error creating record: ' + livestockUtils.parseError(error);
      this.updateView();
    } finally {
      this.data.loading = false;
    }
  },

  render() {
    const { batch, productionType, unit, quantity, pricePerUnit, qualityGrade } = this.data.formData;
    return LivestockLayout.render({
      activePath: '/livestock/production/add',
      heroHtml: `
        <section class="dashboard-hero card livestock-hero-card">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Livestock Management</span>
            <h1>Add Production Record</h1>
            <p>Log production output for a batch.</p>
          </div>
        </section>
      `,
      contentHtml: `
        <div class="content-panel page-card">
            ${this.data.success ? `<div style="background-color:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:12px;">✓ Record created — redirecting...</div>` : ''}
            ${this.data.errorMessage ? `<div style="background-color:#f8d7da;color:#721c24;padding:12px;border-radius:6px;margin-bottom:12px;">✗ ${this.data.errorMessage}</div>` : ''}

            <div class="form-panel">
              <form onsubmit="event.preventDefault(); window.addProductionRecordInstance.submit();">
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Batch *</label>
                    <select class="form-select" onchange="window.addProductionRecordInstance.data.formData.batch = this.value;" required>
                      <option value="">Select Batch</option>
                      ${this.data.batches.map(b => `<option value="${b._id}" ${batch === b._id ? 'selected' : ''}>${b.batchName}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Production Type *</label>
                    <select class="form-select" onchange="window.addProductionRecordInstance.data.formData.productionType = this.value;" required>
                      <option value="">Select Type</option>
                      <option value="Eggs" ${productionType === 'Eggs' ? 'selected' : ''}>Eggs</option>
                      <option value="Meat" ${productionType === 'Meat' ? 'selected' : ''}>Meat</option>
                      <option value="Milk" ${productionType === 'Milk' ? 'selected' : ''}>Milk</option>
                      <option value="Honey" ${productionType === 'Honey' ? 'selected' : ''}>Honey</option>
                      <option value="Wool" ${productionType === 'Wool' ? 'selected' : ''}>Wool</option>
                      <option value="Other" ${productionType === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantity *</label>
                    <input type="number" step="0.1" class="form-control" value="${quantity || ''}" onchange="window.addProductionRecordInstance.data.formData.quantity = this.value;" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Unit *</label>
                    <select class="form-select" onchange="window.addProductionRecordInstance.data.formData.unit = this.value;" required>
                      <option value="">Select Unit</option>
                      <option value="Kg" ${unit === 'Kg' ? 'selected' : ''}>Kg</option>
                      <option value="Liters" ${unit === 'Liters' ? 'selected' : ''}>Liters</option>
                      <option value="Units" ${unit === 'Units' ? 'selected' : ''}>Units</option>
                      <option value="Grams" ${unit === 'Grams' ? 'selected' : ''}>Grams</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Price per Unit *</label>
                    <input type="number" step="0.01" class="form-control" value="${pricePerUnit || ''}" onchange="window.addProductionRecordInstance.data.formData.pricePerUnit = this.value;" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quality Grade</label>
                    <select class="form-select" onchange="window.addProductionRecordInstance.data.formData.qualityGrade = this.value;">
                      <option value="Grade A" ${qualityGrade === 'Grade A' ? 'selected' : ''}>Grade A</option>
                      <option value="Grade B" ${qualityGrade === 'Grade B' ? 'selected' : ''}>Grade B</option>
                      <option value="Grade C" ${qualityGrade === 'Grade C' ? 'selected' : ''}>Grade C</option>
                      <option value="Reject" ${qualityGrade === 'Reject' ? 'selected' : ''}>Reject</option>
                    </select>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary text-white" ${this.data.loading ? 'disabled' : ''}>${this.data.loading ? 'Saving...' : 'Create Record'}</button>
                  <a href="/#/livestock/production" class="btn-secondary">Cancel</a>
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
    window.addProductionRecordInstance = this;
    this.data.formData = {};
    this.data.loading = false;
    this.data.success = false;
    this.data.errorMessage = '';
    await this.fetchBatches();
  }
};

export default AddProductionRecord;
