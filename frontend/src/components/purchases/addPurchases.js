import DashboardMenu from '../dashboard/dashboardMenu';
import { createPurchase, getParties, getProducts } from '../../connection/api';

const AddPurchases = {
    vignette: async ()=> {
        // Handle form submission
        const savePOBtn = document.querySelector('#save-po-btn');
        const saveDraftBtn = document.querySelector('#save-draft-btn');
        const addLineBtn = document.querySelector('#add-line-btn');
        const cancelBtn = document.querySelector('#cancel-po-btn');
        
        if (savePOBtn) {
            savePOBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleSavePurchase(true);
            });
        }

        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleSavePurchase(false);
            });
        }

        if (addLineBtn) {
            addLineBtn.addEventListener('click', (e) => {
                e.preventDefault();
                addLineItem();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Discard changes and go back?')) {
                    window.location.hash = '/purchases';
                }
            });
        }

        // Setup line item actions
        setupLineItemActions();
    },
    render: async ()=>{
        try {
            const parties = await getParties();
            const products = await getProducts({ searchKeyword: "" });

            const suppliersOptions = !parties.error && parties.length > 0 
                ? parties.map(p => `<option value="${p._id}">${p.name}</option>`).join('')
                : '<option value="">No suppliers available</option>';

            const productsOptions = !products.error && products.length > 0
                ? products.map(p => `<option value="${p._id}" data-price="${p.sellingPrice || 0}">${p.productName}</option>`).join('')
                : '<option value="">No products available</option>';

            return `
        <div class="wrap">
            ${DashboardMenu.render({ selected: "purchases" })}
            <div class="main">
               <section class="dashboard-hero">
                  <div class="dashboard-hero-copy">
                    <span class="dashboard-pill">Procurement builder</span>
                    <h1>Create purchase order</h1>
                    <p>Build a procurement document, capture delivery terms, and review the order before sending it into approval.</p>
                    <div class="dashboard-hero-actions">
                      <a class="btn-primary text-white" href="/#/purchases">Back to Purchases</a>
                    </div>
                  </div>
                  <div class="dashboard-hero-meta">
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Draft completion</span>
                      <span class="dashboard-mini-stat-value" id="draft-completion">0%</span>
                      <span class="dashboard-mini-stat-trend">Building order</span>
                    </div>
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Estimated total</span>
                      <span class="dashboard-mini-stat-value" id="estimated-total">Ksh 0</span>
                      <span class="dashboard-mini-stat-trend" id="items-count">0 items</span>
                    </div>
                  </div>
                </section>

                <div id="alert-container"></div>

                <section class="create-po-layout">
                  <article class="panel create-po-main-panel">
                    <div class="card-title">Order details</div>

                    <div class="create-po-section-header">
                      <div>
                        <div class="create-po-section-title">Supplier & delivery</div>
                        <div class="text-muted">Vendor, schedule, and logistics</div>
                      </div>
                      <span class="badge-primary text-white">Required</span>
                    </div>

                    <div class="create-po-form-grid">
                      <div>
                        <label class="form-label">Supplier</label>
                        <select id="poSupplier" class="form-select" required>
                          <option value="">Select supplier</option>
                          ${suppliersOptions}
                        </select>
                      </div>
                      <div>
                        <label class="form-label">Delivery date</label>
                        <input id="poDeliveryDate" class="form-control" type="date" required>
                      </div>
                      <div>
                        <label class="form-label">Payment term</label>
                        <select id="poPaymentTerms" class="form-select">
                          <option value="">Select payment terms</option>
                          <option value="Cash on delivery">Cash on delivery</option>
                          <option value="Net 7">Net 7 days</option>
                          <option value="Net 14">Net 14 days</option>
                          <option value="Net 30">Net 30 days</option>
                        </select>
                      </div>
                    </div>

                    <div class="create-po-section-header mt-3">
                      <div>
                        <div class="create-po-section-title">Line items</div>
                        <div class="text-muted">Select product, quantity, and unit pricing</div>
                      </div>
                      <button id="add-line-btn" class="btn-outline-primary text-primary">+ Add Line</button>
                    </div>

                    <div class="table-wrap">
                      <table class="table table-striped">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Unit Price (Ksh)</th>
                            <th>Amount (Ksh)</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody id="line-items-body">
                          <tr id="empty-row">
                            <td colspan="5" class="text-center text-muted">No items added yet</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div class="create-po-section-header mt-3">
                      <div>
                        <div class="create-po-section-title">Notes</div>
                        <div class="text-muted">Optional internal context and special instructions</div>
                      </div>
                    </div>

                    <div>
                      <label class="form-label">Order notes</label>
                      <textarea id="poNotes" class="form-control" rows="4" placeholder="Add delivery instructions, special requests, or payment notes"></textarea>
                    </div>

                    <div class="create-po-action-row">
                      <button id="save-po-btn" class="btn-primary text-white">Create PO</button>
                      <button id="save-draft-btn" class="btn-outline-primary text-primary">Save Draft</button>
                      <button id="cancel-po-btn" class="btn-red text-white">Cancel</button>
                    </div>
                  </article>

                  <aside class="panel create-po-side-panel">
                    <div class="card-title">Order summary</div>
                    <div class="create-po-summary-list">
                      <div class="create-po-summary-item">
                        <div class="create-po-summary-label">Supplier</div>
                        <strong id="summary-supplier">Not selected</strong>
                      </div>
                      <div class="create-po-summary-item">
                        <div class="create-po-summary-label">Delivery date</div>
                        <strong id="summary-delivery">Not set</strong>
                      </div>
                      <div class="create-po-summary-item">
                        <div class="create-po-summary-label">Items</div>
                        <strong id="summary-items">0 items</strong>
                      </div>
                      <div class="create-po-summary-item">
                        <div class="create-po-summary-label">Estimated total</div>
                        <strong id="summary-total">Ksh 0</strong>
                      </div>
                    </div>

                    <div class="create-po-helper-card">
                      <div class="create-po-helper-title">Create checklist</div>
                      <div class="create-po-check-list">
                        <div class="create-po-check-item"><span class="create-po-check-dot">○</span><span>Select supplier</span></div>
                        <div class="create-po-check-item"><span class="create-po-check-dot">○</span><span>Add line items</span></div>
                        <div class="create-po-check-item"><span class="create-po-check-dot">○</span><span>Set delivery date</span></div>
                        <div class="create-po-check-item"><span class="create-po-check-dot">○</span><span>Confirm total</span></div>
                      </div>
                    </div>
                  </aside>
                </section>

            </div>
        </div>
        `;
        } catch (error) {
            console.error('Error rendering add purchases:', error);
            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "purchases" })}
                    <div class="main">
                        <div class="alert alert-danger">Error loading form data: ${error.message}</div>
                        <a class="btn-primary text-white" href="/#/purchases">Back to Purchases</a>
                    </div>
                </div>
            `;
        }
    }
};

const addLineItem = () => {
    const lineItemsBody = document.querySelector('#line-items-body');
    const emptyRow = document.querySelector('#empty-row');
    
    if (emptyRow) {
        emptyRow.remove();
    }

    const rowId = `line-${Date.now()}`;
    const row = document.createElement('tr');
    row.id = rowId;
    row.innerHTML = `
        <td>
            <select class="form-select line-product" data-row="${rowId}">
                <option value="">Select product</option>
            </select>
        </td>
        <td>
            <input class="form-control line-quantity" type="number" min="1" value="1" data-row="${rowId}">
        </td>
        <td>
            <input class="form-control line-price" type="number" min="0" step="0.01" value="0" data-row="${rowId}">
        </td>
        <td>
            <input class="form-control line-amount" type="number" disabled value="0" data-row="${rowId}">
        </td>
        <td>
            <button class="btn-remove-line" data-row="${rowId}">Remove</button>
        </td>
    `;
    
    lineItemsBody.appendChild(row);
    
    // Re-populate product select
    const products = document.querySelectorAll('.line-product');
    getProducts({ searchKeyword: "" }).then(prods => {
        if (!prods.error) {
            const options = prods.map(p => `<option value="${p._id}" data-price="${p.sellingPrice || 0}">${p.productName}</option>`).join('');
            products.forEach(select => {
                select.innerHTML = '<option value="">Select product</option>' + options;
            });
        }
    });

    setupLineItemActions();
    updateTotal();
};

const setupLineItemActions = () => {
    // Remove line button
    document.querySelectorAll('.btn-remove-line').forEach(btn => {
        btn.removeEventListener('click', removeLineItem);
        btn.addEventListener('click', removeLineItem);
    });

    // Line item change handlers
    document.querySelectorAll('.line-quantity, .line-price').forEach(input => {
        input.removeEventListener('change', updateLineAmount);
        input.addEventListener('change', updateLineAmount);
    });

    // Supplier change
    const supplierSelect = document.querySelector('#poSupplier');
    if (supplierSelect) {
        supplierSelect.removeEventListener('change', updateSummary);
        supplierSelect.addEventListener('change', updateSummary);
    }

    // Delivery date change
    const deliveryDate = document.querySelector('#poDeliveryDate');
    if (deliveryDate) {
        deliveryDate.removeEventListener('change', updateSummary);
        deliveryDate.addEventListener('change', updateSummary);
    }
};

const removeLineItem = (e) => {
    const rowId = e.target.getAttribute('data-row');
    const row = document.querySelector(`#${rowId}`);
    if (row) {
        row.remove();
    }

    // Show empty row if no items
    const lineItemsBody = document.querySelector('#line-items-body');
    if (lineItemsBody.children.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.id = 'empty-row';
        emptyRow.innerHTML = `<td colspan="5" class="text-center text-muted">No items added yet</td>`;
        lineItemsBody.appendChild(emptyRow);
    }

    updateTotal();
};

