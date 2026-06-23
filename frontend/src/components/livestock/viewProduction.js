import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const ViewProduction = {
  data: {
    loading: true,
    record: null,
    batches: [],
    errorMessage: ''
  },

  getRecordId() {
    const parts = window.location.hash.slice(1).split('/').filter(Boolean);
    return parts[2] || '';
  },

  async fetchRecord() {
    const id = this.getRecordId();
    if (!id) {
      this.data.loading = false;
      this.data.errorMessage = 'Production record not found.';
      this.updateView();
      return;
    }

    this.data.loading = true;
    this.data.errorMessage = '';
    this.updateView();

    try {
      const [recordRes, batchesRes] = await Promise.all([
        livestockAPI.getProductionRecord(id).catch(() => ({ data: null })),
        livestockAPI.getAllBatches().catch(() => ({ data: [] }))
      ]);

      this.data.record = recordRes.data || recordRes || null;
      this.data.batches = batchesRes.data || [];
    } catch (error) {
      console.error('Error fetching production record:', error);
      this.data.errorMessage = 'Unable to load this production record.';
      this.data.record = null;
      this.data.batches = [];
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  render() {
    const record = this.data.record;
    const batchName = record?.batch?.batchName || this.data.batches.find((batch) => batch._id === record?.batch)?.batchName || record?.batchName || 'Unassigned';

    const contentHtml = this.data.loading
      ? '<div class="loading-spinner"><p>Loading production record...</p></div>'
      : this.data.errorMessage || !record
        ? `
          <div class="content-panel">
            <div style="background:#f8d7da; color:#721c24; padding:14px; border-radius:6px;">
              ✗ ${this.data.errorMessage || 'Production record not found.'}
            </div>
          </div>
        `
        : `
          <div class="content-panel">
            <div class="content-header">
              <div>
                <h2>${record.productionType || 'Production Record'}</h2>
                <p style="margin: 4px 0 0; color: #6b7280;">${record.status || 'Produced'}</p>
              </div>
              <a href="/#/livestock/production" class="btn-secondary">← Back to Production</a>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-top: 16px;">
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Batch</div>
                <div style="font-weight:600;">${batchName}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Date</div>
                <div style="font-weight:600;">${livestockUtils.formatDate(record.productionDate)}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Quantity</div>
                <div style="font-weight:600;">${livestockUtils.formatNumber(record.quantity)} ${record.unit || ''}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Price / Unit</div>
                <div style="font-weight:600;">${livestockUtils.formatCurrency(record.pricePerUnit)}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Revenue</div>
                <div style="font-weight:600;">${livestockUtils.formatCurrency(record.revenue || 0)}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Expenses</div>
                <div style="font-weight:600;">${livestockUtils.formatCurrency(record.expenses || 0)}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Profit</div>
                <div style="font-weight:600;">${livestockUtils.formatCurrency((record.revenue || 0) - (record.expenses || 0))}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Quality</div>
                <div style="font-weight:600;">${record.quality || 'Grade A'}</div>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <h3 style="margin-bottom: 8px;">Notes</h3>
              <p style="margin:0; color:#374151;">${record.notes || 'No notes added for this production record.'}</p>
            </div>
          </div>
        `;

    return LivestockLayout.render({
      activePath: '/livestock/production',
      pageTitle: 'Production Record',
      description: 'Review production record details.',
      heroActions: `
        <a class="btn-primary text-white" href="/#/livestock/production/add">+ Add Record</a>
        <a class="btn-secondary text-white" href="/#/livestock/production">Back to Records</a>
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
    window.viewProductionInstance = this;
    this.fetchRecord();
  },

  vignette() {
    this.init();
  }
};

export default ViewProduction;
