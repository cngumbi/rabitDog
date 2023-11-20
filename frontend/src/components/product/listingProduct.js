/*import { deleteProduct, getProducts } from "../../connection/api";
import { hideLoading, showMessage } from "../../utils";
import DashboardMenu from "../profile/admin/dashboard/dashboardMenu";

//Listing Product Object
const ListingProduct = {
  //event listener setup
  vignette: () =>{
    //event listener for creating a new product
    document.getElementById("create-product-button").addEventListener("click", async()=>{
      try{
        const data = await createProduct();
        document.location.hash = `/product/${data.product._id}/edit`;
      }catch(err){
        showMessage("Error opening create new Product section");
      }
    });
    //event listener for editing button
    const editButtons = document.getElementsByClassName("edit-button");
    Array.from(editButtons).forEach((editButton)=>{
      document.location.hash = `/product/${editButton.id}/edit`;
    });
    //event listener for deleting button
    const deleteButtons = document.getElementsByClassName("delete-button");
    Array.from(deleteButtons).forEach((deleteButton)=>{
      deleteButton.addEventListener("click", async()=>{
        if(confirm("Are you sure you want to delete this product!")){
          try{
            showLoading();
            const data = await deleteProduct(deleteButton.id);
            if(data.error){
              showMessage(data.error);
            }
          } catch(err){
            showMessage("error Deleting Product");
          } finally{
            hideLoading();
          }
        }
      });
    });
  },
  //Render method for displaying product list
  render: async ()=>{
    try{
      const products = await getProducts({});
      //Generating HTML for product list
      const productRows = products.map((product)=>`
        <tr>
          <td>${product._id}</td>
          <td>${product.name}</td>
          <td>${product.price}</td>
          <td>${product.category}</td>
          <td>${product.brand}</td>
          <td>
          <button id="${product._id}" class="edit-button">Edit</button>
          <button id="${product._id}" class="delete-button">Delete</button>
          </td>
        </tr>
      `).join("\n");

      //Generating complete HTML content
      const htmlContent = `
        <div class="dashboard">
          ${DashboardMenu.render({ selected: "products" })}
          <div class="dashboard-content">
            <h1>Products</h1>
            <button id="create-product-button" class="primary">
              Create Product
            </button>
            <div class="product-list">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>PRICE</th>
                    <th>CATEGORY</th>
                    <th>BRAND</th>
                    <th class="tr-action">ACTION</th>
                  <tr>
                </thead>
                <tbody>
                  ${productRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
      return htmlContent;
    }catch(err){
      showMessage("Error fetching products")
      return "";
    }
  },
};
export default ListingProduct*/
//import { createProduct, deleteProduct, getProducts } from "../../connection/api";
//import { hideLoading, showLoading, showMessage, vitalize } from "../../utils";
//import DashboardMenu from "../profile/admin/dashboard/dashboardMenu";
//
//const ListingProduct = {
//  init: () => {
//    ListingProduct.attachEventListeners();
//    ListingProduct.render();
//  },
//
//  attachEventListeners: () => {
//    const createProductButton = document.getElementById("create-product-button");
//    createProductButton.addEventListener("click", ListingProduct.handleCreateProduct);
//
//    const editButtons = document.querySelectorAll(".edit-button");
//    editButtons.forEach((editButton) => {
//      editButton.addEventListener("click", () => ListingProduct.handleEditProduct(editButton.id));
//    });
//
//    const deleteButtons = document.querySelectorAll(".delete-button");
//    deleteButtons.forEach((deleteButton) => {
//      deleteButton.addEventListener("click", () => ListingProduct.handleDeleteProduct(deleteButton.id));
//    });
//  },
//
//  handleCreateProduct: async () => {
//    try {
//      //const data = await createProduct();
//      //window.location.hash = `/product/${data.product._id}/edit`;
//      window.location.hash = `/products/createProducts`;
//    } catch (error) {
//      ListingProduct.showError("Error creating product.");
//    }
//  },
//
//  handleEditProduct: (productId) => {
//    window.location.hash = `/product/${productId}/edit`;
//  },
//
//  handleDeleteProduct: async (productId) => {
//    if (confirm("Are you sure you want to delete this product?")) {
//      try {
//        showLoading();
//        const data = await deleteProduct(productId);
//        if (data.error) {
//          ListingProduct.showError(data.error);
//        } else {
//          vitalize(ListingProduct);
//        }
//      } catch (error) {
//        ListingProduct.showError("Error deleting product.");
//      } finally {
//        hideLoading();
//      }
//    }
//  },
//
//  renderProductList: (products) => {
//    return products
//      .map((product) => `
//        <tr>
//          <td>${product._id}</td>
//          <td>${product.name}</td>
//          <td>${product.price}</td>
//          <td>${product.category}</td>
//          <td>${product.brand}</td>
//          <td>
//            <button id="${product._id}" class="edit-button">Edit</button>
//            <button id="${product._id}" class="delete-button">Delete</button>
//          </td>
//        </tr>
//      `)
//      .join("\n");
//  },
//
//  showError: (message) => {
//    showMessage(message);
//  },
//
//  render: async () => {
//    try {
//      const products = await getProducts({});
//      const productListHTML = ListingProduct.renderProductList(products);
//
//      const htmlContent = `
//        <div class="dashboard">
//          ${DashboardMenu.render({ selected: "products" })}
//          <div class="dashboard-content">
//            <h1>Products</h1>
//            <button id="create-product-button" class="primary">Create Product</button>
//            <div class="product-list">
//              <table>
//                <thead>
//                  <tr>
//                    <th>ID</th>
//                    <th>NAME</th>
//                    <th>PRICE</th>
//                    <th>CATEGORY</th>
//                    <th>BRAND</th>
//                    <th class="tr-action">ACTION</th>
//                  </tr>
//                </thead>
//                <tbody>
//                  ${productListHTML}
//                </tbody>
//              </table>
//            </div>
//          </div>
//        </div>
//      `;
//
//      const listingProductContainer = document.getElementById("listing-product-container");
//      listingProductContainer.innerHTML = htmlContent;
//    } catch (error) {
//      ListingProduct.showError("Error fetching products.");
//    }
//  },
//  vignette: ()=>{}
//};
//
//document.addEventListener("DOMContentLoaded", ListingProduct.init);
//
//export default ListingProduct;
//import DashboardMenu from "../components/DashboardMenu";
//import { getProducts, createProduct, deleteProduct } from "../api";
//import { showLoading, hideLoading, rerender, showMessage } from "../utils";

