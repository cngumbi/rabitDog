import ParseRequestUrl from "../../config/parseUrl";
import { apiURL } from "../../config/config";
import DashboardMenu from "../../components/dashboard/dashboardMenu";
import { getProduct, updateProduct, uploadProductImage } from "../../connection/api";
import { hideLoading, showLoading, showMessage, showToast } from "../../utils";

 
  const EditProduct = {
    vignette: () => {
      const request = ParseRequestUrl();
      const productId = request.id || request.verb;
      const form = document.getElementById('edit-product-form');
      const imageInput = document.getElementById('image');
      const fileInput = document.getElementById('image-file');

      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          showLoading();
          const payload = {
            _id: productId,
            name: document.getElementById('name').value,
            price: document.getElementById('price').value,
            image: imageInput ? imageInput.value : '',
            brand: document.getElementById('brand').value,
            category: document.getElementById('category').value,
            countInStock: document.getElementById('countInStock').value,
            description: document.getElementById('description').value,
            reorderPoint: document.getElementById('reorderPoint') ? document.getElementById('reorderPoint').value : undefined,
          };
          const data = await updateProduct(payload);
          hideLoading();
          if (data.error) {
            showToast(data.error, 'error');
          } else {
            document.location.hash = '/listproduct';
          }
        });
      }

      if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const formData = new FormData();
          formData.append('image', file);
          showLoading();
          const data = await uploadProductImage(formData);
          hideLoading();
          if (data.error) {
            showMessage(data.error);
          } else {
            showMessage('Image uploaded successfully.');
            const uploadedImage = data.image || data.path || '';
            if (imageInput) {
              imageInput.value = uploadedImage;
            }
          }
        });
      }
    },
    render: async () => {
      const request = ParseRequestUrl();
      const productId = request.id || request.verb;
      const product = await getProduct(productId);
      if (product.error) {
        return `<div class="wrap"><div class="main"><div class="message-error">${product.error}</div></div></div>`;
      }
      const rawImage = product.image || '';
      const imageSrc = rawImage && (rawImage.startsWith('http') || rawImage.startsWith('/'))
        ? rawImage
        : (rawImage ? `${apiURL}/${rawImage}` : '');
      const status = Number(product.countInStock || 0) <= 0 ? 'Out of stock' : Number(product.countInStock || 0) <= 5 ? 'Low stock' : 'In stock';
      const reorderPoint = Math.max(5, Math.ceil(Number(product.countInStock || 0) * 0.2));
      const lastUpdated = product.updatedAt || product.createdAt ? new Date(product.updatedAt || product.createdAt).toLocaleDateString() : 'N/A';
      return `
      <div class="wrap">
        ${DashboardMenu.render({ selected: "products" })}
        <div class="main">
        <!--hero-->
        <section class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Edit product</span>
            <h1>Update product listing</h1>
            <p>Adjust inventory, pricing, and product metadata so the catalog stays accurate and ready for sales.</p>
            <div class="dashboard-hero-actions">
              <a class="btn-outline-primary text-black" href="/#/listproduct"> Cancel</a>
            </div>
          </div>
          <div class="dashboard-hero-meta">
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Current stock</span>
              <span class="dashboard-mini-stat-value">${product.countInStock || 0} units</span>
              <span class="dashboard-mini-stat-trend">Updated ${lastUpdated}</span>
            </div>
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Unit price</span>
              <span class="dashboard-mini-stat-value">Ksh ${product.price || 0}</span>
              <span class="dashboard-mini-stat-trend">${status === 'In stock' ? 'Healthy' : status === 'Low stock' ? 'Review stock' : 'Out of stock'}</span>
            </div>
          </div>
        </section>
        <!--end hero-->
        <!--edit product section-->
        <section class="add-product-layout">
          <article class="panel add-product-main-panel">
            <div class="card-title">Product details</div>
            <form id="edit-product-form">
              <div class="add-product-section-header">
                <div>
                  <div class="add-product-section-title">Identity</div>
                  <div class="text-muted">Name, category, brand, and image</div>
                </div>
                <span class="badge-primary text-white">Required</span>
              </div>

              <div class="add-product-form-grid">
                <div>
                  <label class="form-label">Product Name</label>
                  <input type="text" name="name" value="${product.name || ''}" id="name" />
                </div>
                <div>
                  <label class="form-label">Category</label>
                  <select class="form-select" id="category">
                    <option value="Produce" ${product.category === 'Produce' ? 'selected' : ''}>Produce</option>
                    <option value="Feed" ${product.category === 'Feed' ? 'selected' : ''}>Feed</option>
                    <option value="Service" ${product.category === 'Service' ? 'selected' : ''}>Service</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Brand</label>
                  <input type="text" name="brand" value="${product.brand || ''}" id="brand" />
                </div>
                <div>
                  <label class="form-label">Product image URL</label>
                  <input type="text" name="image" value="${product.image || ''}" id="image" />
                  <input type="file" name="image-file" id="image-file" />
                </div>
                <!-- SKU is generated server-side and cannot be edited here -->
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
                  <input type="text" name="countInStock" value="${product.countInStock || 0}" id="countInStock" />
                </div>
                <div>
                  <label class="form-label">Unit Price</label>
                  <input type="number" name="price" value="${product.price || 0}" id="price" />
                </div>
                <div>
                  <label class="form-label">Status</label>
                  <select class="form-select" id="status">
                    <option value="In stock" ${status === 'In stock' ? 'selected' : ''}>In stock</option>
                    <option value="Low stock" ${status === 'Low stock' ? 'selected' : ''}>Low stock</option>
                    <option value="Out of stock" ${status === 'Out of stock' ? 'selected' : ''}>Out of stock</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Reorder point</label>
                  <input type="text" name="reorderPoint" value="${product.reorderPoint || reorderPoint}" id="reorderPoint" />
                </div>
              </div>

              <div class="add-product-section-header mt-3">
                <div>
                  <div class="add-product-section-title">Notes</div>
                  <div class="text-muted">Optional handling or sourcing detail</div>
                </div>
              </div>

              <div>
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="5" id="description">${product.description || ''}</textarea>
              </div>

              <div class="add-product-action-row">
                <button type="submit" class="btn btn-outline-primary text-black">Update</button>
              </div>
            </form>
          </article>

          <aside class="panel add-product-side-panel">
            <div class="card-title">Currently editing</div>

            <div style="border-radius:18px;overflow:hidden;margin-bottom:1rem;">
              <img src="${imageSrc || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'320\' height=\'320\' viewBox=\'0 0 320 320\'%3E%3Crect width=\'320\' height=\'320\' fill=\'%23f8fafc\'/%3E%3Ctext x=\'50%25\' y=\'46%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Inter,system-ui,sans-serif\' font-size=\'24\' fill=\'%236b7280\'%3EProduct%3C/text%3E%3Ctext x=\'50%25\' y=\'60%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Inter,system-ui,sans-serif\' font-size=\'18\' fill=\'%236b7280\'%3EImage%3C/text%3E%3C/svg%3E'}" alt="${product.name || 'Product'}" style="display:block;width:100%;height:auto;">
            </div>

            <div class="product-manager-product-card product-manager-product-card-primary">
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
                <span class="text-primary">Product ID ${product._id.substring(0, 8)}</span>
              </div>
            </div>

            <div class="add-product-summary-list">
              <div class="add-product-summary-item">
                <div class="add-product-summary-label">SKU</div>
                <strong>${product.sku || product._id.substring(0, 8)}</strong>
              </div>
              <div class="add-product-summary-item">
                <div class="add-product-summary-label">Last updated</div>
                <strong>${lastUpdated}</strong>
              </div>
              <div class="add-product-summary-item">
                <div class="add-product-summary-label">Reorder point</div>
                <strong>${reorderPoint} units</strong>
              </div>
              <div class="add-product-summary-item">
                <div class="add-product-summary-label">Brand</div>
                <strong>${product.brand || 'Unknown'}</strong>
              </div>
            </div>

            <div class="add-product-helper-card">
              <div class="add-product-helper-title">Why this matters</div>
              <p class="text-muted">This preview keeps the current product context visible while you update pricing, quantity, and inventory details.</p>
            </div>
          </aside>
        </section>
        <!--end of edit product section-->
      `;
    },
  };
  export default EditProduct;
  