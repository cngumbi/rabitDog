import DashboardMenu from '../dashboard/dashboardMenu';

const MedicalLogs = {
    vignette: () => {
        // Add event listeners or any interactive behavior here if needed
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
                          <a class="btn-primary text-white" href="/#s/listingmedical">Health Records</a>
                        </div>
                      </div>
                      <div class="dashboard-hero-meta" aria-label="Health snapshot">
                        <div class="dashboard-mini-stat">
                          <span class="dashboard-mini-stat-label">Active batches</span>
                          <span class="dashboard-mini-stat-value">6</span>
                          <span class="dashboard-mini-stat-trend">Under monitoring</span>
                        </div>
                        <div class="dashboard-mini-stat">
                          <span class="dashboard-mini-stat-label">Vaccination due</span>
                          <span class="dashboard-mini-stat-value">2</span>
                          <span class="dashboard-mini-stat-trend">Need review</span>
                        </div>
                        <div class="dashboard-mini-stat">
                          <span class="dashboard-mini-stat-label">Health alerts</span>
                          <span class="dashboard-mini-stat-value">1</span>
                          <span class="dashboard-mini-stat-trend">Urgent</span>
                        </div>
                      </div>
                    </section>
                    <!--the records entry-->
                    <div class="grid-two">
                      <form class="panel" id="healthEntryForm">
                        <div class="card-title">New Health Entry</div>
                        <label class="form-label">Batch / House</label>
                        <select class="form-select" name="batch">
                          <option>Batch A-12</option>
                          <option>Batch B-06</option>
                          <option>House 3</option>
                          <option>House 4</option>
                        </select>

                        <div style="display:flex;gap:1rem;margin-top:0.75rem;flex-wrap:wrap;">
                          <div style="flex:1;min-width:140px;">
                            <label class="form-label">Record Date</label>
                            <input class="form-control" type="date" name="date" value="2026-05-29">
                          </div>
                          <div style="flex:1;min-width:140px;">
                            <label class="form-label">Severity</label>
                            <select class="form-select" name="severity">
                              <option>Normal</option>
                              <option>Watch</option>
                              <option>Critical</option>
                            </select>
                          </div>
                        </div>

                        <label class="form-label mt-2">Health Issue</label>
                        <input class="form-control" name="issue" value="Respiratory irritation">

                        <label class="form-label mt-2">Veterinary Action</label>
                        <select class="form-select" name="action">
                          <option>Monitor</option>
                          <option>Vaccinate</option>
                          <option>Treat</option>
                          <option>Isolate</option>
                        </select>

                        <label class="form-label mt-2">Notes</label>
                        <textarea class="form-control" rows="4" name="notes">Birds showed mild coughing and reduced feed intake. Cleaned water lines and initiated observation schedule.</textarea>

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
                              <tr><th>Batch</th><th>Date</th><th>Issue</th><th>Severity</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Batch A-12</td>
                                <td>2026-05-22</td>
                                <td>Respiratory irritation</td>
                                <td><span class="badge-orange text-white">Watch</span></td>
                                <td><span class="badge-green text-white">Recovered</span></td>
                                <td><a href="#">View</a> · <a href="#">Edit</a></td>
                              </tr>
                              <tr>
                                <td>House 3</td>
                                <td>2026-05-20</td>
                                <td>Wet litter</td>
                                <td><span class="badge-primary text-white">Normal</span></td>
                                <td><span class="badge-green text-white">Resolved</span></td>
                                <td><a href="#">View</a> · <a href="#">Edit</a></td>
                              </tr>
                              <tr>
                                <td>Batch B-06</td>
                                <td>2026-05-18</td>
                                <td>Fever spike</td>
                                <td><span class="badge-orange text-white">Watch</span></td>
                                <td><span class="badge-primary text-white">Monitoring</span></td>
                                <td><a href="#">View</a> · <a href="#">Edit</a></td>
                              </tr>
                              <tr>
                                <td>House 4</td>
                                <td>2026-05-14</td>
                                <td>Vaccination due</td>
                                <td><span class="badge-primary text-white">Normal</span></td>
                                <td><span class="badge-primary text-white">Scheduled</span></td>
                                <td><a href="#">View</a> · <a href="#">Edit</a></td>
                              </tr>
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