const updateLineAmount = (e) => {
    const rowId = e.target.getAttribute('data-row');
    const row = document.querySelector(`#${rowId}`);
    const quantity = parseFloat(row.querySelector('.line-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.line-price').value) || 0;
    const amount = quantity * price;
    row.querySelector('.line-amount').value = amount.toFixed(2);
    updateTotal();
};

const updateTotal = () => {
    let total = 0;
    let itemCount = 0;

    document.querySelectorAll('.line-amount').forEach(input => {
        total += parseFloat(input.value) || 0;
        itemCount++;
    });

    // Update summary
    document.querySelector('#summary-items').textContent = `${itemCount} items`;
    document.querySelector('#summary-total').textContent = `Ksh ${total.toLocaleString('en-KE', {minimumFractionDigits: 2})}`;
    document.querySelector('#estimated-total').textContent = `Ksh ${total.toLocaleString('en-KE', {minimumFractionDigits: 2})}`;
    document.querySelector('#items-count').textContent = `${itemCount} items`;
};

const updateSummary = () => {
    const supplierSelect = document.querySelector('#poSupplier');
    const deliveryDate = document.querySelector('#poDeliveryDate');

    if (supplierSelect.selectedOptions[0]) {
        document.querySelector('#summary-supplier').textContent = supplierSelect.selectedOptions[0].text;
    }

    if (deliveryDate.value) {
        const date = new Date(deliveryDate.value);
        document.querySelector('#summary-delivery').textContent = date.toLocaleDateString('en-KE');
    }
};

