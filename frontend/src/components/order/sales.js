import { deleteOrder, getOrders } from "../../connection/api";
import { hideLoading, showLoading, showMessage, vitalize } from "../../utils";
import DashboardMenu from "../dashboard/dashboardMenu";

const SalesList = {
  vignette: () => {
    const deleteButtons = document.getElementsByClassName('delete-button');
    Array.from(deleteButtons).forEach((deleteButton) => {
      deleteButton.addEventListener('click', async () => {
        if (confirm('Are you sure to delete this order?')) {
          showLoading();
          const data = await deleteOrder(deleteButton.id);
          if (data.error) {
            showMessage(data.error);
          }
          vitalize(OrderList);
          hideLoading();
        }
      });
    });
    const editButtons = document.getElementsByClassName('edit-button');
    Array.from(editButtons).forEach((editButton) => {
      editButton.addEventListener('click', async () => {
        document.location.hash = `/order/${editButton.id}`;
      });
    });
  },
  render: async () => {
    const ordersResult = await getOrders();
    const orders = Array.isArray(ordersResult) ? ordersResult : [];
    const ordersError = ordersResult.error;
    return `
    <div class="wrap">
    ${DashboardMenu.render({ selected: 'orderList' })}
    <div class="main">
      <section class="sales-reports-hero">
        <div class="sales-reports-hero-copy">
          <span class="sales-reports-chip">Sales operations</span>
          <h1>Sales overview</h1>
          <p>Track daily revenue, channel mix, and order performance across stores, mobile payments, and wholesale channels.</p>
          <div class="sales-reports-hero-actions">
            <a class="btn-primary text-white" href="#">Open POS</a>
            <a class="btn-outline-primary text-primary" href="sales-reports.html">View Reports</a>
          </div>
        </div>
        <div class="dashboard-hero-meta">
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Today revenue</span>
            <span class="dashboard-mini-stat-value">Ksh 84,500</span>
            <span class="dashboard-mini-stat-trend">▲ 18% vs yesterday</span>
          </div>
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Live orders</span>
            <span class="dashboard-mini-stat-value">56</span>
            <span class="dashboard-mini-stat-trend">● 12 pending pickup</span>
          </div>
        </div>
      </section>

      <section class="sales-report-grid">
        <article class="report-kpi-card">
          <div class="report-kpi-label">Today's revenue</div>
          <div class="report-kpi-value">Ksh 84,500</div>
          <div class="report-kpi-trend">▲ 18% vs yesterday</div>
          <div class="report-kpi-subtle">Across retail, POS, and wholesale</div>
        </article>
        <article class="report-kpi-card">
          <div class="report-kpi-label">Total orders</div>
          <div class="report-kpi-value">56</div>
          <div class="report-kpi-trend">▲ 9 new today</div>
          <div class="report-kpi-subtle">4 fulfillment batches</div>
        </article>
        <article class="report-kpi-card">
          <div class="report-kpi-label">Average ticket</div>
          <div class="report-kpi-value">Ksh 1,509</div>
          <div class="report-kpi-trend">▲ 12% conversion</div>
          <div class="report-kpi-subtle">Better basket size</div>
        </article>
        <article class="report-kpi-card">
          <div class="report-kpi-label">Repeat buyers</div>
          <div class="report-kpi-value">18</div>
          <div class="report-kpi-trend">● 3 referrals</div>
          <div class="report-kpi-subtle">Growing customer base</div>
        </article>
      </section>

      <section class="sales-report-layout">
        <article class="panel sales-report-chart-card sales-report-main-panel">
          <div class="card-title">Momentum by day</div>
          <div class="text-muted">Last 7 days of revenue movement</div>
          <div class="sales-report-bars">
            <div class="sales-report-bar"><div class="sales-report-bar-fill" style="height: 42%; background: linear-gradient(180deg, #7c85ff, #4f46e5);"></div><div class="sales-report-bar-label">Mon</div></div>
            <div class="sales-report-bar"><div class="sales-report-bar-fill" style="height: 56%; background: linear-gradient(180deg, #7c85ff, #4f46e5);"></div><div class="sales-report-bar-label">Tue</div></div>
            <div class="sales-report-bar"><div class="sales-report-bar-fill" style="height: 68%; background: linear-gradient(180deg, #7c85ff, #4f46e5);"></div><div class="sales-report-bar-label">Wed</div></div>
            <div class="sales-report-bar"><div class="sales-report-bar-fill" style="height: 74%; background: linear-gradient(180deg, #7c85ff, #4f46e5);"></div><div class="sales-report-bar-label">Thu</div></div>
            <div class="sales-report-bar"><div class="sales-report-bar-fill" style="height: 82%; background: linear-gradient(180deg, #7c85ff, #4f46e5);"></div><div class="sales-report-bar-label">Fri</div></div>
            <div class="sales-report-bar"><div class="sales-report-bar-fill" style="height: 88%; background: linear-gradient(180deg, #7c85ff, #4f46e5);"></div><div class="sales-report-bar-label">Sat</div></div>
            <div class="sales-report-bar"><div class="sales-report-bar-fill" style="height: 92%; background: linear-gradient(180deg, #7c85ff, #4f46e5);"></div><div class="sales-report-bar-label">Sun</div></div>
          </div>
        </article>

        <aside class="sales-report-side-stack">
          <div class="panel">
            <div class="card-title">Sales mix</div>
            <div class="sales-report-summary-list">
              <div class="sales-report-channel-row">
                <div class="sales-report-channel-meta">
                  <span class="sales-report-channel-dot" style="background:#22c55e;"></span>
                  <span>
                    <span class="sales-report-channel-name">POS</span>
                    <span class="sales-report-channel-value">In-store terminal</span>
                  </span>
                </div>
                <span class="sales-report-channel-percent">52%</span>
              </div>
              <div class="sales-report-channel-row">
                <div class="sales-report-channel-meta">
                  <span class="sales-report-channel-dot" style="background:#4f46e5;"></span>
                  <span>
                    <span class="sales-report-channel-name">Wholesale</span>
                    <span class="sales-report-channel-value">Bulk buyers</span>
                  </span>
                </div>
                <span class="sales-report-channel-percent">31%</span>
              </div>
              <div class="sales-report-channel-row">
                <div class="sales-report-channel-meta">
                  <span class="sales-report-channel-dot" style="background:#f59e0b;"></span>
                  <span>
                    <span class="sales-report-channel-name">Online</span>
                    <span class="sales-report-channel-value">Delivery orders</span>
                  </span>
                </div>
                <span class="sales-report-channel-percent">17%</span>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="card-title">Top highlights</div>
            <div class="sales-report-summary-list">
              <div class="sales-report-summary-item">
                <div class="text-muted">Best-selling item</div>
                <strong>Fresh Eggs</strong>
              </div>
              <div class="sales-report-summary-item">
                <div class="text-muted">Highest order</div>
                <strong>Ksh 4,200</strong>
              </div>
              <div class="sales-report-summary-item">
                <div class="text-muted">Payment split</div>
                <strong>Cash 48% · Mpesa 36%</strong>
              </div>
            </div>
          </div>
        </aside>
      </section>

       

      <section class="panel">
        <div class="card-title">Recent sales ledger</div>
        <div class="sales-report-table-wrap">
          <table class="table table-bordered table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Channel</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1001</td><td>Farm Gate</td><td>POS</td><td>Fresh Eggs</td><td>2 trays</td><td>Ksh 600</td><td><span class="badge-green text-white">Paid</span></td></tr>
              <tr><td>1002</td><td>Market Stall 3</td><td>Mpesa</td><td>Layer Mash</td><td>3 bags</td><td>Ksh 2,850</td><td><span class="badge-primary text-white">Paid</span></td></tr>
              <tr><td>1003</td><td>Doorstep Order</td><td>Bank</td><td>Vaccination Pack</td><td>1 kit</td><td>Ksh 1,200</td><td><span class="badge-orange text-white">Pending</span></td></tr>
              <tr><td>1004</td><td>Harvest Hub</td><td>POS</td><td>Broiler Feed</td><td>4 bags</td><td>Ksh 4,600</td><td><span class="badge-green text-white">Paid</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="order-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>USER</th>
              <th>PAID AT</th>
              <th>DELIVERED AT</th>
              <th class="tr-action">ACTION</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map(
                (order) => `
            <tr>
              <td>${order._id}</td>
              <td>${order.createdAt}</td>
              <td>${order.totalPrice}</td>
              <td>${order.user?.name || 'Unknown'}</td>
              <td>${order.paidAt || 'No'}</td>
              <td>${order.deliveredAt || 'No'}</td>
              <td>
              <button id="${order._id}" class="edit-button">Edit</button>
              <button id="${order._id}" class="delete-button">Delete</button>
              </td>
            </tr>
            `
              )
              .join('\n')}
          </tbody>
        </table>
      </div>
      ${ordersError ? `<div class="message-error">${ordersError}</div>` : ''}
    </div>
  </div>
    `;
  },
};
export default SalesList;