import { deleteProduct, getProducts } from "../../connection/api";
import { hideLoading, showLoading, showMessage, vitalize } from "../../utils";
import DashboardMenu from "../profile/admin/dashboard/dashboardMenu";

const ProductList = {
  vignette: () => {
    document
      .getElementById("create-product-button")
      .addEventListener("click", async () => {
        //const data = await createProduct();
        //document.location.hash = `/product/${data.product._id}/edit`;
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
    const products = await getProducts({});
    return `
    <div class="dashboard">
    ${DashboardMenu.render({ selected: "products" })}
    <div class="dashboard-content">
      <h1>Products</h1>
      <button id="create-product-button" class="primary">
        Create Product
      </button>
      <div class="product-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>PRICE</th>
              <th>CATEGORY</th>
              <th>BRAND</th>
              <th class="tr-action">ACTION</th>
            <tr>
          </thead>
          <tbody>
            ${products
              .map(
                (product) => `
            <tr>
              <td>${product._id}</td>
              <td>${product.name}</td>
              <td>${product.price}</td>
              <td>${product.category}</td>
              <td>${product.brand}</td>
              <td>
              <button id="${product._id}" class="edit-button">Edit</button>
              <button id="${product._id}" class="delete-button">Delete</button>
              </td>
            </tr>
            `
              )
              .join("\n")}
          </tbody>
        </table>
      </div>
    </div>
  </div>
    `;
  },
};
export default ProductList;
