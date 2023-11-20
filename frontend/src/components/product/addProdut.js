import { createProduct, uploadProductImage } from "../../connection/api";
import { setProductInfo } from "../../localStorage";
import { hideLoading, showLoading, showMessage } from "../../utils";
import DashboardMenu from "../profile/admin/dashboard/dashboardMenu";

 
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
      <div class="dashboard">
        ${DashboardMenu.render({ selected: "createproducts" })}
        <div class="content">
          <div>
            <a href="/#/listproduct">Back to products</a>
          </div>
          <div class="form-container">
            <form action="" id="add-product-form">
                <span>Add Product </span>
                <span>Name </span>
                <input type="text" name="productName" id="productName" placeholder="Product Name" />
                <span>price </span>
                <input type="number" name="price" id="price" placeholder="price" />
                <span>brand </span>
                <input type="text" name="brand" id="brand" placeholder="brand" />
                <span>count In Stock</span>
                <input type="number" name="countInStock" id="countInStock" placeholder="Count In Stock" />
                <span>category </span>
                <input type="text" name="category" id="category" placeholder="category" />
                <span>description </span>
                <input type="text" name="description" id="description" placeholder="description" />
                <input type="submit" class="button" value="Add Product">
            </form>
          </div>
        
        </div>
    </div>
      `;
    },
  };
  export default AddProduct;
  