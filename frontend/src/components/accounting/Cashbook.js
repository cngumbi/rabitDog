import DashboardMenu from '../dashboard/dashboardMenu';

const CashBook = {
    vignette: () => {},
  render: () => {
    return `
    <div id="sidebarOverlay" class="sidebar-overlay"></div>
    <div class="wrap">
    ${DashboardMenu.render({selected: 'cashbank'})}
    <div class="main" id="dashboard">
      <section class="dashboard-hero">
        <div class="dashboard-hero-copy">
          <span class="dashboard-pill">Cash & Bank</span>
          <h1>Cashbook overview</h1>
          <p>Track liquidity, deposit health, and cash movement across tills and bank accounts in one executive view.</p>
          <div class="dashboard-hero-actions">
            <a class="btn-primary text-white" href="entry.html">Add Entry</a>
            <a class="btn-secondary text-white" href="/#/account/add">Add Account</a>
            <a class="btn-outline-primary text-primary" href="#">Export Report</a>
          </div>
        </div>
        <div class="dashboard-hero-meta">
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Available cash</span>
            <span class="dashboard-mini-stat-value">Ksh 68,400</span>
            <span class="dashboard-mini-stat-trend">▲ 12% vs last week</span>
          </div>
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Bank balance</span>
            <span class="dashboard-mini-stat-value">Ksh 220,000</span>
            <span class="dashboard-mini-stat-trend">▲ 8% vs last week</span>
          </div>
        </div>
      </section>

      <section class="dashboard-kpi-grid">
        <article class="card-metric">
          <div class="icon">💵</div>
          <div>
            <div class="metric-title">Cash on hand</div>
            <div class="metric-value">Ksh 68,400</div>
            <div class="metric-desc metric-desc--success">+Ksh 8,400 from sales</div>
          </div>
        </article>
        <article class="card-metric">
          <div class="icon">🏦</div>
          <div>
            <div class="metric-title">Bank balance</div>
            <div class="metric-value">Ksh 220,000</div>
            <div class="metric-desc metric-desc--info">2 active accounts</div>
          </div>
        </article>
        <article class="card-metric">
          <div class="icon">↗️</div>
          <div>
            <div class="metric-title">Incoming deposits</div>
            <div class="metric-value">Ksh 84,500</div>
            <div class="metric-desc metric-desc--success">This week</div>
          </div>
        </article>
        <article class="card-metric">
          <div class="icon">↘️</div>
          <div>
            <div class="metric-title">Pending payments</div>
            <div class="metric-value">Ksh 14,200</div>
            <div class="metric-desc metric-desc--danger">Needs review</div>
          </div>
        </article>
      </section>

      <section class="panel">
        <div class="card-title">Financial system modules</div>
        <div class="cashbook-module-grid">
          <a class="cashbook-module-card" href="/#/cashbank">
            <div class="cashbook-module-title">Cashbook</div>
            <div class="cashbook-module-copy">Monitor liquidity and recent account activity.</div>
          </a>
          <a class="cashbook-module-card" href="/#/budget">
            <div class="cashbook-module-title">Budgets</div>
            <div class="cashbook-module-copy">Track budget plans, variances, and spend control.</div>
          </a>
          <a class="cashbook-module-card" href="/#/financial-reports">
            <div class="cashbook-module-title">Financial reports</div>
            <div class="cashbook-module-copy">Generate trial balances, statements, and ratios.</div>
          </a>
          <a class="cashbook-module-card" href="/#/invoices">
            <div class="cashbook-module-title">Invoices</div>
            <div class="cashbook-module-copy">Create, send, and record customer payments.</div>
          </a>
          <a class="cashbook-module-card" href="/#/journal-entries">
            <div class="cashbook-module-title">Journal entries</div>
            <div class="cashbook-module-copy">Post manual accounting entries and review balances.</div>
          </a>
          <a class="cashbook-module-card" href="/#/account/add">
            <div class="cashbook-module-title">Add account</div>
            <div class="cashbook-module-copy">Create a new chart of accounts ledger entry.</div>
          </a>
        </div>
      </section>

      <section class="cash-bank-layout">
        <article class="panel cash-bank-main-panel">
          <div class="card-title">Account balances</div>
          <div class="cash-bank-account-list">
            <div class="cash-bank-account-row">
              <div class="cash-bank-account-icon">💰</div>
              <div class="cash-bank-account-copy">
                <div class="cash-bank-account-name">Main Cash</div>
                <div class="cash-bank-account-subtitle">Till / retail drawer</div>
              </div>
              <div class="cash-bank-account-balance">Ksh 68,400</div>
              <span class="badge-green text-white">Available</span>
            </div>

            <div class="cash-bank-account-row">
              <div class="cash-bank-account-icon">🏦</div>
              <div class="cash-bank-account-copy">
                <div class="cash-bank-account-name">Business Bank</div>
                <div class="cash-bank-account-subtitle">Operating account</div>
              </div>
              <div class="cash-bank-account-balance">Ksh 120,000</div>
              <span class="badge-primary text-white">Healthy</span>
            </div>

            <div class="cash-bank-account-row">
              <div class="cash-bank-account-icon">📈</div>
              <div class="cash-bank-account-copy">
                <div class="cash-bank-account-name">Savings Reserve</div>
                <div class="cash-bank-account-subtitle">Long-term reserve</div>
              </div>
              <div class="cash-bank-account-balance">Ksh 100,000</div>
              <span class="badge-primary text-white">Stable</span>
            </div>
          </div>
        </article>

        <article class="panel cash-bank-side-panel">
          <div class="card-title">Movement snapshot</div>
          <div class="cash-bank-movement-list">
            <div class="cash-bank-movement-item">
              <div class="cash-bank-movement-label">Retail receipts</div>
              <div class="cash-bank-movement-value">Ksh 18,600</div>
              <div class="cash-bank-movement-trend positive">↑ 22% this week</div>
            </div>
            <div class="cash-bank-movement-item">
              <div class="cash-bank-movement-label">Supplier payouts</div>
              <div class="cash-bank-movement-value">Ksh 9,200</div>
              <div class="cash-bank-movement-trend">↘ 6% trend</div>
            </div>
            <div class="cash-bank-movement-item">
              <div class="cash-bank-movement-label">Bank deposits</div>
              <div class="cash-bank-movement-value">Ksh 40,000</div>
              <div class="cash-bank-movement-trend positive">↑ 15% this week</div>
            </div>
          </div>
        </article>
      </section>

      <section class="panel">
        <div class="card-title">Recent bank activity</div>
        <div class="cash-bank-table-wrap">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>May 28</td>
                <td>Main Cash</td>
                <td>Sale receipt</td>
                <td>POS-1048</td>
                <td>Ksh 8,400</td>
                <td><span class="badge-green text-white">Cleared</span></td>
              </tr>
              <tr>
                <td>May 27</td>
                <td>Business Bank</td>
                <td>Bank transfer</td>
                <td>DEP-4421</td>
                <td>Ksh 40,000</td>
                <td><span class="badge-primary text-white">Posted</span></td>
              </tr>
              <tr>
                <td>May 26</td>
                <td>Savings Reserve</td>
                <td>Fund allocation</td>
                <td>RES-006</td>
                <td>Ksh 15,000</td>
                <td><span class="badge-primary text-white">Posted</span></td>
              </tr>
              <tr>
                <td>May 25</td>
                <td>Main Cash</td>
                <td>Supplier payout</td>
                <td>EXP-221</td>
                <td>-Ksh 3,200</td>
                <td><span class="badge-primary text-white">Pending</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
    <style>
      .cashbook-module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 12px; }
      .cashbook-module-card { display: block; padding: 16px; border: 1px solid #e5e7eb; border-radius: 10px; background: #f8fafc; color: #0f172a; text-decoration: none; transition: transform 0.2s ease, box-shadow 0.2s ease; }
      .cashbook-module-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08); }
      .cashbook-module-title { font-weight: 700; margin-bottom: 6px; }
      .cashbook-module-copy { font-size: 0.9rem; color: #475569; }
    </style>
    `;
  },
};
export default CashBook;
