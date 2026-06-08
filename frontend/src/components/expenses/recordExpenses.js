import DashboardMenu from '../dashboard/dashboardMenu';
const RecordExpenses = {
    vignette: ()=> {},
    render: ()=>{
       return `
        <div class="wrap">
            ${DashboardMenu.render({ selected: "expenses" })}
            <div class="main">
                <section class="dashboard-hero">
                  <div class="dashboard-hero-copy">
                    <span class="dashboard-pill">Expense capture</span>
                    <h1>Record an expense</h1> 
                    <p>Log vendor spend, categorize operating costs, and keep payment method and reference details aligned for audit and reconciliation.</p>
                    <div class="dashboard-hero-actions">
                      <a class="btn-primary text-white" href="/#/expenses">Back to expenses</a>
                    </div>
                  </div>
                  <div class="dashboard-hero-meta">
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Pending bills</span>
                      <span class="dashboard-mini-stat-value">7</span>
                      <span class="dashboard-mini-stat-trend">Including utilities</span>
                    </div>
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Recent spend</span>
                      <span class="dashboard-mini-stat-value">Ksh 28,750</span>
                      <span class="dashboard-mini-stat-trend">Today’s entries</span>
                    </div>
                  </div>
                </section>

                <section class="dashboard-kpi-grid">
                  <article class="card-metric">
                    <div class="icon">🏷️</div>
                    <div>
                      <div class="metric-title">Expense categories</div>
                      <div class="metric-value">5</div>
                      <div class="metric-desc metric-desc--info">Feed, utilities, transport</div>
                    </div>
                  </article>
                  <article class="card-metric">
                    <div class="icon">💳</div>
                    <div>
                      <div class="metric-title">Cash payments</div>
                      <div class="metric-value">64%</div>
                      <div class="metric-desc metric-desc--success">Strong cash usage</div>
                    </div>
                  </article>
                  <article class="card-metric">
                    <div class="icon">📅</div>
                    <div>
                      <div class="metric-title">Average approval</div>
                      <div class="metric-value">18h</div>
                      <div class="metric-desc metric-desc--info">Fast review</div>
                    </div>
                  </article>
                  <article class="card-metric">
                    <div class="icon">✅</div>
                    <div>
                      <div class="metric-title">Reconciled</div>
                      <div class="metric-value">81%</div>
                      <div class="metric-desc metric-desc--success">Cashbook match</div>
                    </div>
                  </article>
                </section>

                <section class="dashboard-enterprise-section">
                  <article class="panel">
                    <div class="card-title">Expense entry</div>

                    <div class="dashboard-form-grid">
                      <div>
                        <label class="form-label">Vendor</label>
                        <input class="form-control" value="Cleaning Services">
                      </div>
                      <div>
                        <label class="form-label">Category</label>
                        <select class="form-select">
                          <option>Feed</option>
                          <option>Operations</option>
                          <option>Transport</option>
                          <option>Utilities</option>
                        </select>
                      </div>
                      <div>
                        <label class="form-label">Amount</label>
                        <input class="form-control" type="number" value="4800">
                      </div>
                      <div>
                        <label class="form-label">Date</label>
                        <input class="form-control" type="date" value="2026-05-29">
                      </div>
                      <div>
                        <label class="form-label">Payment method</label>
                        <select class="form-select">
                          <option>Cash</option>
                          <option>Bank</option>
                          <option>Mpesa</option>
                        </select>
                      </div>
                      <div>
                        <label class="form-label">Reference</label>
                        <input class="form-control" placeholder="Invoice or receipt number">
                      </div>
                      <div class="dashboard-form-span-2">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" rows="4">Cleaning and hygiene service for the retail unit.</textarea>
                      </div>
                    </div>

                    <div class="dashboard-action-row mt-3">
                      <a class="btn-primary text-white" href="expenses.html">Save expense</a>
                      <a class="btn-outline-primary text-primary" href="#">Save draft</a>
                      <a class="btn-secondary text-white" href="#">Reset</a>
                    </div>
                  </article>

                  <aside class="dashboard-side-stack">
                    <div class="panel">
                      <div class="card-title">Expense summary</div>
                      <div class="sales-report-summary-list">
                        <div class="sales-report-summary-item">
                          <div class="text-muted">Selected vendor</div>
                          <strong>Cleaning Services</strong>
                        </div>
                        <div class="sales-report-summary-item">
                          <div class="text-muted">Estimated total</div>
                          <strong>Ksh 4,800</strong>
                        </div>
                        <div class="sales-report-summary-item">
                          <div class="text-muted">Payment route</div>
                          <strong>Cash</strong>
                        </div>
                        <div class="sales-report-summary-item">
                          <div class="text-muted">Reconciliation</div>
                          <strong>Pending</strong>
                        </div>
                      </div>
                    </div>

                    <div class="panel">
                      <div class="card-title">Quick guidance</div>
                      <p class="text-muted">Record expenses with a clear reference number, category, and purpose to make accounting and approval faster.</p>
                    </div>

                    <div class="panel">
                      <div class="card-title">Recent expense entries</div>
                      <div class="table-wrap">
                        <table class="table table-striped mt-2">
                          <thead>
                            <tr><th>Date</th><th>Vendor</th><th>Amount</th></tr>
                          </thead>
                          <tbody>
                            <tr><td>May 29</td><td>Cleaning Services</td><td>Ksh 4,800</td></tr>
                            <tr><td>May 28</td><td>Feed Supplier</td><td>Ksh 15,200</td></tr>
                            <tr><td>May 27</td><td>Vehicle Service</td><td>Ksh 7,250</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </aside>
                </section>
            </div>
        </div>
        `
    }
};
export default RecordExpenses;