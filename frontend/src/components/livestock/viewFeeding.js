import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const ViewFeeding = {
  data: {
    loading: true,
    record: null,
    batches: [],
    errorMessage: '',
    successMessage: ''
  },

  getRecordId() {
    const parts = window.location.hash.slice(1).split('/').filter(Boolean);
    return parts[2] || '';
  },

  async fetchRecord() {
    const id = this.getRecordId();
    if (!id) {
      this.data.loading = false;
      this.data.errorMessage = 'Feeding record not found.';
      this.updateView();
      return;
    }

    this.data.loading = true;
    this.data.errorMessage = '';
    this.data.successMessage = '';
    this.updateView();

    try {
      const [recordRes, batchesRes] = await Promise.all([
        livestockAPI.getFeedingRecord(id).catch(() => ({ data: null })),
        livestockAPI.getAllBatches().catch(() => ({ data: [] }))
      ]);

      this.data.record = recordRes.data || recordRes || null;
      this.data.batches = batchesRes.data || [];
    } catch (error) {
      console.error('Error fetching feeding record:', error);
      this.data.errorMessage = 'Unable to load this feeding record.';
      this.data.record = null;
      this.data.batches = [];
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  getBatchName(record) {
    if (!record) {
      return 'Unassigned';
    }

    const batchRef = record.batch;

    if (batchRef && typeof batchRef === 'object') {
      return batchRef.batchName || batchRef.name || 'Unassigned';
    }

    if (typeof batchRef === 'string' || typeof batchRef === 'number') {
      const matchedBatch = this.data.batches.find((batch) => batch._id === String(batchRef));
      return matchedBatch?.batchName || record.batchName || 'Unassigned';
    }

    return record.batchName || 'Unassigned';
  },

  render() {
    const record = this.data.record;
    const contentHtml = this.data.loading
      ? '<div class="loading-spinner"><p>Loading feeding record...</p></div>'
      : this.data.errorMessage || !record
        ? `
          <div class="content-panel">
            <div style="background:#f8d7da; color:#721c24; padding:14px; border-radius:6px;">
              ✗ ${this.data.errorMessage || 'Feeding record not found.'}
            </div>
          </div>
        `
        : `
          ${this.data.successMessage ? `<div class="flash-message success">✓ ${this.data.successMessage}</div>` : ''}
          <div class="content-panel">
            <div class="content-header">
              <div>
                <h2>${record.feedType || 'Feeding Record'}</h2>
                <p style="margin: 4px 0 0; color: #6b7280;">${record.feedingCode || 'No code yet'}</p>
              </div>
              <a href="/#/livestock/feeding" class="btn-secondary">← Back to Feeding</a>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-top: 16px;">
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Batch</div>
                <div style="font-weight:600;">${this.getBatchName(record)}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Date</div>
                <div style="font-weight:600;">${livestockUtils.formatDate(record.feedingDate)}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Quantity Fed</div>
                <div style="font-weight:600;">${livestockUtils.formatNumber(record.quantityFed)} kg</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Quantity Allocated</div>
                <div style="font-weight:600;">${livestockUtils.formatNumber(record.quantityAllocated)} kg</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Cost/kg</div>
                <div style="font-weight:600;">${livestockUtils.formatCurrency(record.costPerKg)}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Total Cost</div>
                <div style="font-weight:600;">${livestockUtils.formatCurrency(record.totalCost)}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Feed Quality</div>
                <div style="font-weight:600;">${record.feedQuality || 'Good'}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Animal Condition</div>
                <div style="font-weight:600;">${record.animalCondition || 'Normal consumption'}</div>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <h3 style="margin-bottom: 8px;">Notes</h3>
              <p style="margin:0; color:#374151;">${record.notes || 'No notes added for this feeding record.'}</p>
            </div>
          </div>
        `;

    return LivestockLayout.render({
      activePath: '/livestock/feeding',
      pageTitle: 'Feeding Record',
      description: 'Review feeding record details.',
      heroActions: `
        <a class="btn-primary text-white" href="/#/livestock/feeding/add">+ Add Record</a>
        <a class="btn-secondary text-white" href="/#/livestock/feeding">Back to Records</a>
      `,
      contentHtml
    });
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
    }
  },

  init() {
    window.viewFeedingInstance = this;
    this.fetchRecord();
  },

  vignette() {
    this.init();
  }
};

export default ViewFeeding;
