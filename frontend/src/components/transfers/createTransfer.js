import DashboardMenu from '../dashboard/dashboardMenu';
import { createTransfer, getParties } from '../../connection/api';

const NewTransfer = {
    vignette: ()=> {
        // Handle form submission
        const createBtn = document.querySelector('#create-transfer-btn');
        const saveDraftBtn = document.querySelector('#save-draft-btn');
        const addLineBtn = document.querySelector('#add-line-btn');
        const cancelBtn = document.querySelector('#cancel-transfer-btn');
        
        if (createBtn) {
            createBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleCreateTransfer(true);
            });
        }

        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleCreateTransfer(false);
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
                    window.location.hash = '/transfers';
                }
            });
        }

        // Setup line item actions
        setupLineItemActions();

        // Setup form change listeners for summary
        setupSummaryUpdates();
    },
    render: async ()=>{
        try {
            const parties = await getParties();

            const partiesOptions = !parties.error && parties.length > 0
                ? parties.map(p => `<option value="${p._id}">${p.name}</option>`).join('')
                : '<option value="">No locations available</option>';

            return `
        <div class="wrap">
            ${DashboardMenu.render({ selected: "transfers" })}
            <div class="main">
                <section class="dashboard-hero">
                  <div class="dashboard-hero-copy">
                    <span class="dashboard-pill">New transfer</span>
                    <h1>Launch a stock transfer</h1>
                    <p>Set movement details, validate routing, and prepare the transfer for receiving and reconciliation.</p>
                    <div class="dashboard-hero-actions">
                      <a class="btn-primary text-white" href="/#/transfers">Back to Transfers</a>
                    </div>
                  </div>
                  <div class="dashboard-hero-meta">
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Items to transfer</span>
                      <span class="dashboard-mini-stat-value" id="transfer-items-count">0</span>
                      <span class="dashboard-mini-stat-trend">Units ready</span>
                    </div>
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Total units</span>
                      <span class="dashboard-mini-stat-value" id="transfer-units-total">0</span>
                      <span class="dashboard-mini-stat-trend">To be moved</span>
                    </div>
                  </div>
                </section>

                <div id="alert-container"></div>

                <section class="new-transfer-layout">
                  <article class="panel new-transfer-main-panel">
                    <div class="card-title">Movement details</div>

                    <div class="new-transfer-section-header">
                      <div>
                        <div class="new-transfer-section-title">Routing</div>
                        <div class="text-muted">Source and destination points</div>
                      </div>
                      <span class="badge-primary text-white">Required</span>
                    </div>

                    <div class="new-transfer-form-grid">
                      <div>
                        <label class="form-label">From location</label>
                        <select id="transferFromLocation" class="form-select">
                          <option value="">Select source location</option>
                          ${partiesOptions}
                        </select>
                        <input id="transferFromLocationCustom" class="form-control mt-2" type="text" placeholder="Or enter a new source location">
                      </div>
                      <div>
                        <label class="form-label">To location</label>
                        <select id="transferToLocation" class="form-select">
                          <option value="">Select destination location</option>
                          ${partiesOptions}
                        </select>
                        <input id="transferToLocationCustom" class="form-control mt-2" type="text" placeholder="Or enter a new destination location">
                      </div>
                    </div>
                    <div class="text-muted mt-1">
                      If your location is not listed, type it above or <a href="/#/add-party" class="text-primary">add a new location</a> first.
                    </div>

                    <div class="new-transfer-section-header mt-3">
                      <div>
                        <div class="new-transfer-section-title">Items & quantity</div>
                        <div class="text-muted">Products to transfer and quantities</div>
                      </div>
                    </div>

                    <div class="new-transfer-form-grid">
                      <div>
                        <label class="form-label">Item</label>
                        <input id="lineItemName" class="form-control" type="text" placeholder="Enter item name" required>
                      </div>
                      <div>
                        <label class="form-label">Quantity</label>
                        <input id="lineItemQuantity" class="form-control" type="number" min="1" value="1" required>
                      </div>
                      <div class="new-transfer-span-2">
                        <label class="form-label">Transfer note</label>
                        <textarea id="transferNotes" class="form-control" rows="4" placeholder="Add delivery instructions or special handling notes"></textarea>
                      </div>
                    </div>

                    <div class="new-transfer-action-row mt-2">
                      <button id="add-line-btn" class="btn-outline-primary text-primary">Add another item</button>
                    </div>

                    <div class="new-transfer-section-header mt-3">
                      <div>
                        <div class="new-transfer-section-title">Items preview</div>
                        <div class="text-muted">Current transfer composition</div>
                      </div>
                    </div>

                    <div class="table-wrap">
                      <table class="table table-striped">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody id="line-items-body">
                          <tr id="empty-row">
                            <td colspan="3" class="text-center text-muted">No items added yet</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>


                    <div class="new-transfer-section-header mt-3">
                      <div>
                        <div class="new-transfer-section-title">Dates</div>
                        <div class="text-muted">Schedule and expected receipt</div>
                      </div>
                    </div>

                    <div class="new-transfer-form-grid">
                      <div>
                        <label class="form-label">Shipment date</label>
                        <input id="transferShipmentDate" class="form-control" type="date" required>
                      </div>
                      <div>
                        <label class="form-label">Expected receipt date</label>
                        <input id="transferExpectedReceiptDate" class="form-control" type="date" required>
                      </div>
                    </div>

                    <div class="new-transfer-action-row">
                      <button id="create-transfer-btn" class="btn-primary text-white">Create Transfer</button>
                      <button id="save-draft-btn" class="btn-outline-primary text-primary">Save Draft</button>
                      <button id="cancel-transfer-btn" class="btn-red text-white">Cancel</button>
                    </div>
                  </article>

                  <aside class="panel new-transfer-side-panel">
                    <div class="card-title">Transfer summary</div>
                    <div class="new-transfer-summary-list">
                      <div class="new-transfer-summary-item">
                        <div class="new-transfer-summary-label">From</div>
                        <strong id="summary-from">Not selected</strong>
                      </div>
                      <div class="new-transfer-summary-item">
                        <div class="new-transfer-summary-label">To</div>
                        <strong id="summary-to">Not selected</strong>
                      </div>
                      <div class="new-transfer-summary-item">
                        <div class="new-transfer-summary-label">Items</div>
                        <strong id="summary-items">0 items</strong>
                      </div>
                      <div class="new-transfer-summary-item">
                        <div class="new-transfer-summary-label">Total units</div>
                        <strong id="summary-units">0 units</strong>
                      </div>
                      <div class="new-transfer-summary-item">
                        <div class="new-transfer-summary-label">Shipment date</div>
                        <strong id="summary-shipment">Not set</strong>
                      </div>
                      <div class="new-transfer-summary-item">
                        <div class="new-transfer-summary-label">Expected receipt</div>
                        <strong id="summary-receipt">Not set</strong>
                      </div>
                    </div>

                    <div class="new-transfer-helper-card">
                      <div class="new-transfer-helper-title">Create checklist</div>
                      <div class="new-transfer-check-list">
                        <div class="new-transfer-check-item"><span class="new-transfer-check-dot">○</span><span>Select locations</span></div>
                        <div class="new-transfer-check-item"><span class="new-transfer-check-dot">○</span><span>Add items</span></div>
                        <div class="new-transfer-check-item"><span class="new-transfer-check-dot">○</span><span>Set dates</span></div>
                        <div class="new-transfer-check-item"><span class="new-transfer-check-dot">○</span><span>Confirm transfer</span></div>
                      </div>
                    </div>
                  </aside>
                </section>
            </div>
        </div> 
        `;
        } catch (error) {
            console.error('Error rendering new transfer:', error);
            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "transfers" })}
                    <div class="main">
                        <div class="alert alert-danger">Error loading form data: ${error.message}</div>
                        <a class="btn-primary text-white" href="/#/transfers">Back to Transfers</a>
                    </div>
                </div>
            `;
        }
    }
};

let lineItems = [];

const addLineItem = () => {
    const itemNameInput = document.querySelector('#lineItemName');
    const quantityInput = document.querySelector('#lineItemQuantity');
    const alertContainer = document.querySelector('#alert-container');

    const itemName = itemNameInput.value.trim();
    const quantity = parseInt(quantityInput.value) || 0;

    if (!itemName) {
        showAlert(alertContainer, 'error', 'Please enter an item name before adding an item.');
        return;
    }
    if (quantity <= 0) {
        showAlert(alertContainer, 'error', 'Quantity must be at least 1.');
        return;
    }

    // Check if item already exists
    const existingItem = lineItems.find(item => item.name.toLowerCase() === itemName.toLowerCase());
    if (existingItem) {
        showAlert(alertContainer, 'error', 'This item is already in the transfer. Edit the quantity in the preview table.');
        return;
    }

    lineItems.push({
        name: itemName,
        quantity: quantity
    });

    // Reset inputs
    itemNameInput.value = '';
    quantityInput.value = '1';

    renderLineItems();
    updateSummary();
    showAlert(alertContainer, 'success', `${itemName} added successfully!`);
};


const renderLineItems = () => {
    const lineItemsBody = document.querySelector('#line-items-body');
    const emptyRow = document.querySelector('#empty-row');

    if (lineItems.length === 0) {
        lineItemsBody.innerHTML = '<tr id="empty-row"><td colspan="3" class="text-center text-muted">No items added yet</td></tr>';
        return;
    }

    if (emptyRow) emptyRow.remove();

    lineItemsBody.innerHTML = lineItems.map((item, index) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td><button type="button" class="btn-sm btn-red" onclick="window.deleteLineItem(${index})">Remove</button></td>
        </tr>
    `).join('');
};

