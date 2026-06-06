import { deleteProduct, getProducts, updateProduct } from "../../connection/api";
import { apiURL } from "../../config/config";
import { hideLoading, showLoading, showMessage, showToast, vitalize } from "../../utils";
import DashboardMenu from "../../components/dashboard/dashboardMenu";

const ProductList = {
  vignette: () => {
    const createBtn = document.getElementById("create-product-button");
    if (createBtn) {
      createBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        document.location.hash = `/createproduct`;
      });
    }
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

    // Inventory side-panel interactions
    const productSelect = document.getElementById('inventory-product-select');
    const stockInput = document.getElementById('inventory-stock');
    const reorderInput = document.getElementById('inventory-reorder');
    const updateBtn = document.getElementById('update-inventory-button');
    const findProductById = (id) => {
      try{
        return window.__products__ ? window.__products__.find(p => p._id === id) : null;
      }catch(e){ return null }
    }
    if (productSelect) {
      productSelect.addEventListener('change', (e) => {
        const p = findProductById(e.target.value);
        if (p) {
          if (stockInput) stockInput.value = p.countInStock || 0;
          if (reorderInput) reorderInput.value = p.reorderPoint || Math.max(5, Math.ceil((p.countInStock || 0) * 0.2));
        }
      });
      // populate initial values
      if (productSelect.options.length > 0) {
        const firstId = productSelect.options[0].value;
        const p = findProductById(firstId);
        if (p) {
          if (stockInput) stockInput.value = p.countInStock || 0;
          if (reorderInput) reorderInput.value = p.reorderPoint || Math.max(5, Math.ceil((p.countInStock || 0) * 0.2));
        }
      }
    }
    if (updateBtn) {
      updateBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const selectedId = productSelect ? productSelect.value : null;
        if (!selectedId) {
          showMessage('Please select a product to update');
          return;
        }
        showLoading();
        const payload = {
          _id: selectedId,
          countInStock: Number(stockInput ? stockInput.value : 0),
          reorderPoint: reorderInput ? reorderInput.value : undefined,
        };
        const data = await updateProduct(payload);
        hideLoading();
        if (data.error) showMessage(data.error);
        else {
          // non-blocking toast, then refresh
          try{ showToast('Inventory updated'); }catch(e){}
          setTimeout(()=> vitalize(ProductList), 600);
        }
      });
    }
  },
  render: async () => {
    const productsResult = await getProducts({});
    const products = Array.isArray(productsResult) ? productsResult : [];
    const productsError = productsResult.error;
    const totalInventory = products.reduce((sum, product) => sum + Number(product.countInStock || 0), 0);
    const lowStockCount = products.filter((product) => Number(product.countInStock || 0) <= 5).length;
    const inventoryValue = products.reduce((sum, product) => sum + (Number(product.price || 0) * Number(product.countInStock || 0)), 0);
    const activeProducts = products.length;
    const turnoverRatio = lowStockCount ? Math.round((activeProducts / lowStockCount) * 10) / 10 : 0;
    const topProducts = [...products].sort((a, b) => Number(b.countInStock || 0) - Number(a.countInStock || 0)).slice(0, 3);
    const categories = [...new Set(products.map((product) => product.category || 'Uncategorized'))];
    const lowStockProducts = products.filter((product) => Number(product.countInStock || 0) <= 5);
    const rows = products.map((product) => {
      const rawImage = product.image || '';
      const imageSrc = rawImage && (rawImage.startsWith('http') || rawImage.startsWith('/'))
        ? rawImage
        : (rawImage ? `${apiURL}/${rawImage}` : '');
      const status = Number(product.countInStock || 0) <= 0 ? 'Out of stock' : Number(product.countInStock || 0) <= 5 ? 'Low stock' : 'In stock';
      const statusBadge = status === 'In stock' ? 'badge-green' : status === 'Low stock' ? 'badge-primary' : 'badge-orange';
      return `
                <tr>
                  <td>${product._id.substring(0, 7)}</td>
                  <td>${product.sku || ''}</td>
                  <td><img src="${imageSrc}" alt="${product.name}" class="table-product-image"/></td>
                  <td>${product.name}</td>
                  <td>${product.price}</td>
                  <td>${product.category}</td>
                  <td>${product.brand}</td>
                  <td><span class="${statusBadge} text-white">${status}</span></td>
                  <td>
                    <button id="${product._id}" class="edit-button">Edit</button>
                    <button id="${product._id}" class="delete-button">Delete</button>
                  </td>
                </tr>`;
    }).join("\n");
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
            <a id="create-product-button" class="btn-primary text-white" href="/#/createproduct">Add Product</a>
            <a class="btn-outline-primary text-primary" href="#">Export</a>
          </div>
        </div>
        <div class="dashboard-hero-meta">
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Active products</span>
            <span class="dashboard-mini-stat-value">${activeProducts}</span>
            <span class="dashboard-mini-stat-trend">${lowStockCount} with low stock</span>
          </div>
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Low stock alerts</span>
            <span class="dashboard-mini-stat-value">${lowStockCount}</span>
            <span class="dashboard-mini-stat-trend">${lowStockProducts.length ? 'Review replenishment' : 'Balanced levels'}</span>
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
            <div class="metric-value">${totalInventory} units</div>
            <div class="metric-desc metric-desc--info">Across ${activeProducts} products</div>
          </div>
        </article>
        <article class="card-metric">
          <div class="icon">⚡</div>
          <div>
            <div class="metric-title">Low stock</div>
            <div class="metric-value">${lowStockCount} items</div>
            <div class="metric-desc metric-desc--danger">${lowStockCount ? 'Needs replenishment' : 'Inventory healthy'}</div>
          </div>
        </article>
        <article class="card-metric">
          <div class="icon">💸</div>
          <div>
            <div class="metric-title">Inventory value</div>
            <div class="metric-value">Ksh ${inventoryValue.toLocaleString()}</div>
            <div class="metric-desc metric-desc--success">Based on current stock</div>
          </div>
        </article>
        <article class="card-metric">
          <div class="icon">🔁</div>
          <div>
            <div class="metric-title">Turnover</div>
            <div class="metric-value">${turnoverRatio.toFixed(1)}x</div>
            <div class="metric-desc metric-desc--success">Stock rotation ratio</div>
          </div>
        </article>
      </section>
      <!--end of KPI-->
      <!--product list-->
      <section class="product-manager-layout">
        <article class="panel product-manager-main-panel">
          <div class="card-title">Catalog overview</div>
          <div class="product-manager-catalog-grid">
            ${topProducts.map((product) => {
              const rawImage = product.image || '';
              const imageSrc = rawImage && (rawImage.startsWith('http') || rawImage.startsWith('/'))
                ? rawImage
                : (rawImage ? `${apiURL}/${rawImage}` : '');
              const status = Number(product.countInStock || 0) <= 0 ? 'Out of stock' : Number(product.countInStock || 0) <= 5 ? 'Low stock' : 'In stock';
              return `
            <div class="product-manager-product-card ${status === 'In stock' ? 'product-manager-product-card-primary' : status === 'Low stock' ? '' : ''}">
              <div class="product-manager-product-header">
                <div class="product-manager-product-icon">${product.category === 'Service' ? '🧪' : product.category === 'Feed' ? '🌾' : '🥚'}</div>
                <div>
                  <div class="product-manager-product-name">${product.name}</div>
                  <div class="text-muted">${product.category} · ${product.brand}</div>
                </div>
              </div>
              <div class="product-manager-product-stats">
                <div>
                  <div class="text-muted">Stock</div>
                  <strong>${product.countInStock || 0}</strong>
                </div>
                <div>
                  <div class="text-muted">Price</div>
                  <strong>Ksh ${product.price || 0}</strong>
                </div>
              </div>
              <div class="product-manager-product-footer">
                <span class="${status === 'In stock' ? 'badge-green' : status === 'Low stock' ? 'badge-primary' : 'badge-orange'} text-white">${status}</span>
                <span class="text-primary">${status === 'Low stock' ? 'Restock' : 'Manage'}</span>
              </div>
            </div>`;
            }).join('')}
          </div>
          ${productsError ? `<div class="message-error">${productsError}</div>` : ''}
          <div class="product-manager-table-wrap">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>SKU</th>
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
              ${rows}
              </tbody>
            </table>
          </div>
        </article>
        <aside class="panel product-manager-side-panel">
          <div class="card-title">Inventory update</div>
          <div class="form-label">Select product</div>
          <select id="inventory-product-select" class="form-select">
            ${products.map((p) => `<option value="${p._id}">${p.name} (${p._id.substring(0,7)})</option>`).join('')}
          </select>
          <div class="form-label mt-2">Stock level</div>
          <input id="inventory-stock" class="form-control" value="${products.length ? (products[0].countInStock || 0) : 0}">
          <div class="form-label mt-2">Reorder point</div>
          <input id="inventory-reorder" class="form-control" value="${products.length ? (products[0].reorderPoint || Math.max(5, Math.ceil((products[0].countInStock || 0) * 0.1))) : Math.max(5, Math.ceil(totalInventory * 0.1))}">
          <div class="mt-3 product-manager-action-row">
            <button id="update-inventory-button" class="btn-outline-secondary text-black">Update Inventory</button>
            <a href="#" class="btn-outline-primary text-black">Schedule Order</a>
          </div>

          <div class="product-manager-side-note">
            <div class="product-manager-side-note-title">Replenishment focus</div>
            <p class="text-muted">${lowStockProducts.length > 0 ? `Review ${lowStockProducts.length} low stock item${lowStockProducts.length > 1 ? 's' : ''}: ${lowStockProducts.slice(0, 3).map((product) => product.name).join(', ')}.` : 'All products currently meet minimum stock levels.'}</p>
          </div>
        </aside>
        <script>window.__products__ = ${JSON.stringify(products)};</script>
      <!--end of product list-->
    </div>
  </div>
    `;
  },
};
export default ProductList;
