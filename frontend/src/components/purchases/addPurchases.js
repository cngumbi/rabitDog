import DashboardMenu from '../dashboard/dashboardMenu';
const CreatePO = {
    vignette: ()=> {},
    render: ()=>{
       return `
        <div class="wrap">
            ${DashboardMenu.render({ selected: "purchases" })}
            <div class="main">
               <section class="dashboard-hero">
                  <div class="dashboard-hero-copy">
                    <span class="dashboard-pill">Procurement builder</span>
                    <h1>Create purchase order</h1>
                    <p>Build a procurement document, capture delivery terms, and review the order before sending it into approval.</p>
                    <div class="dashboard-hero-actions">
                      <a class="btn-primary text-white" href="/#/purchases">Back to Purchases</a>
                    </div>
                  </div>
                  <div class="dashboard-hero-meta">
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Draft completion</span>
                      <span class="dashboard-mini-stat-value">96%</span>
                      <span class="dashboard-mini-stat-trend">Ready to review</span>
                    </div>
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Estimated total</span>
                      <span class="dashboard-mini-stat-value">Ksh 0</span>
                      <span class="dashboard-mini-stat-trend">Pending line items</span>
                    </div>
                  </div>
                </section>

                <section class="create-po-layout">
                  <article class="panel create-po-main-panel">
                    <div class="card-title">Order details</div>

                    <div class="create-po-section-header">
                      <div>
                        <div class="create-po-section-title">Supplier & delivery</div>
                        <div class="text-muted">Vendor, schedule, and logistics</div>
                      </div>
                      <span class="badge-primary text-white">Required</span>
                    </div>

                    <div class="create-po-form-grid">
                      <div>
                        <label class="form-label">Supplier</label>
                        <select class="form-select">
                          <option>Agrichem Supply</option>
                          <option>Farm Tools Co.</option>
                          <option>Poultry Feed Pro</option>
                          <option>VetCare Plus</option>
                        </select>
                      </div>
                      <div>
                        <label class="form-label">Order owner</label>
                        <select class="form-select">
                          <option>Admin</option>
                          <option>Procurement</option>
                          <option>Finance</option>
                        </select>
                      </div>
                      <div>
                        <label class="form-label">Delivery date</label>
                        <input class="form-control" type="date" value="2026-06-10">
                      </div>
                      <div>
                        <label class="form-label">Payment term</label>
                        <select class="form-select">
                          <option>Net 15</option>
                          <option>Net 30</option>
                          <option>Cash on delivery</option>
                        </select>
                      </div>
                    </div>

                    <div class="create-po-section-header mt-3">
                      <div>
                        <div class="create-po-section-title">Line items</div>
                        <div class="text-muted">Select product, quantity, and unit pricing</div>
                      </div>
                    </div>

                    <div class="create-po-form-grid">
                      <div>
                        <label class="form-label">Product</label>
                        <select class="form-select">
                          <option>Layer Mash</option>
                          <option>Vaccines</option>
                          <option>Waterers</option>
                          <option>Broiler Mash</option>
                        </select>
                      </div>
                      <div>
                        <label class="form-label">Category</label>
                        <select class="form-select">
                          <option>Feed</option>
                          <option>Medicine</option>
                          <option>Equipment</option>
                        </select>
                      </div>
                      <div>
                        <label class="form-label">Quantity</label>
                        <input class="form-control" value="20">
                      </div>
                      <div>
                        <label class="form-label">Unit price</label>
                        <input class="form-control" value="950">
                      </div>
                      <div class="create-po-span-2">
                        <label class="form-label">Notes</label>
                        <textarea class="form-control" rows="4">Urgent delivery for feed replenishment and scheduled stock top-up.</textarea>
                      </div>
                    </div>

                    <div class="create-po-section-header mt-3">
                      <div>
                        <div class="create-po-section-title">Line item preview</div>
                        <div class="text-muted">Current order composition</div>
                      </div>
                    </div>

                    <div class="table-wrap">
                      <table class="table table-striped">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Layer Mash</td>
                            <td>Feed</td>
                            <td>20</td>
                            <td>Ksh 950</td>
                            <td>Ksh 19,000</td>
                          </tr>
                          <tr>
                            <td>Vaccines</td>
                            <td>Medicine</td>
                            <td>5</td>
                            <td>Ksh 1,200</td>
                            <td>Ksh 6,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div class="create-po-action-row">
                      <a class="btn-primary text-white" href="purchases.html">Save PO</a>
                      <a class="btn-outline-primary text-primary" href="purchases.html">Add another line</a>
                    </div>
                  </article>

                  <aside class="panel create-po-side-panel">
                    <div class="card-title">Order summary</div>
                    <div class="create-po-summary-list">
                      <div class="create-po-summary-item">
                        <div class="create-po-summary-label">Supplier</div>
                        <strong>Agrichem Supply</strong>
                      </div>
                      <div class="create-po-summary-item">
                        <div class="create-po-summary-label">Delivery date</div>
                        <strong>June 10, 2026</strong>
                      </div>
                      <div class="create-po-summary-item">
                        <div class="create-po-summary-label">Items</div>
                        <strong>2 line items</strong>
                      </div>
                      <div class="create-po-summary-item">
                        <div class="create-po-summary-label">Estimated total</div>
                        <strong>Ksh 25,000</strong>
                      </div>
                    </div>

                    <div class="create-po-helper-card">
                      <div class="create-po-helper-title">Approval checklist</div>
                      <p class="text-muted">Confirm supplier terms, delivery readiness, and budget coverage before routing to finance and store management.</p>
                      <div class="create-po-check-list">
                        <div class="create-po-check-item"><span class="create-po-check-dot">✓</span><span>Budget allocation confirmed</span></div>
                        <div class="create-po-check-item"><span class="create-po-check-dot">✓</span><span>Delivery window approved</span></div>
                        <div class="create-po-check-item"><span class="create-po-check-dot">✓</span><span>Supplier terms reviewed</span></div>
                      </div>
                    </div>
                  </aside>
                </section>


            </div>
        </div>
        `
    }
};
export default CreatePO;