window.deleteLineItem = (index) => {
    lineItems.splice(index, 1);
    renderLineItems();
    updateSummary();
};

const setupLineItemActions = () => {
    // Any additional setup for line items
};

const setupSummaryUpdates = () => {
    const fromSelect = document.querySelector('#transferFromLocation');
    const toSelect = document.querySelector('#transferToLocation');
    const fromCustomInput = document.querySelector('#transferFromLocationCustom');
    const toCustomInput = document.querySelector('#transferToLocationCustom');
    const shipmentDateInput = document.querySelector('#transferShipmentDate');
    const receiptDateInput = document.querySelector('#transferExpectedReceiptDate');

    if (fromSelect) fromSelect.addEventListener('change', updateSummary);
    if (toSelect) toSelect.addEventListener('change', updateSummary);
    if (fromCustomInput) fromCustomInput.addEventListener('input', updateSummary);
    if (toCustomInput) toCustomInput.addEventListener('input', updateSummary);
    if (shipmentDateInput) shipmentDateInput.addEventListener('change', updateSummary);
    if (receiptDateInput) receiptDateInput.addEventListener('change', updateSummary);
};

const getLocationValue = (selectId, inputId) => {
    const customValue = document.querySelector(`#${inputId}`)?.value.trim();
    if (customValue) return customValue;
    const select = document.querySelector(`#${selectId}`);
    if (!select || !select.value) return '';
    return select.selectedOptions[0]?.text || '';
};

