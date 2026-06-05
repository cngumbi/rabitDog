import { createProduct } from "../../connection/api";
import { hideLoading, showLoading, showMessage } from "../../utils";
import DashboardMenu from "../../components/dashboard/dashboardMenu";

 
  const AddProduct = {
    vignette: () => {
      document
        .getElementById('add-product-form')
        .addEventListener('submit', async (e) => {
          e.preventDefault();
          showLoading();
          const data = await createProduct({
            name: document.getElementById('productName').value,
            price: document.getElementById('price').value,
            brand: document.getElementById('brand').value,
            category: document.getElementById('category').value,
            countInStock: document.getElementById('countInStock').value,
            description: document.getElementById('description').value,
          });
          hideLoading();
          if (data.error) {
            showMessage(data.error);
          } else {
            //setProductInfo(data)
            document.location.hash = '/listproduct';
          }
        });
    },
    render: async () => {
      return `
      <div class="wrap">
        ${DashboardMenu.render({ selected: "createproducts" })}
        <div class="main">
        <!--hero-->
        <section class="dashboard-hero">
            <div class="dashboard-hero-copy">
              <span class="dashboard-pill">New product</span>
              <h1>Create product entry</h1>
              <p>Capture product identity, inventory levels, and pricing so the catalog stays ready for purchasing and sales operations.</p>
              <div class="dashboard-hero-actions">
                <a class="btn-outline-secondary text-black" href="/#/listproduct">Back to products</a>
              </div>
            </div>
            <div class="dashboard-hero-meta">
              <div class="dashboard-mini-stat">
                <span class="dashboard-mini-stat-label">Average price</span>
                <span class="dashboard-mini-stat-value">Ksh 820</span>
                <span class="dashboard-mini-stat-trend">Current catalog</span>
              </div>
              <div class="dashboard-mini-stat">
                <span class="dashboard-mini-stat-label">Ready to publish</span>
                <span class="dashboard-mini-stat-value">98%</span>
                <span class="dashboard-mini-stat-trend">Form completion</span>
              </div>
            </div>
          </section>
          <!--end hero-->
          <!--The add Product section-->
          <section class="add-product-layout">
            <form id="add-product-form">
            <article class="panel add-product-main-panel">
              <div class="card-title">Product details</div>

              <div class="add-product-section-header">
                <div>
                  <div class="add-product-section-title">Identity</div>
                  <div class="text-muted">Name, category, and SKU</div>
                </div>
                <span class="badge-primary text-white">Required</span>
              </div>

              <div class="add-product-form-grid">
                <div>
                  <label class="form-label">Product Name</label>
                  <input class="form-control" type="text" name="productName" id="productName" placeholder=" Enter Product Name" />
                </div>
                <div>
                  <label class="form-label">Category</label>
                  <select class="form-select" id="category">
                    <option value="Feed">Feed</option>
                    <option value="Produce">Produce</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">SKU</label>
                  <input class="form-control" type="text" name="sku" id="sku" placeholder="SKU code">
                </div>
                <div>
                  <label class="form-label">Status</label>
                  <select class="form-select">
                    <option>In stock</option>
                    <option>Low stock</option>
                    <option>Out of stock</option>
                  </select>
                </div>
              </div>

              <div class="add-product-section-header mt-3">
                <div>
                  <div class="add-product-section-title">Inventory & pricing</div>
                  <div class="text-muted">Stock levels and sale price</div>
                </div>
              </div>

              <div class="add-product-form-grid">
                <div>
                  <label class="form-label">Stock Quantity</label>
                  <input class="form-control" type="number" name="countInStock" id="countInStock" value="40">
                </div>
                <div>
                  <label class="form-label">Unit Price</label>
                  <input class="form-control" type="number" name="price" id="price" value="950">
                </div>
                <div>
                  <label class="form-label">Reorder point</label>
                  <input class="form-control" type="number" name="reorderPoint" id="reorderPoint" value="20">
                </div>
                <div>
                  <label class="form-label">Unit of measure</label>
                  <select class="form-select" id="unit">
                    <option value="bags">bags</option>
                    <option value="trays">trays</option>
                    <option value="kits">kits</option>
                  </select>
                </div>
              </div>

              <div class="add-product-section-header mt-3">
                <div>
                  <div class="add-product-section-title">Notes</div>
                  <div class="text-muted">Optional handling or sourcing detail</div>
                </div>
              </div>

              <div>
                <label class="form-label">Internal notes</label>
                <textarea class="form-control" rows="5" name="description" id="description" placeholder="Add supplier notes, seasonal changes, or restocking reminders"></textarea>
              </div>

              <div class="add-product-action-row">
                <button type="submit" class="btn-primary text-white">Save Product</button>
                <button type="button" class="btn-outline-primary text-primary" id="save-draft">Save Draft</button>
              </div>
            </article>
            </form>
            </article>

            <aside class="panel add-product-side-panel">
              <div class="card-title">Product summary</div>
              <div class="add-product-summary-list">
                <div class="add-product-summary-item">
                  <div class="add-product-summary-label">Product name</div>
                  <strong>Layer Mash</strong>
                </div>
                <div class="add-product-summary-item">
                  <div class="add-product-summary-label">Category</div>
                  <strong>Feed</strong>
                </div>
                <div class="add-product-summary-item">
                  <div class="add-product-summary-label">Price</div>
                  <strong>Ksh 950</strong>
                </div>
                <div class="add-product-summary-item">
                  <div class="add-product-summary-label">Stock level</div>
                  <strong>40 units</strong>
                </div>
              </div>

              <div class="add-product-helper-card">
                <div class="add-product-helper-title">Tip</div>
                <p class="text-muted">Use the reorder point to flag items that need procurement attention before they reach a critical low level.</p>
              </div>
            </aside>
          </section>
        <!--end add Product section-->        
        </div>
    </div>
      `;
    },
  };
  export default AddProduct;
  