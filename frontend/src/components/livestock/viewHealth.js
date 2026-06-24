import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const ViewHealth = {
  data: {
    loading: true,
    record: null,
    animals: [],
    errorMessage: '',
    trackerDraft: {
      note: '',
      severity: ''
    },
    notesDraft: '',
    submitting: false,
    notesSubmitting: false,
    trackerPage: 1,
    trackerPageSize: 10
  },

  _listenersAttached: false,

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
      this.data.notesDraft = this.data.record?.notes || '';
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

  getTrackerDraft() {
    return this.data.trackerDraft || { note: '', severity: '' };
  },

  setTrackerDraft(field, value) {
    this.data.trackerDraft = this.data.trackerDraft || { note: '', severity: '' };
    this.data.trackerDraft[field] = value;
  },

  getNotesDraft() {
    return this.data.notesDraft || '';
  },

  setNotesDraft(value) {
    this.data.notesDraft = value;
  },

  async saveNotesUpdate() {
    const id = this.getRecordId();
    if (!id) {
      alert('Health record not found.');
      return;
    }

    try {
      this.data.notesSubmitting = true;
      this.updateView();

      await livestockAPI.updateHealthRecord(id, {
        notes: this.getNotesDraft()
      });

      await this.fetchRecord();
    } catch (error) {
      alert('Error: ' + livestockUtils.parseError(error));
    } finally {
      this.data.notesSubmitting = false;
      this.updateView();
    }
  },

  async saveTrackerUpdate() {
    const id = this.getRecordId();
    if (!id) {
      alert('Health record not found.');
      return;
    }

    const draft = this.getTrackerDraft();
    const note = (draft.note || '').trim();
    const severity = (draft.severity || '').trim();

    if (!note && !severity) {
      alert('Please add a note or choose a new severity.');
      return;
    }

    try {
      this.data.submitting = true;
      this.updateView();

      const payload = {};
      if (severity) {
        payload.severity = severity;
      }
      if (note) {
        payload.trackEntry = {
          message: 'Health tracker update',
          note,
          severity: severity || undefined
        };
      }

      await livestockAPI.updateHealthRecord(id, payload);
      this.data.trackerDraft = { note: '', severity: '' };
      await this.fetchRecord();
    } catch (error) {
      alert('Error: ' + livestockUtils.parseError(error));
    } finally {
      this.data.submitting = false;
      this.updateView();
    }
  },

  attachEventListeners() {
    if (this._listenersAttached) {
      return;
    }

    const container = document.getElementById('main-content') || document;
    if (!container) {
      return;
    }

    this._listenersAttached = true;

    container.addEventListener('input', (event) => {
      if (event.target.matches('[data-role="tracker-note-input"]')) {
        this.setTrackerDraft('note', event.target.value);
      }

      if (event.target.matches('[data-role="notes-input"]')) {
        this.setNotesDraft(event.target.value);
      }
    });

    container.addEventListener('change', (event) => {
      if (event.target.matches('[data-role="tracker-severity-select"]')) {
        this.setTrackerDraft('severity', event.target.value);
      }
    });

    container.addEventListener('click', async (event) => {
      if (event.target.matches('[data-role="tracker-submit"]')) {
        event.preventDefault();
        await this.saveTrackerUpdate();
      }

      if (event.target.matches('[data-role="notes-submit"]')) {
        event.preventDefault();
        await this.saveNotesUpdate();
      }

      if (event.target.matches('[data-role="tracker-page-prev"]')) {
        event.preventDefault();
        if (this.data.trackerPage > 1) {
          this.data.trackerPage -= 1;
          this.updateView();
        }
      }

      if (event.target.matches('[data-role="tracker-page-next"]')) {
        event.preventDefault();
        if (this.data.trackerPage < Math.max(1, Math.ceil(this.getTrackerEntries(this.data.record).length / this.data.trackerPageSize))) {
          this.data.trackerPage += 1;
          this.updateView();
        }
      }
    });
  },

  getTrackerEntries(record) {
    const animalEntries = Array.isArray(record?.animal?.trackerActivities) ? [...record.animal.trackerActivities] : [];
    const recordEntries = Array.isArray(record?.trackEntries) ? [...record.trackEntries] : [];

    return animalEntries.length ? animalEntries : recordEntries;
  },

  getPaginatedTrackerEntries(record) {
    const entries = [...this.getTrackerEntries(record)].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const startIndex = (this.data.trackerPage - 1) * this.data.trackerPageSize;
    const endIndex = startIndex + this.data.trackerPageSize;

    return {
      totalPages: Math.max(1, Math.ceil(entries.length / this.data.trackerPageSize)),
      entries: entries.slice(startIndex, endIndex)
    };
  },

  render() {
    const record = this.data.record;
    const animalName = this.getAnimalName(record);
    const trackerDraft = this.getTrackerDraft();
    const notesDraft = this.getNotesDraft();
    const pagedTracker = this.getPaginatedTrackerEntries(record);
    const trackerEntries = pagedTracker.entries;
    const totalTrackerPages = pagedTracker.totalPages;

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
            <div style="margin-top: 20px;">
              <h3 style="margin-bottom: 8px;">Notes</h3>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px; margin-top:8px;">
                <textarea class="form-control" rows="4" data-role="notes-input" placeholder="Add or update the animal notes">${notesDraft}</textarea>
                <div style="margin-top: 12px;">
                  <button class="btn-secondary" type="button" data-role="notes-submit" ${this.data.notesSubmitting ? 'disabled' : ''}>${this.data.notesSubmitting ? 'Saving...' : 'Save Notes'}</button>
                </div>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <h3 style="margin-bottom: 8px;">Health Tracker</h3>
              <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:14px; margin-top:8px;">
                <div style="display:grid; gap:12px; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); align-items:end;">
                  <div>
                    <label style="display:block; font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">New Severity</label>
                    <select class="form-select" data-role="tracker-severity-select" value="${trackerDraft.severity || ''}">
                      <option value="" ${!trackerDraft.severity ? 'selected' : ''}>Keep current</option>
                      <option value="Mild" ${trackerDraft.severity === 'Mild' ? 'selected' : ''}>Mild</option>
                      <option value="Moderate" ${trackerDraft.severity === 'Moderate' ? 'selected' : ''}>Moderate</option>
                      <option value="Severe" ${trackerDraft.severity === 'Severe' ? 'selected' : ''}>Severe</option>
                      <option value="Critical" ${trackerDraft.severity === 'Critical' ? 'selected' : ''}>Critical</option>
                      <option value="Healed" ${trackerDraft.severity === 'Healed' ? 'selected' : ''}>Healed</option>
                    </select>
                  </div>
                  <div style="grid-column: span 2; min-width: 0;">
                    <label style="display:block; font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:6px;">Follow-up Note</label>
                    <textarea class="form-control" rows="2" data-role="tracker-note-input" placeholder="Add a new health note, treatment update, or observation">${trackerDraft.note || ''}</textarea>
                  </div>
                </div>
                <div style="margin-top: 12px;">
                  <button class="btn-primary" type="button" data-role="tracker-submit" ${this.data.submitting ? 'disabled' : ''}>${this.data.submitting ? 'Saving...' : 'Log Update'}</button>
                </div>
              </div>
              <h3 style="margin-bottom: 8px; margin-top: 20px;">Health Tracker Activity</h3>
              ${trackerEntries.length
                ? `<div style="display:grid; gap:12px; margin-top:8px;">${trackerEntries.map((entry) => `
                    <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
                      <div style="display:flex; justify-content:space-between; gap:8px; align-items:center;">
                        <strong>${entry.note || entry.message || 'Tracker update'}</strong>
                        <span style="font-size:12px; color:#6b7280;">${livestockUtils.formatDate(entry.createdAt || record.recordDate)}</span>
                      </div>
                      ${entry.severity ? `<div style="margin-top:6px; color:#374151;">Severity: ${entry.severity}</div>` : ''}
                    </div>
                  `).join('')}</div>`
                : '<p style="margin:0; color:#374151;">No tracker activity yet.</p>'}
              ${totalTrackerPages > 1 ? `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
                  <button class="btn-secondary" type="button" data-role="tracker-page-prev" ${this.data.trackerPage <= 1 ? 'disabled' : ''}>← Previous</button>
                  <span style="font-size:12px; color:#6b7280;">Page ${this.data.trackerPage} of ${totalTrackerPages}</span>
                  <button class="btn-secondary" type="button" data-role="tracker-page-next" ${this.data.trackerPage >= totalTrackerPages ? 'disabled' : ''}>Next →</button>
                </div>
              ` : ''}
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
      this.attachEventListeners();
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
