import DashboardMenu from '../dashboard/dashboardMenu';
import { getHealthRecords } from '../../connection/api';
import { livestockAPI } from '../../connection/livestockAPI';

const ListMedicalLogs = {
    vignette: async () => {
        const searchInput = document.getElementById('health-search-keyword');
        const filterSelect = document.getElementById('health-severity-filter');
        const tableBody = document.getElementById('health-records-body');
        const searchButton = document.getElementById('health-search-button');
        const exportButton = document.getElementById('health-export-button');
        let livestockBatches = [];

        const resolveBatchDisplayName = (batchValue, record = {}) => {
            if (!batchValue) return record.batchName || 'Unassigned';

            if (typeof batchValue === 'object') {
                return batchValue.batchName || batchValue.name || batchValue.label || record.batchName || 'Unassigned';
            }

            if (record.batchName) {
                return record.batchName;
            }

            const batchId = String(batchValue);
            const matchedBatch = livestockBatches.find((batch) => {
                const candidateId = batch._id || '';
                const candidateName = batch.batchName || batch.name || '';
                return candidateId === batchId || candidateName === batchId;
            });

            return matchedBatch?.batchName || matchedBatch?.name || batchValue;
        };

        const populateBatchOptions = async () => {
            try {
                const response = await livestockAPI.getAllBatches();
                livestockBatches = Array.isArray(response?.data) ? response.data : [];
            } catch (error) {
                console.error('Unable to load livestock batches for medical records', error);
                livestockBatches = [];
            }
        };

        const formatDate = (iso) => {
            const date = new Date(iso);
            if (Number.isNaN(date.getTime())) return '';
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');
            return `${date.getFullYear()}-${month}-${day}`;
        };

        const getBadgeClass = (value) => {
            if (value === 'Critical') return 'badge-red';
            if (value === 'Watch') return 'badge-orange';
            return 'badge-primary';
        };

        const loadRecords = async () => {
            const records = await getHealthRecords({
                searchKeyword: searchInput?.value || '',
                severity: filterSelect?.value || '',
            });
            if (!Array.isArray(records)) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-danger">Failed to load health records.</td></tr>';
                return;
            }
            if (!records.length) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-muted">No records matched your search.</td></tr>';
                return;
            }
            tableBody.innerHTML = records.map((record) => `
                <tr>
                  <td>${resolveBatchDisplayName(record.batch, record)}</td>
                  <td>${formatDate(record.date)}</td>
                  <td>${record.issue}</td>
                  <td><span class="${getBadgeClass(record.severity)} text-white">${record.severity}</span></td>
                  <td>${record.action}</td>
                  <td><span class="${record.status === 'Recovered' || record.status === 'Resolved' ? 'badge-green' : record.status === 'Critical' ? 'badge-red' : 'badge-primary'} text-white">${record.status}</span></td>
                  <td>${record.notes ? record.notes : '—'}</td>
                  <td><a href="/#/health/${record._id}/edit">Edit</a></td>
                </tr>
            `).join('');
        };

        if (searchButton) {
            searchButton.addEventListener('click', async (event) => {
                event.preventDefault();
                await loadRecords();
            });
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', async () => {
                await loadRecords();
            });
        }

        if (exportButton) {
            exportButton.addEventListener('click', async () => {
                const records = await getHealthRecords({
                    searchKeyword: searchInput?.value || '',
                    severity: filterSelect?.value || '',
                });
                if (!Array.isArray(records) || !records.length) {
                    return;
                }
                const csv = [
                    ['Batch', 'Date', 'Issue', 'Severity', 'Action', 'Status', 'Notes'],
                    ...records.map((record) => [
                        resolveBatchDisplayName(record.batch, record),
                        formatDate(record.date),
                        record.issue,
                        record.severity,
                        record.action,
                        record.status,
                        record.notes || '',
                    ])
                ].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'health-records.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }

        await populateBatchOptions();
        await loadRecords();
    },
    render: async () => {

        return `
            <div class="wrap">
                ${DashboardMenu.render({ selected: 'medicallogs' })}
                <div class="main">
                  <div class="page-header">
                    <div>
                      <h1 class="font-xl">Health Records</h1>
                      <p class="text-muted">Track health checks, treatments, and veterinary follow-ups for each batch.</p>
                    </div>
                    <div>
                      <a class="btn-primary text-white" href="/#/medicallogs">Back</a>
                    </div>
                  </div>
                  <!--teble section-->
                  <section class="panel" style="margin-top:1.5rem;">
                    <div class="card-title">All Health Entries</div>
                      <div class="row gap-1 page-controls" style="margin-bottom:1rem;">
                      <div class="col-xs-12 col-sm-8">
                        <input id="health-search-keyword" aria-label="Search health records" placeholder="Search by batch, issue or note" class="form-control" type="search">
                      </div>
                      <div class="col-xs-12 col-sm-4" style="display:flex;gap:0.5rem;justify-content:flex-end;align-items:center;">
                        <select id="health-severity-filter" class="form-select">
                          <option value="">All Severities</option>
                          <option>Normal</option>
                          <option>Watch</option>
                          <option>Critical</option>
                        </select>
                        <button id="health-search-button" type="button" class="btn-primary text-white">Search</button>
                      </div>
                    </div>
                    <div class="row" style="align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
                      <div>
                        <span class="badge-primary">Normal</span>
                        <span class="badge-orange">Watch</span>
                        <span class="badge-red">Critical</span>
                      </div>
                      <div style="margin-left:auto;">
                        <button id="health-export-button" type="button" class="btn-outline-primary">Export CSV</button>
                      </div>
                    </div>
                    <div style="overflow-x:auto;">
                      <table class="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>Batch</th>
                            <th>Date</th>
                            <th>Issue</th>
                            <th>Severity</th>
                            <th>Action</th>
                            <th>Status</th>
                            <th>Notes</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody id="health-records-body">
                          <tr><td colspan="8" class="text-muted">Loading health records…</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                  <!--end of table -->
                </div>
            </div>
        `;
    }
};

export default ListMedicalLogs;