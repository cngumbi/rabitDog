import DashboardMenu from '../dashboard/dashboardMenu';
import { getPartyStats, getParties } from '../../connection/api';

const Parties = {
    vignette: ()=> {},
    render: async ()=>{
        try {
            const stats = await getPartyStats();
            const parties = await getParties();
            
            // Handle errors from API calls
            if (stats.error || parties.error) {
                const errorMsg = stats.error || parties.error;
                return `
                    <div class="wrap">
                        ${DashboardMenu.render({ selected: "parties" })}
                        <div class="main">
                            <div class="alert alert-danger">Error loading parties: ${errorMsg}</div>
                        </div>
                    </div>
                `;
            }

            // Build party cards HTML
            const partyCards = parties.map((party, index) => {
                const initials = party.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const roleLabel = party.type === 'buyer' ? 'Buyer' : party.type === 'supplier' ? 'Supplier' : 'Buyer & Supplier';
                const statusClass = party.status === 'active' ? 'badge-green' : party.status === 'inactive' ? 'badge-yellow' : 'badge-red';
                const cardClass = index === 0 ? 'party-card party-card-primary' : 'party-card';
                
                return `
                    <div class="${cardClass}">
                        <div class="party-card-header">
                            <div class="party-avatar">${initials}</div>
                            <div>
                                <div class="party-card-name">${party.name}</div>
                                <div class="party-card-role">${roleLabel}${party.businessName ? ' · ' + party.businessName : ''}</div>
                            </div>
                        </div>
                        <div class="party-card-meta">
                            <span>${party.phone || 'No phone'}</span>
                            <span>Ksh ${party.currentBalance.toLocaleString()}</span>
                        </div>
                        <div class="party-card-footer">
                            <span class="${statusClass} text-white">${party.status.charAt(0).toUpperCase() + party.status.slice(1)}</span>
                            <a class="text-primary" href="#/party/${party._id}">View</a>
                        </div>
                    </div>
                `;
            }).join('');

            const buyersCount = parties.filter(p => p.type === 'buyer' || p.type === 'both').length;
            const suppliersCount = parties.filter(p => p.type === 'supplier' || p.type === 'both').length;

            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "parties" })}
                    <div class="main">
                        <section class="dashboard-hero">
                          <div class="dashboard-hero-copy">
                            <span class="dashboard-pill">Parties</span>
                            <h1>Partner directory</h1>
                            <p>Track buyers, suppliers, and recurring farm partners with contact details, balance health, and active relationships.</p>
                            <div class="dashboard-hero-actions">
                              <a class="btn-primary text-white" href="/#/add-party">Add Party</a>
                            </div>
                          </div>
                          <div class="dashboard-hero-meta">
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">Buyers</span>
                              <span class="dashboard-mini-stat-value">${stats.buyers || 0}</span>
                              <span class="dashboard-mini-stat-trend">▲ ${stats.newThisMonth || 0} new this month</span>
                            </div>
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">Suppliers</span>
                              <span class="dashboard-mini-stat-value">${stats.suppliers || 0}</span>
                              <span class="dashboard-mini-stat-trend">● ${stats.pendingReviews || 0} pending reviews</span>
                            </div>
                          </div>
                        </section>

                        <section class="dashboard-kpi-grid">
                          <article class="card-metric">
                            <div class="icon">👥</div>
                            <div>
                              <div class="metric-title">Total parties</div>
                              <div class="metric-value">${parties.length}</div>
                              <div class="metric-desc metric-desc--info">Across buyers and suppliers</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">⚡</div>
                            <div>
                              <div class="metric-title">Active parties</div>
                              <div class="metric-value">${parties.filter(p => p.status === 'active').length}</div>
                              <div class="metric-desc metric-desc--success">High-priority relationships</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">💳</div>
                            <div>
                              <div class="metric-title">Total balance</div>
                              <div class="metric-value">Ksh ${(stats.totalBalance || 0).toLocaleString()}</div>
                              <div class="metric-desc ${(stats.totalBalance || 0) > 50000 ? 'metric-desc--danger' : 'metric-desc--success'}">Outstanding balance</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">📊</div>
                            <div>
                              <div class="metric-title">Profile Readiness</div>
                              <div class="metric-value">${Math.round((parties.reduce((sum, p) => sum + (p.profileReadiness || 0), 0) / (parties.length || 1)) * 10) / 10}%</div>
                              <div class="metric-desc metric-desc--info">Average completion</div>
                            </div>
                          </article>
                        </section>

                        <section class="parties-layout">
                          <article class="panel parties-main-panel">
                            <div class="card-title">Directory cards</div>
                            <div class="parties-directory-grid">
                              ${partyCards}
                            </div>
                          </article>
                        </section>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering parties:', error);
            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "parties" })}
                    <div class="main">
                        <div class="alert alert-danger">Error loading parties data</div>
                    </div>
                </div>
            `;
        }
    }
};
export default Parties;