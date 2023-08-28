// Assuming you have an array of products
const products = [
    {
      _id: 1,
      name: 'Product 1',
      price: 19.99,
      category: 'Electronics',
      brand: 'Brand A',
    },
    // ... other product objects ...
  ];
  
  // Function to generate the HTML for a single product row
  function generateProductRow(product) {
    return `
      <tr>
        <td>${product._id}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.category}</td>
        <td>${product.brand}</td>
        <td>
          <button class="edit-button" data-product-id="${product._id}">Edit</button>
          <button class="delete-button" data-product-id="${product._id}">Delete</button>
        </td>
      </tr>
    `;
  }
  
  // Generate the HTML for all product rows
  const productRowsHTML = products.map(generateProductRow).join('\n');
  
  // Assuming you have a table element with the ID "productTable" in your HTML
  const productTable = document.getElementById('productTable');
  if (productTable) {
    productTable.innerHTML = productRowsHTML;
    
    // Add event listeners for edit and delete buttons
    productTable.addEventListener('click', (event) => {
      const target = event.target;
      
      if (target.classList.contains('edit-button')) {
        const productId = target.getAttribute('data-product-id');
        // Handle edit logic with the productId
      } else if (target.classList.contains('delete-button')) {
        const productId = target.getAttribute('data-product-id');
        // Handle delete logic with the productId
      }
    });
  }
////ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// Sample array of products
const products = [
  {
    _id: 1,
    name: 'Product 1',
    price: 19.99,
    category: 'Electronics',
    brand: 'Brand A',
  },
  // ... other product objects ...
];

// Function to generate the HTML for a single product row
function generateProductRow(product) {
  return `
    <tr>
      <td>${product._id}</td>
      <td>${product.name}</td>
      <td>${product.price}</td>
      <td>${product.category}</td>
      <td>${product.brand}</td>
      <td>
        <button class="edit-button" data-action="edit" data-id="${product._id}">Edit</button>
        <button class="delete-button" data-action="delete" data-id="${product._id}">Delete</button>
      </td>
    </tr>
  `;
}

// Generate the HTML for all product rows
const productRowsHTML = products.map(generateProductRow).join('');

// Assuming you have a <tbody> element with the ID "productTableBody" in your HTML
const productTableBody = document.getElementById('productTableBody');
if (productTableBody) {
  productTableBody.innerHTML = productRowsHTML;

  // Add event listener to the whole table body
  productTableBody.addEventListener('click', (event) => {
    const target = event.target;
    
    if (target.matches('.edit-button')) {
      const productId = target.getAttribute('data-id');
      editProduct(productId);
    } else if (target.matches('.delete-button')) {
      const productId = target.getAttribute('data-id');
      deleteProduct(productId);
    }
  });

  // Sample edit and delete functions
  function editProduct(productId) {
    // Logic to handle editing the product with the given ID
    console.log(`Edit product with ID: ${productId}`);
  }

  function deleteProduct(productId) {
    // Logic to handle deleting the product with the given ID
    console.log(`Delete product with ID: ${productId}`);
  }
}
////vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
// Sample array of products
const products = [
  {
    _id: 1,
    name: 'Product 1',
    price: 19.99,
    category: 'Electronics',
    brand: 'Brand A',
  },
  // ... other product objects ...
];

// Function to generate the HTML for a single product row
function generateProductRow(product) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${product._id}</td>
    <td>${product.name}</td>
    <td>${product.price}</td>
    <td>${product.category}</td>
    <td>${product.brand}</td>
    <td>
      <button class="edit-button" data-id="${product._id}">Edit</button>
      <button class="delete-button" data-id="${product._id}">Delete</button>
    </td>
  `;
  return row;
}

// Function to handle edit action
function editProduct(productId) {
  // Logic to handle editing the product with the given ID
  console.log(`Edit product with ID: ${productId}`);
}

// Function to handle delete action
function deleteProduct(productId) {
  // Logic to handle deleting the product with the given ID
  console.log(`Delete product with ID: ${productId}`);
}

// Populate the table with product rows
const productTableBody = document.getElementById('productTableBody');
if (productTableBody) {
  products.forEach((product) => {
    const row = generateProductRow(product);
    
    // Add event listeners to the edit and delete buttons in the row
    row.querySelector('.edit-button').addEventListener('click', () => {
      editProduct(product._id);
    });
    
    row.querySelector('.delete-button').addEventListener('click', () => {
      deleteProduct(product._id);
    });

    productTableBody.appendChild(row);
  });
}
//////////////////ooooooooooooooooooooooooooooooooooooooooooooooooooooo
// Sample array of products
const products = [
  {
    _id: 1,
    name: 'Product 1',
    price: 19.99,
    category: 'Electronics',
    brand: 'Brand A',
  },
  // ... other product objects ...
];

// Function to generate the HTML for a single product row
function generateProductRow(product) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${product._id}</td>
    <td>${product.name}</td>
    <td>${product.price}</td>
    <td>${product.category}</td>
    <td>${product.brand}</td>
    <td>
      <button class="edit-button">Edit</button>
      <button class="delete-button">Delete</button>
    </td>
  `;

  const editButton = row.querySelector('.edit-button');
  const deleteButton = row.querySelector('.delete-button');

  editButton.addEventListener('click', () => handleEdit(product._id));
  deleteButton.addEventListener('click', () => handleDelete(product._id));

  return row;
}

// Function to handle edit action
function handleEdit(productId) {
  // Logic to handle editing the product with the given ID
  console.log(`Edit product with ID: ${productId}`);
}

// Function to handle delete action
function handleDelete(productId) {
  // Logic to handle deleting the product with the given ID
  console.log(`Delete product with ID: ${productId}`);
}

// Populate the table with product rows
const productTableBody = document.getElementById('productTableBody');
if (productTableBody) {
  products.forEach((product) => {
    const row = generateProductRow(product);
    productTableBody.appendChild(row);
  });
}
//////00000000000000000000000000000000000000000000000000000000000000000000000000

import { createProduct, deleteProduct, getProducts } from "../../connection/api";
import { hideLoading, showLoading, showMessage, vitalize } from "../../utils";
import DashboardMenu from "../profile/admin/dashboard/dashboardMenu";


const ListingProduct = {
  vignette: () => {
    document
      .getElementById("create-product-button")
      .addEventListener("click", async () => {
        const data = await createProduct();
        document.location.hash = `/product/${data.product._id}/edit`;
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
            vitalize(ListingProduct);
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
            ${products.map((product) => {
              return `
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
            }).join("\n")}
          </tbody>
        </table>
      </div>
    </div>
  </div>
    `;
  },
};
export default ListingProduct;
