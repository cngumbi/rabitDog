import DashboardMenu from '../dashboard/dashboardMenu';
import { getTransfer, receiveTransfer } from '../../connection/api';

const TrackTransfer = {
    vignette: () => {
        const approveBtn = document.querySelector('#approve-delivery-btn');
        if (approveBtn) {
            approveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const transferId = approveBtn.dataset.transferId;
                if (!transferId) return;
                approveBtn.disabled = true;
                approveBtn.textContent = 'Approving...';

                const result = await receiveTransfer(transferId, []);
                if (result.error) {
                    approveBtn.textContent = 'Approve Delivered';
                    approveBtn.disabled = false;
                    document.querySelector('#track-alert').innerHTML = `<div class="alert alert-danger">${result.error}</div>`;
                    return;
                }

                document.querySelector('#track-alert').innerHTML = `<div class="alert alert-success">Transfer marked as delivered.</div>`;
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
        }
    },
    render: async () => {
        try {
            const requestPath = window.location.hash.slice(1).toLowerCase();
            const transferId = requestPath.split('/').pop();
            const transfer = await getTransfer(transferId);

            if (transfer.error) {
                return `
                    <div class="wrap">
                        ${DashboardMenu.render({ selected: 'transfers' })}
                        <div class="main">
                            <div class="alert alert-danger">Error loading transfer: ${transfer.error}</div>
                        </div>
                    </div>
                `;
            }

            const fromParty = transfer.fromParty || {};
            const toParty = transfer.toParty || {};
            const fromPartyAddress = fromParty.address || transfer.fromLocation || 'Not set';
            const toPartyAddress = toParty.address || transfer.toLocation || 'Not set';
            const itemRows = transfer.items && transfer.items.length > 0
                ? transfer.items.map(item => `
                    <div class="transfer-item-row">
                      <div class="transfer-item-name">${item.name || 'Unnamed item'}</div>
                      <div class="transfer-item-quantity">${item.quantity}</div>
                      <div class="transfer-item-received">${item.receivedQuantity || 0}</div>
                    </div>
                `).join('')
                : '<div class="transfer-items-empty">No items found</div>';

            const actionButton = transfer.status !== 'received' && transfer.status !== 'cancelled'
                ? `<button id="approve-delivery-btn" data-transfer-id="${transfer._id}" class="btn-primary text-white">Approve Delivered</button>`
                : `<div class="badge-green text-white">${transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}</div>`;

            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: 'transfers' })}
                    <div class="main">
                        <section class="dashboard-hero">
                          <div class="dashboard-hero-copy">
                            <span class="dashboard-pill">Tracking</span>
                            <h1>Track transfer ${transfer.transferNumber}</h1>
                            <p>Monitor movement details, shipment progress, and confirm delivery when received.</p>
                            <div class="dashboard-hero-actions">
                              <a class="btn-outline-primary text-black" href="/#/transfers">Back to Transfers</a>
                            </div>
                          </div>
                          <div class="dashboard-hero-meta">
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">From</span>
                              <span class="dashboard-mini-stat-value">${fromParty.name || transfer.fromLocation}</span>
                            </div>
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">To</span>
                              <span class="dashboard-mini-stat-value">${toParty.name || transfer.toLocation}</span>
                            </div>
                          </div>
                        </section>

                        <div id="track-alert"></div>

                        <section class="new-transfer-layout">
                          <article class="panel new-transfer-main-panel">
                            <div class="card-title">Transfer movement</div>

                            <div class="new-transfer-section-header">
                              <div>
                                <div class="new-transfer-section-title">Status</div>
                                <div class="text-muted">Latest movement state</div>
                              </div>
                              ${actionButton}
                            </div>

                            <div class="new-transfer-form-grid">
                              <div>
                                <label class="form-label">Shipment date</label>
                                <input class="form-control" type="text" value="${transfer.shipmentDate ? new Date(transfer.shipmentDate).toLocaleDateString() : 'Not set'}" disabled>
                              </div>
                              <div>
                                <label class="form-label">Expected receipt</label>
                                <input class="form-control" type="text" value="${transfer.expectedReceiptDate ? new Date(transfer.expectedReceiptDate).toLocaleDateString() : 'Not set'}" disabled>
                              </div>
                              <div class="new-transfer-span-2">
                                <label class="form-label">Delivered on</label>
                                <input class="form-control" type="text" value="${transfer.actualReceiptDate ? new Date(transfer.actualReceiptDate).toLocaleDateString() : 'Not received'}" disabled>
                              </div>
                            </div>

                            <div class="new-transfer-section-header mt-3">
                              <div>
                                <div class="new-transfer-section-title">Source location</div>
                                <div class="text-muted">Origin address and contact</div>
                              </div>
                            </div>
                            <div class="party-card party-card-compact mb-3">
                              <div class="party-card-header party-card-header-strong">
                                <div>
                                  <div class="party-card-name">${fromParty.name || transfer.fromLocation}</div>
                                  <div class="party-card-subtitle">${fromParty.type ? fromParty.type.charAt(0).toUpperCase() + fromParty.type.slice(1) : 'Party'}</div>
                                </div>
                                ${fromParty._id ? `<a class="btn-primary text-white btn-sm" href="/#/party/${fromParty._id}">View</a>` : ''}
                              </div>
                            </div>

                            <div class="new-transfer-section-header mt-3">
                              <div>
                                <div class="new-transfer-section-title">Destination location</div>
                                <div class="text-muted">Destination address and contact</div>
                              </div>
                            </div>
                            <div class="party-card party-card-compact mb-3">
                              <div class="party-card-header party-card-header-strong">
                                <div>
                                  <div class="party-card-name">${toParty.name || transfer.toLocation}</div>
                                  <div class="party-card-subtitle">${toParty.type ? toParty.type.charAt(0).toUpperCase() + toParty.type.slice(1) : 'Party'}</div>
                                </div>
                                ${toParty._id ? `<a class="btn-primary text-white btn-sm" href="/#/party/${toParty._id}">View</a>` : ''}
                              </div>
                            </div>

                            <div class="new-transfer-section-header mt-3">
                              <div>
                                <div class="new-transfer-section-title">Items</div>
                                <div class="text-muted">Products and received quantities</div>
                              </div>
                            </div>

                            <div class="transfer-items-list">
                              <div class="transfer-items-header">
                                <div>Item</div>
                                <div>Quantity</div>
                                <div class="transfer-header-received">Received</div>
                              </div>
                              ${itemRows}
                            </div>

                            <div class="new-transfer-section-header mt-3">
                              <div>
                                <div class="new-transfer-section-title">Notes</div>
                                <div class="text-muted">Delivery and handling remarks</div>
                              </div>
                            </div>
                            <p>${transfer.notes || 'No notes available.'}</p>
                          </article>

                          <aside class="panel new-transfer-side-panel">
                            <div class="card-title">Transfer details</div>
                            <div class="new-transfer-summary-list">
                              <div class="new-transfer-summary-item">
                                <div class="new-transfer-summary-label">ID</div>
                                <strong>${transfer.transferNumber}</strong>
                              </div>
                              <div class="new-transfer-summary-item">
                                <div class="new-transfer-summary-label">Status</div>
                                <strong>${transfer.status}</strong>
                              </div>
                              <div class="new-transfer-summary-item">
                                <div class="new-transfer-summary-label">Created</div>
                                <strong>${new Date(transfer.createdAt).toLocaleDateString()}</strong>
                              </div>
                              <div class="new-transfer-summary-item">
                                <div class="new-transfer-summary-label">Units moved</div>
                                <strong>${transfer.unitsMoved || 0}</strong>
                              </div>
                              <div class="new-transfer-summary-item">
                                <div class="new-transfer-summary-label">Units received</div>
                                <strong>${transfer.unitsReceived || 0}</strong>
                              </div>
                            </div>
                          </aside>
                        </section>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering transfer tracking:', error);
            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: 'transfers' })}
                    <div class="main">
                        <div class="alert alert-danger">Error loading transfer tracking data</div>
                    </div>
                </div>
            `;
        }
    }
};

export default TrackTransfer;