const updateSummary = () => {
    const fromLocation = getLocationValue('transferFromLocation', 'transferFromLocationCustom') || 'Not selected';
    const toLocation = getLocationValue('transferToLocation', 'transferToLocationCustom') || 'Not selected';
    const shipmentDate = document.querySelector('#transferShipmentDate')?.value || 'Not set';
    const receiptDate = document.querySelector('#transferExpectedReceiptDate')?.value || 'Not set';
    const itemCount = lineItems.length;
    const totalUnits = lineItems.reduce((sum, item) => sum + item.quantity, 0);

    document.querySelector('#summary-from').textContent = fromLocation;
    document.querySelector('#summary-to').textContent = toLocation;
    document.querySelector('#summary-items').textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
    document.querySelector('#summary-units').textContent = `${totalUnits} unit${totalUnits !== 1 ? 's' : ''}`;
    document.querySelector('#summary-shipment').textContent = shipmentDate ? new Date(shipmentDate).toLocaleDateString() : 'Not set';
    document.querySelector('#summary-receipt').textContent = receiptDate ? new Date(receiptDate).toLocaleDateString() : 'Not set';

    document.querySelector('#transfer-items-count').textContent = itemCount;
    document.querySelector('#transfer-units-total').textContent = totalUnits;
};

const handleCreateTransfer = async (isCreate) => {
    const fromLocation = getLocationValue('transferFromLocation', 'transferFromLocationCustom');
    const toLocation = getLocationValue('transferToLocation', 'transferToLocationCustom');
    const fromParty = document.querySelector('#transferFromLocation')?.value || undefined;
    const toParty = document.querySelector('#transferToLocation')?.value || undefined;
    const shipmentDate = document.querySelector('#transferShipmentDate')?.value;
    const expectedReceiptDate = document.querySelector('#transferExpectedReceiptDate')?.value;
    const notes = document.querySelector('#transferNotes')?.value;
    const alertContainer = document.querySelector('#alert-container');

    // Validation
    if (!fromLocation) {
        showAlert(alertContainer, 'error', 'Please provide a source location.');
        return;
    }
    if (!toLocation) {
        showAlert(alertContainer, 'error', 'Please provide a destination location.');
        return;
    }
    if (fromLocation.trim().toLowerCase() === toLocation.trim().toLowerCase()) {
        showAlert(alertContainer, 'error', 'Source and destination locations must be different.');
        return;
    }
    if (isCreate && lineItems.length === 0) {
        showAlert(alertContainer, 'error', 'Please add at least one item to the transfer.');
        return;
    }
    if (isCreate && !shipmentDate) {
        showAlert(alertContainer, 'error', 'Please set a shipment date.');
        return;
    }
    if (isCreate && !expectedReceiptDate) {
        showAlert(alertContainer, 'error', 'Please set an expected receipt date.');
        return;
    }

    const transferData = {
        fromLocation: fromLocation.trim(),
        toLocation: toLocation.trim(),
        fromParty: fromParty || undefined,
        toParty: toParty || undefined,
        items: lineItems,
        shipmentDate,
        expectedReceiptDate,
        notes,
        status: isCreate ? 'pending' : 'draft'
    };

    try {
        showAlert(alertContainer, 'info', isCreate ? 'Creating transfer...' : 'Saving draft...');
        const result = await createTransfer(transferData);

        if (result.error) {
            showAlert(alertContainer, 'error', `Failed: ${result.error}`);
            return;
        }

        showAlert(alertContainer, 'success', isCreate ? 'Transfer created successfully!' : 'Draft saved successfully!');
        setTimeout(() => {
            if (isCreate && result.transfer && result.transfer._id) {
                window.location.hash = `/track-transfer/${result.transfer._id}`;
            } else {
                window.location.hash = '/transfers';
            }
        }, 1500);
    } catch (error) {
        showAlert(alertContainer, 'error', `Error: ${error.message}`);
    }
};

const showAlert = (container, type, message) => {
    const alertClass = type === 'error' ? 'alert-danger' : type === 'success' ? 'alert-success' : 'alert-info';
    container.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    
    if (type === 'success') {
        setTimeout(() => {
            container.innerHTML = '';
        }, 3000);
    }
};

export default NewTransfer;