import DashboardMenu from '../dashboard/dashboardMenu';
const NewTransfer = {
    vignette: ()=> {},
    render: ()=>{
        return `
        <div class="wrap">
            ${DashboardMenu.render({ selected: "transfers" })}
            <div class="main">
                <section class="dashboard-hero">
                  <div class="dashboard-hero-copy">
                    <span class="dashboard-pill">New transfer</span>
                    <h1>Launch a stock transfer</h1>
                    <p>Set movement details, validate routing, and prepare the transfer for receiving and reconciliation.</p>
                    <div class="dashboard-hero-actions">
                      <a class="btn-primary text-white" href="/#/transfers">Back to Transfers</a>
                    </div>
                  </div>
                  <div class="dashboard-hero-meta">
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Average lead time</span>
                      <span class="dashboard-mini-stat-value">1.8 hrs</span>
                      <span class="dashboard-mini-stat-trend">Across branches</span>
                    </div>
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Ready to dispatch</span>
                      <span class="dashboard-mini-stat-value">92%</span>
                      <span class="dashboard-mini-stat-trend">Checklist complete</span>
                    </div>
                  </div>
                </section>

                <section class="new-transfer-layout">
                  <article class="panel new-transfer-main-panel">
                    <div class="card-title">Movement details</div>

                    <div class="new-transfer-section-header">
                      <div>
                        <div class="new-transfer-section-title">Routing</div>
                        <div class="text-muted">Source and destination points</div>
                      </div>
                      <span class="badge-primary text-white">Required</span>
                    </div>

                    <div class="new-transfer-form-grid">
                      <div>
                        <label class="form-label">From location</label>
                        <select class="form-select">
                          <option>Main Store</option>
                          <option>Brooder House</option>
                          <option>Retail Outlet</option>
                        </select>
                      </div>
                      <div>
                        <label class="form-label">To location</label>
                        <select class="form-select">
                          <option>Retail Outlet</option>
                          <option>Main Store</option>
                          <option>North House</option>
                        </select>
                      </div>
                    </div>

                    <div class="new-transfer-section-header mt-3">
                      <div>
                        <div class="new-transfer-section-title">Item & quantity</div>
                        <div class="text-muted">Inventory selection and volume</div>
                      </div>
                    </div>

                    <div class="new-transfer-form-grid">
                      <div>
                        <label class="form-label">Item</label>
                        <select class="form-select">
                          <option>Layer Mash</option>
                          <option>Fresh Eggs</option>
                          <option>Vaccination Pack</option>
                        </select>
                      </div>
                      <div>
                        <label class="form-label">Quantity</label>
                        <input class="form-control" value="15">
                      </div>
                      <div class="new-transfer-span-2">
                        <label class="form-label">Transfer note</label>
                        <textarea class="form-control" rows="4">Prioritize warehouse pick-up and confirm receiving team before dispatch.</textarea>
                      </div>
                    </div>

                    <div class="new-transfer-section-header mt-3">
                      <div>
                        <div class="new-transfer-section-title">Dispatch window</div>
                        <div class="text-muted">Schedule and handling details</div>
                      </div>
                    </div>

                    <div class="new-transfer-form-grid">
                      <div>
                        <label class="form-label">Requested time</label>
                        <input class="form-control" type="time" value="09:30">
                      </div>
                      <div>
                        <label class="form-label">Courier/driver</label>
                        <select class="form-select">
                          <option>Delivery Team A</option>
                          <option>Transport Driver</option>
                        </select>
                      </div>
                    </div>

                    <div class="new-transfer-action-row">
                      <a class="btn-primary text-white" href="stock-transfer.html">Create Transfer</a>
                      <a class="btn-outline-primary text-primary" href="stock-transfer.html">Save Draft</a>
                    </div>
                  </article>

                  <aside class="panel new-transfer-side-panel">
                    <div class="card-title">Transfer summary</div>
                    <div class="new-transfer-summary-list">
                      <div class="new-transfer-summary-item">
                        <div class="new-transfer-summary-label">Route</div>
                        <strong>Main Store → Retail Outlet</strong>
                      </div>
                      <div class="new-transfer-summary-item">
                        <div class="new-transfer-summary-label">Item</div>
                        <strong>Layer Mash</strong>
                      </div>
                      <div class="new-transfer-summary-item">
                        <div class="new-transfer-summary-label">Quantity</div>
                        <strong>15 units</strong>
                      </div>
                      <div class="new-transfer-summary-item">
                        <div class="new-transfer-summary-label">ETA</div>
                        <strong>09:30 AM</strong>
                      </div>
                    </div>

                    <div class="new-transfer-helper-card">
                      <div class="new-transfer-helper-title">Checklist</div>
                      <p class="text-muted">Make sure the receiving outlet is ready and the transfer note matches the delivery handling instructions.</p>
                      <div class="new-transfer-check-list">
                        <div class="new-transfer-check-item"><span class="new-transfer-check-dot">✓</span><span>Inventory reserved</span></div>
                        <div class="new-transfer-check-item"><span class="new-transfer-check-dot">✓</span><span>Receiving point notified</span></div>
                        <div class="new-transfer-check-item"><span class="new-transfer-check-dot">✓</span><span>Dispatch slot assigned</span></div>
                      </div>
                    </div>
                  </aside>
                </section>
            </div>
        </div> 
        `
    }
};
export default NewTransfer;