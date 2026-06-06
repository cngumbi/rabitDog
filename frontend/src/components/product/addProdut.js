import { createProduct, uploadProductImage, getProducts } from "../../connection/api";
import { hideLoading, showLoading, showMessage, showToast } from "../../utils";
import DashboardMenu from "../../components/dashboard/dashboardMenu";

 
  const AddProduct = {
    vignette: () => {
      // image preview handler
      const imageInput = document.getElementById('image');
      if (imageInput) {
        imageInput.addEventListener('change', (ev) => {
          const file = ev.target.files && ev.target.files[0];
          const preview = document.getElementById('image-preview');
          if (file && preview) {
            const url = URL.createObjectURL(file);
            preview.src = url;
            preview.style.display = 'block';
          }
        });
      }

      document
        .getElementById('add-product-form')
        .addEventListener('submit', async (e) => {
          e.preventDefault();
          showLoading();

          // Upload image first (if provided)
          let imagePath = '';
          const fileInput = document.getElementById('image');
          if (fileInput && fileInput.files && fileInput.files[0]) {
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            const uploadResult = await uploadProductImage(formData);
            if (!uploadResult || uploadResult.error) {
              hideLoading();
              showMessage(uploadResult?.error || 'Image upload failed.');
              return;
            }
            imagePath = uploadResult.image || uploadResult.path || uploadResult.data?.image || '';
            if (!imagePath) {
              hideLoading();
              showMessage('Image uploaded but no file path was returned.');
              return;
            }
          }

          const data = await createProduct({
            name: document.getElementById('productName').value,
            price: document.getElementById('price').value,
            brand: document.getElementById('brand') ? document.getElementById('brand').value : '',
            category: document.getElementById('category').value,
            countInStock: document.getElementById('countInStock').value,
            description: document.getElementById('description').value,
            image: imagePath,
            reorderPoint: document.getElementById('reorderPoint') ? document.getElementById('reorderPoint').value : undefined,
          });


          hideLoading();
          if (data.error) {
            showToast(data.error, 'error');
          } else {
            document.location.hash = '/listproduct';
          }
        });
      // attach hero helpers after vignette setup
      try{ AddProduct.attachHeroHelpers(); }catch(e){}
    },
    attachHeroHelpers: async () => {
      // update average price and ready-to-publish indicator
      try{
        const avgEl = document.getElementById('avg-price');
        const readyEl = document.getElementById('ready-publish');
        const result = await getProducts({});
        const products = Array.isArray(result) ? result : [];
        const avg = products.length ? Math.round(products.reduce((s,p)=> s + Number(p.price || 0), 0) / products.length) : 0;
        if(avgEl) avgEl.innerText = `Ksh ${avg}`;

        const form = document.getElementById('add-product-form');
        const fields = ['productName','price','category','countInStock'];
        const calcReady = () => {
          const total = fields.length;
          let filled = 0;
          fields.forEach(id=>{ const el = document.getElementById(id); if(el && String(el.value).trim()) filled++; });
          const pct = Math.round((filled/total) * 100);
          if(readyEl) readyEl.innerText = `${pct}%`;
        };
        if(form){
          fields.forEach(id=>{ const el = document.getElementById(id); if(el) el.addEventListener('input', calcReady); });
          calcReady();
        }
      }catch(e){/* ignore */}
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
              <span id="avg-price" class="dashboard-mini-stat-value">Ksh --</span>
              <span class="dashboard-mini-stat-trend">Current catalog</span>
            </div>
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Ready to publish</span>
              <span id="ready-publish" class="dashboard-mini-stat-value">--%</span>
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
                  <label class="form-label">Brand</label>
                  <input class="form-control" type="text" name="brand" id="brand" placeholder="Brand name" />
                </div>
                <div>
                  <label class="form-label">Category</label>
                  <select class="form-select" id="category">
                    <option value="Feed">Feed</option>
                    <option value="Produce">Produce</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
              <!-- SKU is generated automatically by the server -->
                <div>
                  <label class="form-label">Product image</label>
                  <input class="form-control" type="file" id="image" accept="image/*">
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

            <aside class="panel add-product-side-panel">
              <div class="card-title">Product summary</div>
              <div style="margin:0.75rem 0">
                <img id="image-preview" src="" alt="Preview" style="display:none;max-width:100%;border-radius:6px;" />
              </div>
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
  