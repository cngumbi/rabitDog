import DashboardMenu from '../dashboard/dashboardMenu';
import { getHealthSummary, getHealthRecords, createHealthRecord } from '../../connection/api';

const MedicalLogs = {
    vignette: async () => {
        const batchSelect = document.getElementById('healthBatchSelect');
        const historyBody = document.getElementById('medical-history-body');
        const summaryItems = {
            active: document.getElementById('active-batches-count'),
            due: document.getElementById('vaccination-due-count'),
            alerts: document.getElementById('health-alert-count'),
        };
        const form = document.getElementById('healthEntryForm');
        const statusMessage = document.getElementById('health-form-status');

        const getBatchesFromStorage = () => {
            const stored = localStorage.getItem('poultryBatches');
            return stored ? JSON.parse(stored) : [
                'Batch A-12',
                'Batch B-06',
                'House 3',
                'House 4'
            ];
        };

        const populateBatchOptions = () => {
            if (!batchSelect) return;
            const batches = getBatchesFromStorage();
            batchSelect.innerHTML = batches.map((batch) => `<option value="${batch}">${batch}</option>`).join('');
        };

        const formatDate = (iso) => {
            const date = new Date(iso);
            if (Number.isNaN(date.getTime())) return '';
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');
            return `${date.getFullYear()}-${month}-${day}`;
        };

        const getBadge = (value, type) => {
            const badgeType = type === 'severity'
                ? value === 'Critical' ? 'badge-red' : value === 'Watch' ? 'badge-orange' : 'badge-primary'
                : value === 'Recovered' || value === 'Resolved' ? 'badge-green' : value === 'Scheduled' ? 'badge-primary' : 'badge-orange';
            return `<span class="${badgeType} text-white">${value}</span>`;
        };

        const refreshSummary = async () => {
            const data = await getHealthSummary();
            if (data.error) {
                console.error('Health summary load failed', data.error);
                return;
            }
            summaryItems.active.textContent = data.activeBatches ?? 0;
            summaryItems.due.textContent = data.vaccinationDue ?? 0;
            summaryItems.alerts.textContent = data.healthAlerts ?? 0;
        };

        const refreshHistory = async () => {
            const records = await getHealthRecords();
            if (Array.isArray(records)) {
                historyBody.innerHTML = records.length
                    ? records.map((record) => {
                        return `
                            <tr>
                                <td>${record.batch}</td>
                                <td>${formatDate(record.date)}</td>
                                <td>${record.issue}</td>
                                <td>${getBadge(record.severity, 'severity')}</td>
                                <td>${getBadge(record.status, 'status')}</td>
                                <td>${record.action}</td>
                            </tr>
                        `;
                    }).join('')
                    : '<tr><td colspan="6" class="text-muted">No health records found.</td></tr>';
            } else {
                historyBody.innerHTML = '<tr><td colspan="6" class="text-danger">Unable to load records.</td></tr>';
            }
        };

        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const record = {
                    batch: document.getElementById('healthBatchSelect')?.value,
                    date: document.getElementById('healthDate')?.value,
                    severity: document.getElementById('healthSeverity')?.value,
                    issue: document.getElementById('healthIssue')?.value,
                    action: document.getElementById('healthAction')?.value,
                    notes: document.getElementById('healthNotes')?.value,
                };
                const result = await createHealthRecord(record);
                if (result.error) {
                    if (statusMessage) {
                        statusMessage.textContent = result.error;
                        statusMessage.className = 'form-error';
                    }
                    return;
                }
                if (statusMessage) {
                    statusMessage.textContent = 'Health record saved successfully.';
                    statusMessage.className = 'form-success';
                }
                form.reset();
                await refreshSummary();
                await refreshHistory();
            });
        }

        populateBatchOptions();
        await refreshSummary();
        await refreshHistory();
    },
    render: async () => {

        return `
            <div class="wrap">
                ${DashboardMenu.render({ selected: 'medicallogs' })}
                <div class="main">
                    <section class="dashboard-hero">
                      <div class="dashboard-hero-copy">
                        <span class="dashboard-pill">Health management</span>
                        <h1>Health Records</h1>
                        <p>Track health checks, treatments, and veterinary follow-ups for each batch.</p>
                        <div class="dashboard-hero-actions">
                          <a class="btn-primary text-white" href="/#/listingmedical">Health Records</a>
                          <a class="btn-secondary text-white" href="/#/manage-batches">Manage Batches</a>
                        </div>
                      </div>
                      <div class="dashboard-hero-meta" aria-label="Health snapshot">
                        <div class="dashboard-mini-stat">
                          <span class="dashboard-mini-stat-label">Active batches</span>
                          <span class="dashboard-mini-stat-value" id="active-batches-count">0</span>
                          <span class="dashboard-mini-stat-trend">Under monitoring</span>
                        </div>
                        <div class="dashboard-mini-stat">
                          <span class="dashboard-mini-stat-label">Vaccination due</span>
                          <span class="dashboard-mini-stat-value" id="vaccination-due-count">0</span>
                          <span class="dashboard-mini-stat-trend">Need review</span>
                        </div>
                        <div class="dashboard-mini-stat">
                          <span class="dashboard-mini-stat-label">Health alerts</span>
                          <span class="dashboard-mini-stat-value" id="health-alert-count">0</span>
                          <span class="dashboard-mini-stat-trend">Urgent</span>
                        </div>
                      </div>
                    </section>
                    <!--the records entry-->
                    <div class="grid-two">
                      <form class="panel" id="healthEntryForm">
                        <div class="card-title">New Health Entry</div>
                        <div id="health-form-status" class="mb-2"></div>
                        <label class="form-label">Batch / House</label>
                        <select class="form-select" name="batch" id="healthBatchSelect">
                          <option value="Batch A-12">Batch A-12</option>
                          <option value="Batch B-06">Batch B-06</option>
                          <option value="House 3">House 3</option>
                          <option value="House 4">House 4</option>
                        </select>

                        <div style="display:flex;gap:1rem;margin-top:0.75rem;flex-wrap:wrap;">
                          <div style="flex:1;min-width:140px;">
                            <label class="form-label">Record Date</label>
                            <input id="healthDate" class="form-control" type="date" name="date" value="${new Date().toISOString().slice(0, 10)}">
                          </div>
                          <div style="flex:1;min-width:140px;">
                            <label class="form-label">Severity</label>
                            <select id="healthSeverity" class="form-select" name="severity">
                              <option>Normal</option>
                              <option>Watch</option>
                              <option>Critical</option>
                            </select>
                          </div>
                        </div>

                        <label class="form-label mt-2">Health Issue</label>
                        <input id="healthIssue" class="form-control" name="issue" placeholder="Describe the issue">

                        <label class="form-label mt-2">Veterinary Action</label>
                        <select id="healthAction" class="form-select" name="action">
                          <option>Monitor</option>
                          <option>Vaccinate</option>
                          <option>Treat</option>
                          <option>Isolate</option>
                        </select>

                        <label class="form-label mt-2">Notes</label>
                        <textarea id="healthNotes" class="form-control" rows="4" name="notes" placeholder="Add notes or treatment details."></textarea>

                        <div class="mt-3" style="display:flex;gap:0.5rem;">
                          <button type="submit" class="btn-primary text-white">Save Health Record</button>
                          <button type="reset" class="btn-secondary">Reset</button>
                        </div>
                      </form>

                      <div class="page-panel">
                        <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                          <div class="card-title">Recent Health History</div>
                          <div class="text-muted" style="font-size:0.9rem;">Showing latest 25 records</div>
                        </div>

                        <div style="overflow-x:auto;">
                          <table class="table table-striped table-hover">
                            <thead>
                              <tr><th>Batch</th><th>Date</th><th>Issue</th><th>Severity</th><th>Status</th><th>Action</th></tr>
                            </thead>
                            <tbody id="medical-history-body">
                              <tr><td colspan="6" class="text-muted">Loading records…</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <!--end of records-->
                </div>
            </div>
        `;
    }
};

export default MedicalLogs;