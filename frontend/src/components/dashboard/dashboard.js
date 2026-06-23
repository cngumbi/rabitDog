import DashboardMenu from "./dashboardMenu";
import { getHealthRecords, getHealthSummary } from "../../connection/api";
import { livestockAPI } from "../../connection/livestockAPI";
import { getUserInfo } from "../../localStorage";

const formatNumber = (value) => new Intl.NumberFormat('en-KE').format(Number(value || 0));
const formatCurrency = (value) => new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
}).format(Number(value || 0));

const Dashboard = {
    render: () => {
        return `
        <div id="sidebarOverlay" class="sidebar-overlay"></div>
        <div class="wrap">
            ${DashboardMenu.render({selected: 'dashboard'})}
            <div class="main" id="dashboard">
                <section class="dashboard-hero">
                    <div class="dashboard-hero-copy">
                      <div class="dashboard-hero-badge-row">
                        <span class="dashboard-pill">Executive command center</span>
                        <span class="dashboard-pill dashboard-pill-accent">Live operations</span>
                      </div>
                      <h1>Operations overview</h1>
                      <p>Monitor herd performance, wellness actions, and production momentum through a single executive view.</p>
                      <div class="dashboard-hero-actions">
                        <span class="dashboard-pill">Updated from your latest entries</span>
                        <span class="dashboard-pill">Enterprise-ready visibility</span>
                      </div>
                    </div>
                    <div class="dashboard-hero-meta" aria-label="Snapshot summary">
                      <div class="dashboard-mini-stat">
                        <span class="dashboard-mini-stat-label">Active batches</span>
                        <span id="hero-batches" class="dashboard-mini-stat-value">--</span>
                        <span class="dashboard-mini-stat-trend">Operationally live</span>
                      </div>
                      <div class="dashboard-mini-stat">
                        <span class="dashboard-mini-stat-label">Animals tracked</span>
                        <span id="hero-animals" class="dashboard-mini-stat-value">--</span>
                        <span class="dashboard-mini-stat-trend">Current inventory</span>
                      </div>
                      <div class="dashboard-mini-stat">
                        <span class="dashboard-mini-stat-label">Health alerts</span>
                        <span id="hero-alerts" class="dashboard-mini-stat-value">--</span>
                        <span class="dashboard-mini-stat-trend">Watchlist items</span>
                      </div>
                      <div class="dashboard-mini-stat">
                        <span class="dashboard-mini-stat-label">Production value</span>
                        <span id="hero-production" class="dashboard-mini-stat-value">--</span>
                        <span class="dashboard-mini-stat-trend">Current cycle value</span>
                      </div>
                    </div>
                </section>

                <div id="dashboard-kpi-grid" class="dashboard-kpi-grid">
                  <div class="card card-metric">
                    <div class="metric-label">Loading summary…</div>
                    <div class="metric-value">--</div>
                    <div class="metric-meta">Please wait</div>
                  </div>
                </div>

                <div class="card dashboard-progress-card">
                  <div class="dashboard-card-title-padded">
                    <div class="dashboard-card-heading">
                      <div>
                        <h3>Performance pulse</h3>
                        <p>Live progress indicators across critical operations.</p>
                      </div>
                      <span class="dashboard-status-chip">Real-time</span>
                    </div>
                  </div>
                  <div class="dashboard-card-body-padded">
                    <div id="dashboard-progress-graph" class="dashboard-progress-graph"></div>
                  </div>
                </div>

                <div class="dashboard-enterprise-section">
                  <section class="dashboard-chart--wide card dashboard-panel-card">
                    <div class="dashboard-card-title-padded">
                      <div class="dashboard-card-heading">
                        <div>
                          <h3>Operational snapshot</h3>
                          <p>Highlights from recent livestock, health, and production activity.</p>
                        </div>
                        <span class="dashboard-status-chip">Updated</span>
                      </div>
                    </div>
                    <div class="dashboard-card-body-padded">
                      <div id="dashboard-status-list" class="dashboard-status-list"></div>
                    </div>
                  </section>

                  <aside class="dashboard-side-stack">
                    <div class="card dashboard-home-card dashboard-focus-card">
                      <div class="dashboard-card-title-padded">
                        <h3>Today’s focus</h3>
                      </div>
                      <div class="dashboard-card-body-padded">
                        <ul id="dashboard-focus-list" class="dashboard-list"></ul>
                      </div>
                    </div>
                    <div class="card dashboard-home-card dashboard-health-card">
                      <div class="dashboard-card-title-padded">
                        <h3>Health follow-up</h3>
                      </div>
                      <div class="dashboard-card-body-padded">
                        <div id="dashboard-health-summary" class="dashboard-status-list"></div>
                      </div>
                    </div>
                  </aside>
                </div>
            </div>
        </div>
        `;
    },
    vignette: async () => {
        const userInfo = getUserInfo() || {};
        const heroBatches = document.getElementById('hero-batches');
        const heroAnimals = document.getElementById('hero-animals');
        const heroAlerts = document.getElementById('hero-alerts');
        const heroProduction = document.getElementById('hero-production');
        const kpiGrid = document.getElementById('dashboard-kpi-grid');
        const statusList = document.getElementById('dashboard-status-list');
        const focusList = document.getElementById('dashboard-focus-list');
        const healthSummary = document.getElementById('dashboard-health-summary');
        const progressGraph = document.getElementById('dashboard-progress-graph');

        if (!kpiGrid || !statusList || !focusList || !healthSummary || !progressGraph) return;

        const renderLoading = () => {
            kpiGrid.innerHTML = [
                { label: 'Active batches', value: '--', meta: 'Loading' },
                { label: 'Animals tracked', value: '--', meta: 'Loading' },
                { label: 'Health alerts', value: '--', meta: 'Loading' },
                { label: 'Production value', value: '--', meta: 'Loading' },
            ].map((item) => `
                <div class="card card-metric">
                    <div class="metric-label">${item.label}</div>
                    <div class="metric-value">${item.value}</div>
                    <div class="metric-meta">${item.meta}</div>
                </div>
            `).join('');
            statusList.innerHTML = '<div class="dashboard-status-item"><span class="dashboard-status-label">Loading dashboard…</span><span class="dashboard-status-value">Please wait</span></div>';
            focusList.innerHTML = '<li class="dashboard-status-item">Loading dashboard…</li>';
            healthSummary.innerHTML = '<div class="dashboard-status-item"><span class="dashboard-status-label">Loading health summary…</span></div>';
            progressGraph.innerHTML = '<div class="dashboard-progress-placeholder">Loading progress graph…</div>';
        };

        renderLoading();

        try {
            const [batchesResponse, recordsResponse, feedingResponse, productionResponse, healthSummaryResponse, healthRecordsResponse, typesResponse] = await Promise.allSettled([
                livestockAPI.getAllBatches(),
                livestockAPI.getAllRecords(),
                livestockAPI.getAllFeedingRecords(),
                livestockAPI.getAllProductionRecords(),
                getHealthSummary(),
                getHealthRecords(),
                livestockAPI.getAllTypes(),
            ]);

            const batches = batchesResponse.status === 'fulfilled' ? (batchesResponse.value?.data || []) : [];
            const records = recordsResponse.status === 'fulfilled' ? (recordsResponse.value?.data || []) : [];
            const feedingRecords = feedingResponse.status === 'fulfilled' ? (feedingResponse.value?.data || []) : [];
            const productionRecords = productionResponse.status === 'fulfilled' ? (productionResponse.value?.data || []) : [];
            const healthSummaryData = healthSummaryResponse.status === 'fulfilled' ? (healthSummaryResponse.value || {}) : {};
            const healthRecords = healthRecordsResponse.status === 'fulfilled' ? (healthRecordsResponse.value || []) : [];
            const types = typesResponse.status === 'fulfilled' ? (typesResponse.value?.data || []) : [];

            const activeBatches = batches.filter((batch) => String(batch.status || '').toLowerCase() !== 'completed').length;
            const activeAnimals = records.filter((record) => String(record.status || '').toLowerCase() === 'active').length;
            const totalAnimals = records.length;
            const totalFeedQuantity = feedingRecords.reduce((sum, record) => sum + Number(record.quantityFed || record.quantityAllocated || 0), 0);
            const totalProductionValue = productionRecords.reduce((sum, record) => sum + Number(record.totalValue || record.value || record.saleValue || 0), 0);
            const totalProductionUnits = productionRecords.reduce((sum, record) => sum + Number(record.quantity || 0), 0);
            const criticalAlerts = healthRecords.filter((record) => ['Critical', 'Watch'].includes(record.severity)).length;
            const healthAlerts = Number(healthSummaryData.healthAlerts || criticalAlerts || 0);
            const vaccinationDue = Number(healthSummaryData.vaccinationDue || 0);
            const recentHealthIssue = healthRecords[0]?.issue || 'No recent issues';
            const latestBatch = batches[0]?.batchName || 'No batch created yet';
            const batchProgress = batches.length ? Math.min(100, Math.round((activeBatches / batches.length) * 100)) : 0;
            const animalProgress = totalAnimals ? Math.min(100, Math.round((activeAnimals / totalAnimals) * 100)) : 0;
            const healthProgress = Math.max(0, Math.min(100, 100 - healthAlerts * 15));
            const productionProgress = totalAnimals ? Math.min(100, Math.round((productionRecords.length / Math.max(totalAnimals, 1)) * 100)) : 0;

            if (heroBatches) heroBatches.textContent = `${activeBatches}/${batches.length}`;
            if (heroAnimals) heroAnimals.textContent = formatNumber(totalAnimals);
            if (heroAlerts) heroAlerts.textContent = formatNumber(healthAlerts);
            if (heroProduction) heroProduction.textContent = formatCurrency(totalProductionValue);

            kpiGrid.innerHTML = [
                {
                    label: 'Active batches',
                    value: `${activeBatches}/${batches.length}`,
                    meta: `${types.length} livestock types configured`,
                },
                {
                    label: 'Animals tracked',
                    value: formatNumber(totalAnimals),
                    meta: `${activeAnimals} active animals`,
                },
                {
                    label: 'Health follow-up',
                    value: formatNumber(vaccinationDue),
                    meta: `${healthAlerts} alerts needing attention`,
                },
                {
                    label: 'Production value',
                    value: formatCurrency(totalProductionValue),
                    meta: `${formatNumber(totalProductionUnits)} units logged`,
                },
            ].map((item) => `
                <div class="card card-metric">
                    <div class="metric-label">${item.label}</div>
                    <div class="metric-value">${item.value}</div>
                    <div class="metric-meta">${item.meta}</div>
                </div>
            `).join('');

            statusList.innerHTML = [
                {
                    label: 'Current focus',
                    value: `${formatNumber(totalFeedQuantity)} feed units logged`,
                },
                {
                    label: 'Latest batch',
                    value: latestBatch,
                },
                {
                    label: 'Production momentum',
                    value: `${formatNumber(productionRecords.length)} production entries`,
                },
            ].map((item) => `
                <div class="dashboard-status-item">
                    <span class="dashboard-status-label">${item.label}</span>
                    <span class="dashboard-status-value">${item.value}</span>
                </div>
            `).join('');

            focusList.innerHTML = [
                `Latest health note: ${recentHealthIssue}`,
                `User view: ${userInfo.email ? userInfo.email : 'Signed in user'}`,
                `Livestock types available: ${types.length}`,
            ].map((item) => `<li class="dashboard-status-item">${item}</li>`).join('');

            healthSummary.innerHTML = [
                {
                    label: 'Open health records',
                    value: `${healthSummaryData.totalRecords || healthRecords.length} total`,
                },
                {
                    label: 'Vaccination follow-up',
                    value: `${vaccinationDue} due`,
                },
                {
                    label: 'Critical watch items',
                    value: `${healthAlerts} flagged`,
                },
            ].map((item) => `
                <div class="dashboard-status-item">
                    <span class="dashboard-status-label">${item.label}</span>
                    <span class="dashboard-status-value">${item.value}</span>
                </div>
            `).join('');

            progressGraph.innerHTML = [
                { label: 'Batch activity', value: `${batchProgress}%`, progress: batchProgress, tone: 'batch' },
                { label: 'Animal coverage', value: `${animalProgress}%`, progress: animalProgress, tone: 'animal' },
                { label: 'Health readiness', value: `${healthProgress}%`, progress: healthProgress, tone: 'health' },
                { label: 'Production momentum', value: `${productionProgress}%`, progress: productionProgress, tone: 'production' },
            ].map((item) => `
                <div class="dashboard-progress-row">
                    <div class="dashboard-progress-meta">
                        <span class="dashboard-progress-label">${item.label}</span>
                        <span class="dashboard-progress-value">${item.value}</span>
                    </div>
                    <div class="dashboard-progress-track">
                        <div class="dashboard-progress-fill dashboard-progress-fill--${item.tone}" style="width:${item.progress}%;"></div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            if (heroBatches) heroBatches.textContent = '0/0';
            if (heroAnimals) heroAnimals.textContent = '0';
            if (heroAlerts) heroAlerts.textContent = '0';
            if (heroProduction) heroProduction.textContent = formatCurrency(0);

            kpiGrid.innerHTML = `
                <div class="card card-metric">
                    <div class="metric-label">Dashboard unavailable</div>
                    <div class="metric-value">0</div>
                    <div class="metric-meta">Unable to load live data</div>
                </div>
            `;
            statusList.innerHTML = '<div class="dashboard-status-item"><span class="dashboard-status-label">Unable to load metrics</span><span class="dashboard-status-value">Please refresh</span></div>';
            focusList.innerHTML = '<li class="dashboard-status-item">Live dashboard data could not be loaded.</li>';
            healthSummary.innerHTML = '<div class="dashboard-status-item"><span class="dashboard-status-label">No health data available</span></div>';
            progressGraph.innerHTML = '<div class="dashboard-progress-placeholder">Progress graph unavailable</div>';
        }
    },
};

export default Dashboard;