import DashboardMenu from '../dashboard/dashboardMenu';
import { getHealthRecords, updateHealthRecord, deleteHealthRecord } from '../../connection/api';
import { livestockAPI } from '../../connection/livestockAPI';

const EditHealthRecord = {
    vignette: async () => {
        const form = document.getElementById('edit-health-form');
        const deleteBtn = document.getElementById('delete-health-record-btn');
        const statusMessage = document.getElementById('edit-health-status');
        const recordId = window.location.hash.split('/')[2];

        if (!recordId) {
            statusMessage.textContent = 'Invalid record ID.';
            statusMessage.className = 'form-error';
            return;
        }

        const formatDate = (iso) => {
            const date = new Date(iso);
            if (Number.isNaN(date.getTime())) return '';
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');
            return `${date.getFullYear()}-${month}-${day}`;
        };

        const loadRecord = async () => {
            const records = await getHealthRecords();
            if (!Array.isArray(records)) {
                statusMessage.textContent = 'Failed to load records.';
                statusMessage.className = 'form-error';
                return null;
            }
            const record = records.find((r) => r._id === recordId);
            if (!record) {
                statusMessage.textContent = 'Record not found.';
                statusMessage.className = 'form-error';
                return null;
            }
            return record;
        };

        const loadBatches = async () => {
            try {
                const response = await livestockAPI.getAllBatches().catch(() => ({ data: [] }));
                return response.data || [];
            } catch (error) {
                return [];
            }
        };

        const populateForm = (record, batches = []) => {
            const batchSelect = document.getElementById('edit-batch');
            const dateInput = document.getElementById('edit-date');
            const severitySelect = document.getElementById('edit-severity');
            const issueInput = document.getElementById('edit-issue');
            const actionSelect = document.getElementById('edit-action');
            const notesTextarea = document.getElementById('edit-notes');
            const statusSelect = document.getElementById('edit-status');

            if (batchSelect) {
                const resolvedBatchValue = typeof record.batch === 'object' ? (record.batch._id || '') : (record.batch || '');
                const resolvedBatchName = record.batchName || (typeof record.batch === 'object' ? (record.batch.batchName || record.batch.name || '') : '');

                if (Array.isArray(batches) && batches.length) {
                    batchSelect.innerHTML = batches.map((batch) => {
                        const batchName = batch.batchName || batch.name || 'Unnamed batch';
                        const batchValue = batch._id || batchName;
                        const isSelected = String(resolvedBatchValue) === String(batchValue) || String(resolvedBatchName) === String(batchName);
                        return `<option value="${batchValue}" ${isSelected ? 'selected' : ''}>${batchName}</option>`;
                    }).join('');
                } else {
                    batchSelect.innerHTML = `<option value="${resolvedBatchValue || ''}" selected>${resolvedBatchName || resolvedBatchValue || 'Unassigned'}</option>`;
                }
            }

            if (dateInput) dateInput.value = formatDate(record.date);
            if (severitySelect) severitySelect.value = record.severity || 'Normal';
            if (issueInput) issueInput.value = record.issue || '';
            if (actionSelect) actionSelect.value = record.action || 'Monitor';
            if (notesTextarea) notesTextarea.value = record.notes || '';
            if (statusSelect) statusSelect.value = record.status || 'Open';
        };

        const [record, batches] = await Promise.all([loadRecord(), loadBatches()]);
        if (!record) return;

        populateForm(record, batches);

        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const batchSelect = document.getElementById('edit-batch');
                const selectedBatchOption = batchSelect?.selectedOptions?.[0];
                const updatedData = {
                    batch: batchSelect?.value || '',
                    batchName: selectedBatchOption?.textContent?.trim() || '',
                    date: document.getElementById('edit-date')?.value,
                    severity: document.getElementById('edit-severity')?.value,
                    issue: document.getElementById('edit-issue')?.value,
                    action: document.getElementById('edit-action')?.value,
                    notes: document.getElementById('edit-notes')?.value,
                    status: document.getElementById('edit-status')?.value,
                };

                const result = await updateHealthRecord(recordId, updatedData);
                if (result.error) {
                    statusMessage.textContent = result.error;
                    statusMessage.className = 'form-error';
                    return;
                }

                statusMessage.textContent = 'Health record updated successfully!';
                statusMessage.className = 'form-success';
                setTimeout(() => {
                    document.location.hash = '/medicallogs';
                }, 1500);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (!confirm('Are you sure you want to delete this health record? This action cannot be undone.')) {
                    return;
                }

                const result = await deleteHealthRecord(recordId);
                if (result.error) {
                    statusMessage.textContent = result.error;
                    statusMessage.className = 'form-error';
                    return;
                }

                statusMessage.textContent = 'Health record deleted successfully.';
                statusMessage.className = 'form-success';
                setTimeout(() => {
                    document.location.hash = '/medicallogs';
                }, 1500);
            });
        }
    },
    render: async () => {
        return `
            <div class="wrap">
                ${DashboardMenu.render({ selected: 'medicallogs' })}
                <div class="main">
                    <div class="page-header">
                        <div>
                            <h1 class="font-xl">Edit Health Record</h1>
                            <p class="text-muted">Update health check details, treatment status, or actions for this batch.</p>
                        </div>
                        <div>
                            <a class="btn-secondary" href="/#/medicallogs">Back</a>
                        </div>
                    </div>

                    <section class="panel" style="margin-top: 1.5rem; max-width: 600px;">
                        <form id="edit-health-form">
                            <div id="edit-health-status" class="mb-2"></div>

                            <label class="form-label">Batch / House</label>
                            <select id="edit-batch" class="form-select" name="batch" required></select>

                            <div style="display:flex;gap:1rem;margin-top:0.75rem;flex-wrap:wrap;">
                                <div style="flex:1;min-width:140px;">
                                    <label class="form-label">Record Date</label>
                                    <input id="edit-date" class="form-control" type="date" name="date" required>
                                </div>
                                <div style="flex:1;min-width:140px;">
                                    <label class="form-label">Severity</label>
                                    <select id="edit-severity" class="form-select" name="severity">
                                        <option>Normal</option>
                                        <option>Watch</option>
                                        <option>Critical</option>
                                    </select>
                                </div>
                            </div>

                            <label class="form-label mt-2">Health Issue</label>
                            <input id="edit-issue" class="form-control" type="text" name="issue" placeholder="Describe the health issue" required>

                            <label class="form-label mt-2">Veterinary Action</label>
                            <select id="edit-action" class="form-select" name="action">
                                <option>Monitor</option>
                                <option>Vaccinate</option>
                                <option>Treat</option>
                                <option>Isolate</option>
                            </select>

                            <label class="form-label mt-2">Status</label>
                            <select id="edit-status" class="form-select" name="status">
                                <option>Open</option>
                                <option>Scheduled</option>
                                <option>Monitoring</option>
                                <option>Resolved</option>
                                <option>Recovered</option>
                            </select>

                            <label class="form-label mt-2">Notes</label>
                            <textarea id="edit-notes" class="form-control" rows="4" name="notes" placeholder="Add or update treatment notes."></textarea>

                            <div class="mt-3" style="display:flex;gap:0.5rem;justify-content:space-between;">
                                <div style="display:flex;gap:0.5rem;">
                                    <button type="submit" class="btn-primary text-white">Save Changes</button>
                                    <button type="button" class="btn-secondary" onclick="document.location.hash='/medicallogs'">Cancel</button>
                                </div>
                                <button id="delete-health-record-btn" type="button" class="btn-red text-white">Delete Record</button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        `;
    }
};

export default EditHealthRecord;
