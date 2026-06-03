import DashboardMenu from "./dashboardMenu";

const Dashboard = {
    vignette: ()=>{},
    render: ()=>{
        return `
        <div id="sidebarOverlay" class="sidebar-overlay"></div>
        <div class="wrap">
            ${DashboardMenu.render({selected: 'dashboard'})}
            <div class="main" id="dashboard">
                <!--the hero section-->
                <section class="dashboard-hero">
                    <div class="dashboard-hero-copy">
                      <span class="dashboard-pill">Executive command center</span>
                      <h1>PoultryHub enterprise dashboard</h1>
                      <p>Track revenue momentum, production health, staffing coverage, and operational risk across the farm in a single executive view.</p>
                      <div class="dashboard-hero-actions">
                        <span class="dashboard-pill dashboard-pill-accent">Live sync • 2m ago</span>
                        <span class="dashboard-pill">Setpoint: 96.4% compliance</span>
                        <span class="dashboard-pill">Quarter to date</span>
                      </div>
                    </div>
                    <div class="dashboard-hero-meta" aria-label="Snapshot summary">
                      <div class="dashboard-mini-stat">
                        <span class="dashboard-mini-stat-label">Run rate</span>
                        <span class="dashboard-mini-stat-value">Ksh 2.3M</span>
                        <span class="dashboard-mini-stat-trend">▲ 12.8% this week</span>
                      </div>
                      <div class="dashboard-mini-stat">
                        <span class="dashboard-mini-stat-label">Coverage</span>
                        <span class="dashboard-mini-stat-value">98.2%</span>
                        <span class="dashboard-mini-stat-trend">▲ 3 shifts optimized</span>
                      </div>
                      <div class="dashboard-mini-stat">
                        <span class="dashboard-mini-stat-label">Active alerts</span>
                        <span class="dashboard-mini-stat-value">4</span>
                        <span class="dashboard-mini-stat-trend">2 critical, 2 watch</span>
                      </div>
                      <div class="dashboard-mini-stat">
                        <span class="dashboard-mini-stat-label">Staff readiness</span>
                        <span class="dashboard-mini-stat-value">21/24</span>
                        <span class="dashboard-mini-stat-trend">87.5% on route</span>
                      </div>
                    </div>
                </section>
                <!--end of te hero section--> 
            </div>
        </div>
        `;
    }
};
export default Dashboard;