const handleSavePurchase = async (isPublished = true) => {
    const alertContainer = document.querySelector('#alert-container');
    
    // Get form values
    const supplier = document.querySelector('#poSupplier').value;
    const deliveryDate = document.querySelector('#poDeliveryDate').value;
    const paymentTerms = document.querySelector('#poPaymentTerms').value;
    const notes = document.querySelector('#poNotes').value.trim();

    // Get line items
    const purchaseItems = [];
    let totalAmount = 0;

    document.querySelectorAll('#line-items-body tr:not(#empty-row)').forEach(row => {
        const productSelect = row.querySelector('.line-product');
        const productId = productSelect.value;
        const productName = productSelect.selectedOptions[0]?.text || '';
        const quantity = parseFloat(row.querySelector('.line-quantity').value) || 0;
        const unitPrice = parseFloat(row.querySelector('.line-price').value) || 0;
        const totalPrice = quantity * unitPrice;

        if (productId && quantity > 0 && unitPrice > 0) {
            purchaseItems.push({
                product: productId,
                name: productName,
                quantity,
                unitPrice,
                totalPrice
            });
            totalAmount += totalPrice;
        }
    });

    // Validate required fields
    const errors = [];
    if (!supplier) errors.push('Supplier is required');
    if (!deliveryDate) errors.push('Delivery date is required');
    if (purchaseItems.length === 0) errors.push('At least one line item is required');

    if (errors.length > 0) {
        showAlert(alertContainer, 'error', errors.join('<br>'));
        return;
    }

    // Show loading state
    const saveBtn = document.querySelector('#save-po-btn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = isPublished ? 'Creating...' : 'Saving Draft...';

    try {
        const purchaseData = {
            supplier,
            purchaseItems,
            estimatedTotal: totalAmount,
            expectedDeliveryDate: deliveryDate,
            paymentTerms: paymentTerms || undefined,
            notes: notes || undefined
        };

        const result = await createPurchase(purchaseData);

        if (result.error) {
            showAlert(alertContainer, 'error', result.error);
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
            return;
        }

        // Success
        showAlert(alertContainer, 'success', 'Purchase order created successfully! Redirecting...');
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.hash = '/purchases';
        }, 2000);

    } catch (error) {
        showAlert(alertContainer, 'error', 'An unexpected error occurred: ' + error.message);
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
};

const showAlert = (container, type, message) => {
    const alertClass = type === 'error' ? 'alert alert-danger' : 'alert alert-success';
    container.innerHTML = `<div class="${alertClass}" role="alert">${message}</div>`;
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default AddPurchases;