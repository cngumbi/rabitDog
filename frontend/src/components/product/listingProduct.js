import { deleteProduct, getProducts } from "../../connection/api";
import { hideLoading, showLoading, showMessage, vitalize } from "../../utils";
import DashboardMenu from "../../components/dashboard/dashboardMenu";

const ProductList = {
  vignette: () => {
    document
      .getElementById("create-product-button")
      .addEventListener("click", async () => {
        document.location.hash = `/createproduct`;
      });
    const editButtons = document.getElementsByClassName("edit-button");
    Array.from(editButtons).forEach((editButton) => {
      editButton.addEventListener("click", () => {
        document.location.hash = `/product/${editButton.id}/edit`;
      });
    });
    const deleteButtons = document.getElementsByClassName("delete-button");
    Array.from(deleteButtons).forEach((deleteButton) => {
      deleteButton.addEventListener("click", async () => {
        if (confirm("Are you sure to delete this product?")) {
          showLoading();
          const data = await deleteProduct(deleteButton.id);
          if (data.error) {
            showMessage(data.error);
          } else {
            vitalize(ProductList);
          }
          hideLoading();
        }
      });
    });
  },
  render: async () => {
    const productsResult = await getProducts({});
    const products = Array.isArray(productsResult) ? productsResult : [];
    const productsError = productsResult.error;
    return `
    <div class="wrap">
    ${DashboardMenu.render({ selected: "products" })}
    <div class="main">
      <!--hero-->
      <section class="dashboard-hero">
        <div class="dashboard-hero-copy">
          <span class="dashboard-pill">Product Manager</span>
          <h1>Inventory workspace</h1>
          <p>Monitor product categories, stock health, pricing, and urgent replenishment from one operating view.</p>
          <div class="dashboard-hero-actions">
            <a class="btn-primary text-white" href="/#/createproduct">Add Product</a>
            <a class="btn-outline-primary text-primary" href="#">Export</a>
          </div>
        </div>
        <div class="dashboard-hero-meta">
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Active products</span>
            <span class="dashboard-mini-stat-value">38</span>
            <span class="dashboard-mini-stat-trend">▲ 4 added this week</span>
          </div>
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Low stock alerts</span>
            <span class="dashboard-mini-stat-value">6</span>
            <span class="dashboard-mini-stat-trend">⚠️ urgent review</span>
          </div>
        </div>
      </section>
      <!--end of hero-->
      <!--KPI-->
      <section class="dashboard-kpi-grid">
        <article class="card-metric">
          <div class="icon">📦</div>
          <div>
            <div class="metric-title">Total inventory</div>
            <div class="metric-value">1,284 units</div>
            <div class="metric-desc metric-desc--info">Across 38 SKUs</div>
          </div>
        </article>
        <article class="card-metric">
          <div class="icon">⚡</div>
          <div>
            <div class="metric-title">Low stock</div>
            <div class="metric-value">6 items</div>
            <div class="metric-desc metric-desc--danger">Needs replenishment</div>
          </div>
        </article>
        <article class="card-metric">
          <div class="icon">💸</div>
          <div>
            <div class="metric-title">Inventory value</div>
            <div class="metric-value">Ksh 184,500</div>
            <div class="metric-desc metric-desc--success">+Ksh 9,200 this week</div>
          </div>
        </article>
        <article class="card-metric">
          <div class="icon">🔁</div>
          <div>
            <div class="metric-title">Turnover</div>
            <div class="metric-value">4.8x</div>
            <div class="metric-desc metric-desc--success">Strong movement</div>
          </div>
        </article>
      </section>
      <!--end of KPI-->
      <!--product list-->
      <section class="product-manager-layout">
        <article class="panel product-manager-main-panel">
          <div class="card-title">Catalog overview</div>
          <div class="product-manager-catalog-grid">
            <div class="product-manager-product-card product-manager-product-card-primary">
              <div class="product-manager-product-header">
                <div class="product-manager-product-icon">🌾</div>
                <div>
                  <div class="product-manager-product-name">Layer Mash</div>
                  <div class="text-muted">Feed · 25kg bags</div>
                </div>
              </div>
              <div class="product-manager-product-stats">
                <div>
                  <div class="text-muted">Stock</div>
                  <strong>140 bags</strong>
                </div>
                <div>
                  <div class="text-muted">Price</div>
                  <strong>Ksh 950</strong>
                </div>
              </div>
              <div class="product-manager-product-footer">
                <span class="badge-green text-white">Healthy</span>
                <span class="text-primary">Manage</span>
              </div>
            </div>

            <div class="product-manager-product-card">
              <div class="product-manager-product-header">
                <div class="product-manager-product-icon">🥚</div>
                <div>
                  <div class="product-manager-product-name">Fresh Eggs</div>
                  <div class="text-muted">Produce · trays</div>
                </div>
              </div>
              <div class="product-manager-product-stats">
                <div>
                  <div class="text-muted">Stock</div>
                  <strong>24 trays</strong>
                </div>
                <div>
                  <div class="text-muted">Price</div>
                  <strong>Ksh 300</strong>
                </div>
              </div>
              <div class="product-manager-product-footer">
                <span class="badge-primary text-white">Low stock</span>
                <span class="text-primary">Manage</span>
              </div>
            </div>

            <div class="product-manager-product-card">
              <div class="product-manager-product-header">
                <div class="product-manager-product-icon">🧪</div>
                <div>
                  <div class="product-manager-product-name">Vaccination Pack</div>
                  <div class="text-muted">Service · kits</div>
                </div>
              </div>
              <div class="product-manager-product-stats">
                <div>
                  <div class="text-muted">Stock</div>
                  <strong>16 kits</strong>
                </div>
                <div>
                  <div class="text-muted">Price</div>
                  <strong>Ksh 1,200</strong>
                </div>
              </div>
              <div class="product-manager-product-footer">
                <span class="badge-orange text-white">Restock</span>
                <span class="text-primary">Manage</span>
              </div>
            </div>
          </div>
          ${productsError ? `<div class="message-error">${productsError}</div>` : ''}
          <div class="product-manager-table-wrap">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>IMAGE</th>
                  <th>NAME</th>
                  <th>PRICE</th>
                  <th>CATEGORY</th>
                  <th>BRAND</th>
                  <th>Status</th>
                  <th class="tr-action">ACTION</th>
                </tr>
              </thead>
              <tbody>
              ${products.map((product) => `
                <tr>
                  <td>${product._id}</td>
                  <td><img src="${product.image}" alt="${product.name}" class="table-product-image"/></td>
                  <td>${product.name}</td>
                  <td>${product.price}</td>
                  <td>${product.category}</td>
                  <td>${product.brand}</td>
                  <td><span class="badge-green text-white">In stock</span></td>
                  <td>
                    <button id="${product._id}" class="edit-button">Edit</button>
                    <button id="${product._id}" class="delete-button">Delete</button>
                  </td>
                </tr>`).join("\n")}
              </tbody>
            </table>
          </div>
        </article>
        <aside class="panel product-manager-side-panel">
          <div class="card-title">Inventory update</div>
          <div class="form-label">Product Category</div>
          <select class="form-select"><option>Feed</option><option>Eggs</option><option>Vaccine</option></select>
          <div class="form-label mt-2">Stock level</div>
          <input class="form-control" value="24 units">
          <div class="form-label mt-2">Reorder point</div>
          <input class="form-control" value="30 units">
          <div class="mt-3 product-manager-action-row">
            <a href="#" class="btn-outline-secondary text-black">Update Inventory</a>
            <a href="#" class="btn-outline-primary text-black">Schedule Order</a>
          </div>

          <div class="product-manager-side-note">
            <div class="product-manager-side-note-title">Replenishment focus</div>
            <p class="text-muted">Fresh Eggs and Broiler Feed are below target thresholds and should be reviewed before the next delivery cycle.</p>
          </div>
        </aside>
      <!--end of product list-->
    </div>
  </div>
    `;
  },
};
export default ProductList;
