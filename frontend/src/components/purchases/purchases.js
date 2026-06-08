import DashboardMenu from '../dashboard/dashboardMenu';
import { getPurchaseStats, getPurchases } from '../../connection/api';

const Purchases = {
    vignette: ()=> {},
    render: async ()=>{
        try {
            const stats = await getPurchaseStats();
            const purchases = await getPurchases();

            if (stats.error || purchases.error) {
                const errorMsg = stats.error || purchases.error;
                return `
                    <div class="wrap">
                        ${DashboardMenu.render({ selected: "purchases" })}
                        <div class="main">
                            <div class="alert alert-danger">Error loading purchases: ${errorMsg}</div>
                        </div>
                    </div>
                `;
            }

            // Build purchase order rows
            const purchaseRows = purchases.slice(0, 10).map((purchase) => {
                const statusBadge = purchase.status === 'approved' ? 'badge-primary' : 
                                   purchase.status === 'pending' ? 'badge-orange' :
                                   purchase.status === 'received' ? 'badge-green' :
                                   'badge-gray';
                const supplierName = purchase.supplier?.name || 'Unknown Supplier';
                const itemsCount = (purchase.purchaseItems || []).length;
                
                return `
                    <div class="purchases-order-row">
                        <div class="purchases-order-icon">📦</div>
                        <div class="purchases-order-copy">
                            <div class="purchases-order-name">${purchase.poNumber}</div>
                            <div class="purchases-order-subtitle">${supplierName} • ${itemsCount} items • ETA ${purchase.expectedDeliveryDate ? new Date(purchase.expectedDeliveryDate).toLocaleDateString() : 'TBD'}</div>
                        </div>
                        <div class="purchases-order-meta">
                            <div class="purchases-order-amount">Ksh ${(purchase.estimatedTotal || 0).toLocaleString()}</div>
                            <span class="${statusBadge} text-white">${purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}</span>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "purchases" })}
                    <div class="main">
                        <section class="dashboard-hero">
                          <div class="dashboard-hero-copy">
                            <span class="dashboard-pill">Procurement</span>
                            <h1>Purchase operations</h1>
                            <p>Monitor supplier orders, approvals, and delivery risk from one procurement command center.</p>
                            <div class="dashboard-hero-actions">
                              <a class="btn-primary text-white" href="/#/create-po">Create PO</a>
                              <a class="btn-outline-primary text-primary" href="/#/purchases/export">Export ledger</a>
                            </div>
                          </div>
                          <div class="dashboard-hero-meta">
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">Open POs</span>
                              <span class="dashboard-mini-stat-value">${stats.openPOs || 0}</span>
                              <span class="dashboard-mini-stat-trend">▲ ${stats.pendingApprovals || 0} awaiting review</span>
                            </div>
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">Spend this month</span>
                              <span class="dashboard-mini-stat-value">Ksh ${(stats.spendThisMonth || 0).toLocaleString()}</span>
                              <span class="dashboard-mini-stat-trend">● This month total</span>
                            </div>
                          </div>
                        </section>

                        <section class="dashboard-kpi-grid">
                          <article class="card-metric">
                            <div class="icon">📦</div>
                            <div>
                              <div class="metric-title">Open purchase orders</div>
                              <div class="metric-value">${stats.openPOs || 0}</div>
                              <div class="metric-desc metric-desc--info">${stats.dueThisWeek || 0} due this week</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">✅</div>
                            <div>
                              <div class="metric-title">Approved</div>
                              <div class="metric-value">${stats.approved || 0}</div>
                              <div class="metric-desc metric-desc--success">Ready for receiving</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">⏳</div>
                            <div>
                              <div class="metric-title">Pending approval</div>
                              <div class="metric-value">${stats.pendingApprovals || 0}</div>
                              <div class="metric-desc metric-desc--danger">Requires manager review</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">💸</div>
                            <div>
                              <div class="metric-title">Recent spend</div>
                              <div class="metric-value">Ksh ${(stats.recentSpend || 0).toLocaleString()}</div>
                              <div class="metric-desc metric-desc--info">Month spend</div>
                            </div>
                          </article>
                        </section>

                        <section class="purchases-layout">
                          <article class="panel purchases-main-panel">
                            <div class="card-title">Purchase pipeline</div>
                            <div class="purchases-order-list">
                              ${purchaseRows || '<div class="alert alert-info">No purchase orders yet</div>'}
                            </div>
                          </article>
                        </section>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering purchases:', error);
            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "purchases" })}
                    <div class="main">
                        <div class="alert alert-danger">Error loading purchases data</div>
                    </div>
                </div>
            `;
        }
    }
};
export default Purchases;