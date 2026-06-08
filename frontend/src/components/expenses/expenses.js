import DashboardMenu from '../dashboard/dashboardMenu';
import { getExpenseStats, getExpenses } from '../../connection/api';

const Expenses = {
    vignette: ()=> {},
    render: async ()=>{
        try {
            const stats = await getExpenseStats();
            const expenses = await getExpenses();

            if (stats.error || expenses.error) {
                const errorMsg = stats.error || expenses.error;
                return `
                    <div class="wrap">
                        ${DashboardMenu.render({ selected: "expenses" })}
                        <div class="main">
                            <div class="alert alert-danger">Error loading expenses: ${errorMsg}</div>
                        </div>
                    </div>
                `;
            }

            // Build expense table rows
            const expenseRows = expenses.slice(0, 10).map((expense) => {
                const statusBadge = expense.status === 'paid' ? 'badge-green' : 
                                   expense.status === 'approved' ? 'badge-primary' :
                                   expense.status === 'pending' ? 'badge-orange' :
                                   'badge-gray';
                const vendorName = expense.vendorName || expense.vendor?.name || 'Direct Expense';
                
                return `
                    <tr>
                        <td>${vendorName}</td>
                        <td>${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</td>
                        <td>Ksh ${(expense.amount || 0).toLocaleString()}</td>
                        <td>${expense.invoiceDate ? new Date(expense.invoiceDate).toLocaleDateString() : 'N/A'}</td>
                        <td><span class="${statusBadge} text-white">${expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}</span></td>
                    </tr>
                `;
            }).join('');

            const trendValue = stats.trend || 0;
            const trendClass = trendValue < 0 ? 'metric-desc--success' : trendValue > 0 ? 'metric-desc--danger' : 'metric-desc--info';

            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "expenses" })}
                    <div class="main">
                        <section class="dashboard-hero">
                          <div class="dashboard-hero-copy">
                            <span class="dashboard-pill">Expense management</span>
                            <h1>Expense control center</h1>
                            <p>Track vendor spend, reconcile payments, and spot budget pressure across operations and procurement.</p>
                            <div class="dashboard-hero-actions">
                              <a class="btn-primary text-white" href="/#/record-expense">Record Expense</a>
                              <a class="btn-outline-primary text-primary" href="/#/expenses/export">Export ledger</a>
                            </div>
                          </div>
                          <div class="dashboard-hero-meta">
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">Monthly spend</span>
                              <span class="dashboard-mini-stat-value">Ksh ${(stats.monthlySpend || 0).toLocaleString()}</span>
                              <span class="dashboard-mini-stat-trend">${trendValue >= 0 ? '▲' : '▼'} ${Math.abs(trendValue)}% vs last month</span>
                            </div>
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">Pending approvals</span>
                              <span class="dashboard-mini-stat-value">${stats.pendingApprovals || 0}</span>
                              <span class="dashboard-mini-stat-trend">Awaiting sign-off</span>
                            </div>
                          </div>
                        </section>

                        <section class="dashboard-kpi-grid">
                          <article class="card-metric">
                            <div class="icon">📦</div>
                            <div>
                              <div class="metric-title">Vendor invoices</div>
                              <div class="metric-value">${stats.vendorInvoices || 0}</div>
                              <div class="metric-desc metric-desc--info">Recent submissions</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">💳</div>
                            <div>
                              <div class="metric-title">Pending bills</div>
                              <div class="metric-value">${stats.pendingBills || 0}</div>
                              <div class="metric-desc metric-desc--danger">Awaiting payment</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">🧾</div>
                            <div>
                              <div class="metric-title">Approvals pending</div>
                              <div class="metric-value">${stats.pendingApprovals || 0}</div>
                              <div class="metric-desc metric-desc--info">Awaiting review</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">💰</div>
                            <div>
                              <div class="metric-title">Recent spend</div>
                              <div class="metric-value">${stats.recentSpend && stats.recentSpend.length > 0 ? 'Ksh ' + stats.recentSpend.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString() : 'Ksh 0'}</div>
                              <div class="metric-desc metric-desc--info">Last 5 paid expenses</div>
                            </div>
                          </article>
                        </section>

                        <section class="dashboard-enterprise-section">
                          <article class="panel">
                            <div class="card-title">Expense ledger</div>
                            <div class="table-wrap">
                              <table class="table table-bordered table-hover">
                                <thead>
                                  <tr>
                                    <th>Vendor</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${expenseRows || '<tr><td colspan="5">No expenses recorded</td></tr>'}
                                </tbody>
                              </table>
                            </div>
                          </article>
                        </section>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering expenses:', error);
            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "expenses" })}
                    <div class="main">
                        <div class="alert alert-danger">Error loading expenses data</div>
                    </div>
                </div>
            `;
        }
    }
};
export default Expenses;