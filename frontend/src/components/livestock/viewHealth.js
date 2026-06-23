import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const ViewHealth = {
  data: {
    loading: true,
    record: null,
    animals: [],
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
      this.data.errorMessage = 'Health record not found.';
      this.updateView();
      return;
    }

    this.data.loading = true;
    this.data.errorMessage = '';
    this.updateView();

    try {
      const [recordRes, animalsRes] = await Promise.all([
        livestockAPI.getHealthRecord(id).catch(() => ({ data: null })),
        livestockAPI.getAllRecords().catch(() => ({ data: [] }))
      ]);

      this.data.record = recordRes.data || recordRes || null;
      this.data.animals = animalsRes.data || [];
    } catch (error) {
      console.error('Error fetching health record:', error);
      this.data.errorMessage = 'Unable to load this health record.';
      this.data.record = null;
      this.data.animals = [];
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  getAnimalName(record) {
    const animalRef = record?.animal;

    if (animalRef && typeof animalRef === 'object') {
      if (animalRef.identificationNumber) {
        return animalRef.identificationNumber;
      }
      if (animalRef._id) {
        const matchedAnimal = this.data.animals.find((animal) => animal._id === animalRef._id);
        return matchedAnimal?.identificationNumber || 'Unassigned';
      }
    }

    if (typeof animalRef === 'string' || typeof animalRef === 'number') {
      const matchedAnimal = this.data.animals.find((animal) => animal._id === String(animalRef));
      return matchedAnimal?.identificationNumber || 'Unassigned';
    }

    return 'Unassigned';
  },

  render() {
    const record = this.data.record;
    const animalName = this.getAnimalName(record);

    const contentHtml = this.data.loading
      ? '<div class="loading-spinner"><p>Loading health record...</p></div>'
      : this.data.errorMessage || !record
        ? `
          <div class="content-panel">
            <div style="background:#f8d7da; color:#721c24; padding:14px; border-radius:6px;">
              ✗ ${this.data.errorMessage || 'Health record not found.'}
            </div>
          </div>
        `
        : `
          <div class="content-panel">
            <div class="content-header">
              <div>
                <h2>${record.recordType || 'Health Record'}</h2>
                <p style="margin: 4px 0 0; color: #6b7280;">${record.recordCode || 'Health event'}</p>
              </div>
              <a href="/#/livestock/health" class="btn-secondary">← Back to Health</a>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-top: 16px;">
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Animal</div>
                <div style="font-weight:600;">${animalName}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Date</div>
                <div style="font-weight:600;">${livestockUtils.formatDate(record.recordDate)}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Severity</div>
                <div style="font-weight:600;">${record.severity || 'Mild'}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Outcome</div>
                <div style="font-weight:600;">${record.outcome || 'Ongoing'}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Treatment</div>
                <div style="font-weight:600;">${record.treatment?.medicineName || 'No treatment recorded'}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Cost</div>
                <div style="font-weight:600;">${livestockUtils.formatCurrency(record.cost || 0)}</div>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <h3 style="margin-bottom: 8px;">Description</h3>
              <p style="margin:0; color:#374151;">${record.description || 'No description provided.'}</p>
            </div>
            <div style="margin-top: 16px;">
              <h3 style="margin-bottom: 8px;">Notes</h3>
              <p style="margin:0; color:#374151;">${record.notes || 'No additional notes.'}</p>
            </div>
          </div>
        `;

    return LivestockLayout.render({
      activePath: '/livestock/health',
      pageTitle: 'Health Record',
      description: 'Review health record details.',
      heroActions: `
        <a class="btn-primary text-white" href="/#/livestock/health/add">+ Add Record</a>
        <a class="btn-secondary text-white" href="/#/livestock/health">Back to Records</a>
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
    window.viewHealthInstance = this;
    this.fetchRecord();
  },

  vignette() {
    this.init();
  }
};

export default ViewHealth;
