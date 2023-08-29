import ParseRequestUrl from "../../config/parseUrl";
import { createProduct, uploadProductImage } from "../../connection/api";
import { hideLoading, showLoading, showMessage } from "../../utils";
import DashboardMenu from "../profile/admin/dashboard/dashboardMenu";

 
  const AddProduct = {
    vignette: () => {
      const request = ParseRequestUrl();
      document
        .getElementById('add-product-form')
        .addEventListener('submit', async (e) => {
          e.preventDefault();
          showLoading();
          const data = await createProduct({
            _id: request.id,
            name: document.getElementById('name').value,
            price: document.getElementById('price').value,
            image: document.getElementById('image').value,
            brand: document.getElementById('brand').value,
            category: document.getElementById('category').value,
            countInStock: document.getElementById('countInStock').value,
            description: document.getElementById('description').value,
          });
          hideLoading();
          if (data.error) {
            showMessage(data.error);
          } else {
            document.location.hash = '/productlist';
          }
        });
      document
        .getElementById('image-file')
        .addEventListener('change', async (e) => {
          const file = e.target.files[0];
          const formData = new FormData();
          formData.append('image', file);
          showLoading();
          const data = await uploadProductImage(formData);
          hideLoading();
          if (data.error) {
            showMessage(data.error);
          } else {
            showMessage('Image uploaded successfully.');
            document.getElementById('image').value = data.image;
          }
        });
    },
    render: async () => {
      const request = ParseRequestUrl();
      return `
      <div class="dashboard">
        ${DashboardMenu.render({ selected: "createproducts" })}
        <div class="content">
          <div>
            <a href="/#/productlist">Back to products</a>
          </div>
          <div class="form-container">
            <form id="add-product-form">
              <ul class="form-items">
                <li>
                  <h1>Add Product </h1>
                </li>
                <li>
                  <label for="name">Name</label>
                  <input type="text" name="name" id="name" />
                </li>
                <li>
                  <label for="price">Price</label>
                  <input type="number" name="price" id="price" />
                </li>
                <li>
                  <label for="image">Image (680 x 830)</label>
                  <input type="text" name="image" id="image" />
                  <input type="file" name="image-file" id="image-file" />
                </li>
                <li>
                  <label for="brand">Brand</label>
                  <input type="text" name="brand" id="brand" />
                </li>
                <li>
                  <label for="countInStock">Count In Stock</label>
                  <input type="text" name="countInStock" id="countInStock" />
                </li>
                <li>
                  <label for="category">Category</label>
                  <input type="text" name="category" id="category" />
                </li>
                <li>
                  <label for="description">Description</label>
                  <input type="text" name="description" id="description" />
                </li>
                <li>
                  <button type="submit" class="">Add</button>
                </li>
              </ul>
            </form>
          </div>
        
        </div>
    </div>
      `;
    },
  };
  export default AddProduct;
  