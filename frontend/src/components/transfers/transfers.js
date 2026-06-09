import DashboardMenu from '../dashboard/dashboardMenu';
import { getTransferStats, getTransfers } from '../../connection/api';

const StackTransfers = {
    vignette: ()=> {},
    render: async ()=>{
        try {
            const stats = await getTransferStats();
            const transfers = await getTransfers();

            if (stats.error || transfers.error) {
                const errorMsg = stats.error || transfers.error;
                return `
                    <div class="wrap">
                        ${DashboardMenu.render({ selected: "transfers" })}
                        <div class="main">
                            <div class="alert alert-danger">Error loading transfers: ${errorMsg}</div>
                        </div>
                    </div>
                `;
            }

            // Build transfer rows
            const transferRows = transfers.slice(0, 10).map((transfer) => {
                const statusBadge = transfer.status === 'completed' ? 'badge-green' : 
                                   transfer.status === 'in-transit' ? 'badge-primary' :
                                   transfer.status === 'pending' ? 'badge-orange' :
                                   transfer.status === 'draft' ? 'badge-secondary' :
                                   'badge-gray';
                const icon = transfer.status === 'received' ? '📦' : 
                            transfer.status === 'in-transit' ? '🚚' :
                            transfer.status === 'draft' ? '📝' :
                            '📍';
                
                return `
                    <div class="stock-transfer-row">
                        <div class="stock-transfer-icon">${icon}</div>
                        <div class="stock-transfer-copy">
                            <div class="stock-transfer-name">${transfer.transferNumber}</div>
                            <div class="stock-transfer-subtitle">${transfer.fromLocation} → ${transfer.toLocation} • ${transfer.unitsMoved || 0} units</div>
                        </div>
                        <div class="stock-transfer-meta">
                            <div class="stock-transfer-status ${statusBadge} text-white">${transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}</div>
                            <div class="stock-transfer-time">${transfer.createdAt ? new Date(transfer.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "transfers" })}
                    <div class="main">
                        <section class="dashboard-hero">
                          <div class="dashboard-hero-copy">
                            <span class="dashboard-pill">Inventory movement</span>
                            <h1>Stock transfer center</h1>
                            <p>Review internal movement, monitor fulfillment, and keep feed, chicks, and supplies aligned across every farm location.</p>
                            <div class="dashboard-hero-actions">
                              <a class="btn-primary text-white" href="/#/new-transfer">Create transfer</a>
                              <a class="btn-outline-primary text-black" href="/#/transfers/export">Export log</a>
                            </div>
                          </div>
                          <div class="dashboard-hero-meta">
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">Active moves</span>
                              <span class="dashboard-mini-stat-value">${stats.activeMoves || 0}</span>
                              <span class="dashboard-mini-stat-trend">${stats.awaitingPickup || 0} awaiting pickup</span>
                            </div>
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">Units moved</span>
                              <span class="dashboard-mini-stat-value">${stats.unitsMoved || 0}</span>
                              <span class="dashboard-mini-stat-trend">This month</span>
                            </div>
                          </div>
                        </section>

                        <section class="dashboard-kpi-grid">
                          <article class="card-metric">
                            <div class="icon">↗️</div>
                            <div>
                              <div class="metric-title">Transfers completed</div>
                              <div class="metric-value">${stats.completed || 0}</div>
                              <div class="metric-desc metric-desc--success">This month: ${stats.completedThisMonth || 0}</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">📦</div>
                            <div>
                              <div class="metric-title">Total units moved</div>
                              <div class="metric-value">${stats.unitsMoved || 0}</div>
                              <div class="metric-desc metric-desc--info">Across all transfers</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">⚠️</div>
                            <div>
                              <div class="metric-title">Average lead time</div>
                              <div class="metric-value">${stats.averageLeadTime || 0} days</div>
                              <div class="metric-desc metric-desc--info">Delivery speed</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">✅</div>
                            <div>
                              <div class="metric-title">Ready to dispatch</div>
                              <div class="metric-value">${stats.readyToDispatch || 0}</div>
                              <div class="metric-desc metric-desc--success">Pending pickup</div>
                            </div>
                          </article>
                        </section>

                        <section class="stock-transfer-layout">
                          <article class="panel stock-transfer-main-panel">
                            <div class="card-title">Transfer activity</div>
                            <div class="stock-transfer-list">
                              ${transferRows || '<div class="alert alert-info">No transfers yet</div>'}
                            </div>
                          </article>
                        </section>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering transfers:', error);
            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "transfers" })}
                    <div class="main">
                        <div class="alert alert-danger">Error loading transfers data</div>
                    </div>
                </div>
            `;
        }
    }
};
export default StackTransfers;