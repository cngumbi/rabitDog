import DashboardMenu from '../dashboard/dashboardMenu';

const ListMedicalLogs = {
    vignette: () => {
        // Add event listeners or any interactive behavior here if needed
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
                        <input aria-label="Search health records" placeholder="Search by batch, issue or note" class="form-control" type="search">
                      </div>
                      <div class="col-xs-12 col-sm-4" style="display:flex;gap:0.5rem;justify-content:flex-end;align-items:center;">
                        <select class="form-select">
                          <option value="">All Severities</option>
                          <option>Normal</option>
                          <option>Watch</option>
                          <option>Critical</option>
                        </select>
                        <a class="btn-primary text-white" href="#">Search</a>
                      </div>
                    </div>
                    <div class="row" style="align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
                      <div>
                        <span class="badge-primary">Normal</span>
                        <span class="badge-orange">Watch</span>
                        <span class="badge-red">Critical</span>
                      </div>
                      <div style="margin-left:auto;">
                        <a href="#" class="btn-outline-primary">Export CSV</a>
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
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Batch A-12</td>
                            <td>2026-05-29</td>
                            <td>Respiratory irritation</td>
                            <td><span class="badge-orange text-white">Watch</span></td>
                            <td>Monitor</td>
                            <td><span class="badge-green text-white">Recovered</span></td>
                            <td>Observed coughing; waterlines cleaned.</td>
                          </tr>
                          <tr>
                            <td>House 3</td>
                            <td>2026-05-28</td>
                            <td>Wet litter</td>
                            <td><span class="badge-primary text-white">Normal</span></td>
                            <td>Cleaned</td>
                            <td><span class="badge-green text-white">Resolved</span></td>
                            <td>Increased bedding and ventilation.</td>
                          </tr>
                          <tr>
                            <td>Batch B-06</td>
                            <td>2026-05-27</td>
                            <td>Fever spike</td>
                            <td><span class="badge-red text-white">Critical</span></td>
                            <td>Treat</td>
                            <td><span class="badge-orange text-white">Monitoring</span></td>
                            <td>Vet notified; treatment started.</td>
                          </tr>
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