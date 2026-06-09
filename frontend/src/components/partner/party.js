import DashboardMenu from '../dashboard/dashboardMenu';
import ParseRequestUrl from '../../config/parseUrl';
import { getParty, updateParty, deleteParty } from '../../connection/api';
import { showLoading, hideLoading } from '../../utils';

const Party = {
    vignette: async () => {
        const request = ParseRequestUrl();
        const partyId = request.id || request.verb;
        
        // Handle edit button
        const editBtn = document.querySelector('#edit-party-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                toggleEditMode();
            });
        }

        // Handle save button
        const saveBtn = document.querySelector('#save-party-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                handleSaveParty(partyId);
            });
        }

        // Handle cancel button
        const cancelBtn = document.querySelector('#cancel-party-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                toggleEditMode();
            });
        }

        // Handle delete button
        const deleteBtn = document.querySelector('#delete-party-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                handleDeleteParty(partyId);
            });
        }
    },

    render: async () => {
        try {
            const request = ParseRequestUrl();
            const partyId = request.id || request.verb;
            
            showLoading();
            const party = await getParty(partyId);
            hideLoading();

            if (party.error) {
                return `
                    <div class="wrap">
                        ${DashboardMenu.render({ selected: "parties" })}
                        <div class="main">
                            <div class="alert alert-danger">Error loading party: ${party.error}</div>
                            <a class="btn-primary text-white" href="/#/parties">Back to Parties</a>
                        </div>
                    </div>
                `;
            }

            const roleLabel = party.type === 'buyer' ? 'Buyer' : party.type === 'supplier' ? 'Supplier' : 'Buyer & Supplier';
            const statusClass = party.status === 'active' ? 'badge-green' : party.status === 'inactive' ? 'badge-yellow' : 'badge-red';
            const initials = party.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "parties" })}
                    <div class="main">
                        <div id="alert-container"></div>

                        <section class="dashboard-hero party-profile-hero">
                            <div class="dashboard-hero-copy">
                                <span class="dashboard-pill">Party profile</span>
                                <h1>${party.name}</h1>
                                <p>Manage this partner's account, contact details, balance, and relationship notes in one place.</p>
                                <div class="dashboard-hero-actions">
                                    <a class="btn-primary text-white" href="/#/parties">Back to Parties</a>
                                    <button id="edit-party-btn" class="btn-secondary text-white">Edit profile</button>
                                    <button id="delete-party-btn" class="btn-red text-white">Delete</button>
                                </div>
                            </div>
                            <div class="dashboard-hero-meta party-profile-meta">
                                <div class="dashboard-mini-stat">
                                    <span class="dashboard-mini-stat-label">Status</span>
                                    <span class="dashboard-mini-stat-value">${party.status.charAt(0).toUpperCase() + party.status.slice(1)}</span>
                                </div>
                                <div class="dashboard-mini-stat">
                                    <span class="dashboard-mini-stat-label">Type</span>
                                    <span class="dashboard-mini-stat-value">${roleLabel}</span>
                                </div>
                                <div class="dashboard-mini-stat">
                                    <span class="dashboard-mini-stat-label">Balance</span>
                                    <span class="dashboard-mini-stat-value">Ksh ${party.currentBalance.toLocaleString()}</span>
                                </div>
                                <div class="dashboard-mini-stat">
                                    <span class="dashboard-mini-stat-label">Profile readiness</span>
                                    <span class="dashboard-mini-stat-value">${party.profileReadiness || 0}%</span>
                                </div>
                            </div>
                        </section>

                        <section class="dashboard-kpi-grid party-overview-grid">
                            <article class="card-metric">
                                <div class="metric-title">Contact number</div>
                                <div class="metric-value">${party.phone || 'Not set'}</div>
                                <div class="metric-desc metric-desc--info">Primary contact</div>
                            </article>
                            <article class="card-metric">
                                <div class="metric-title">Email address</div>
                                <div class="metric-value">${party.email || 'Not set'}</div>
                                <div class="metric-desc metric-desc--info">Partner communication</div>
                            </article>
                            <article class="card-metric">
                                <div class="metric-title">Credit limit</div>
                                <div class="metric-value">Ksh ${party.creditLimit.toLocaleString()}</div>
                                <div class="metric-desc metric-desc--success">Available credit</div>
                            </article>
                            <article class="card-metric">
                                <div class="metric-title">Payment terms</div>
                                <div class="metric-value">${party.paymentTerms || 'Unassigned'}</div>
                                <div class="metric-desc metric-desc--info">Terms in use</div>
                            </article>
                        </section>

                        <section class="party-detail-layout">
                            <article class="panel party-detail-main-panel">
                                <div class="card-title">Party Information</div>
                                
                                <div class="party-detail-section">
                                    <div class="party-detail-section-header">
                                        <h3>Contact Details</h3>
                                    </div>
                                    <div class="party-detail-grid">
                                        <div>
                                            <label class="form-label">Email</label>
                                            <input id="partyEmail" class="form-control" value="${party.email}" readonly>
                                        </div>
                                        <div>
                                            <label class="form-label">Phone</label>
                                            <input id="partyPhone" class="form-control" value="${party.phone}" readonly>
                                        </div>
                                        <div class="span-2">
                                            <label class="form-label">Address</label>
                                            <input id="partyAddress" class="form-control" value="${party.address || ''}" readonly>
                                        </div>
                                    </div>
                                </div>

                                <div class="party-detail-section">
                                    <div class="party-detail-section-header">
                                        <h3>Business Information</h3>
                                    </div>
                                    <div class="party-detail-grid">
                                        <div>
                                            <label class="form-label">Party Type</label>
                                            <input id="partyType" class="form-control" value="${roleLabel}" readonly>
                                        </div>
                                        <div>
                                            <label class="form-label">Payment Terms</label>
                                            <input id="partyPaymentTerms" class="form-control" value="${party.paymentTerms || 'Not specified'}" readonly>
                                        </div>
                                        <div>
                                            <label class="form-label">Credit Limit</label>
                                            <input id="partyCreditLimit" class="form-control" value="Ksh ${party.creditLimit.toLocaleString()}" readonly>
                                        </div>
                                        <div>
                                            <label class="form-label">Current Balance</label>
                                            <input id="partyCurrentBalance" class="form-control" value="Ksh ${party.currentBalance.toLocaleString()}" readonly>
                                        </div>
                                    </div>
                                </div>

                                <div class="party-detail-section">
                                    <div class="party-detail-section-header">
                                        <h3>Notes</h3>
                                    </div>
                                    <div>
                                        <textarea id="partyNotes" class="form-control" rows="4" readonly>${party.notes || 'No notes'}</textarea>
                                    </div>
                                </div>

                                <div id="edit-section" style="display: none;" class="party-detail-section">
                                    <div class="party-detail-action-row">
                                        <button id="save-party-btn" class="btn-primary text-white">Save Changes</button>
                                        <button id="cancel-party-btn" class="btn-outline-primary text-primary">Cancel</button>
                                    </div>
                                </div>
                            </article>

                            <aside class="panel party-detail-side-panel">
                                <div class="card-title">Quick Stats</div>
                                <div class="party-detail-stat">
                                    <div class="party-detail-stat-label">Account Status</div>
                                    <div class="party-detail-stat-value">${party.status.charAt(0).toUpperCase() + party.status.slice(1)}</div>
                                </div>
                                <div class="party-detail-stat">
                                    <div class="party-detail-stat-label">Profile Readiness</div>
                                    <div class="party-detail-stat-value">${party.profileReadiness || 0}%</div>
                                </div>
                                <div class="party-detail-stat">
                                    <div class="party-detail-stat-label">Member Since</div>
                                    <div class="party-detail-stat-value">${new Date(party.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div class="party-detail-stat">
                                    <div class="party-detail-stat-label">Last Updated</div>
                                    <div class="party-detail-stat-value">${new Date(party.updatedAt).toLocaleDateString()}</div>
                                </div>

                                <div class="party-detail-helper-card">
                                    <div class="party-detail-helper-title">Tip</div>
                                    <p class="text-muted">Edit party details, monitor balance changes, and track communication history from this dashboard.</p>
                                </div>
                            </aside>
                        </section>
                    </div>
                </div>
            `;
        } catch (error) {
            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "parties" })}
                    <div class="main">
                        <div class="alert alert-danger">Error: ${error.message}</div>
                        <a class="btn-primary text-white" href="/#/parties">Back to Parties</a>
                    </div>
                </div>
            `;
        }
    }
};

const toggleEditMode = () => {
    const inputs = document.querySelectorAll('.party-detail-main-panel input, .party-detail-main-panel textarea');
    const editBtn = document.querySelector('#edit-party-btn');
    const editSection = document.querySelector('#edit-section');
    const deleteBtn = document.querySelector('#delete-party-btn');

    inputs.forEach(input => {
        input.readOnly = !input.readOnly;
    });

    if (editSection.style.display === 'none') {
        editSection.style.display = 'block';
        editBtn.textContent = 'Editing...';
        editBtn.disabled = true;
        deleteBtn.disabled = true;
    } else {
        editSection.style.display = 'none';
        editBtn.textContent = 'Edit';
        editBtn.disabled = false;
        deleteBtn.disabled = false;
    }
};

const handleSaveParty = async (partyId) => {
    const alertContainer = document.querySelector('#alert-container');
    const saveBtn = document.querySelector('#save-party-btn');
    const originalText = saveBtn.textContent;

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        // Get updated values
        const partyData = {
            email: document.querySelector('#partyEmail').value.trim(),
            phone: document.querySelector('#partyPhone').value.trim(),
            address: document.querySelector('#partyAddress').value.trim(),
            paymentTerms: document.querySelector('#partyPaymentTerms').value.trim(),
            notes: document.querySelector('#partyNotes').value.trim()
        };

        const result = await updateParty(partyId, partyData);

        if (result.error) {
            showAlert(alertContainer, 'error', result.error);
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
            return;
        }

        showAlert(alertContainer, 'success', 'Party updated successfully!');
        toggleEditMode();
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;

    } catch (error) {
        showAlert(alertContainer, 'error', 'An unexpected error occurred: ' + error.message);
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
};

const handleDeleteParty = async (partyId) => {
    if (!confirm('Are you sure you want to delete this party? This action cannot be undone.')) {
        return;
    }

    const alertContainer = document.querySelector('#alert-container');

    try {
        const result = await deleteParty(partyId);

        if (result.error) {
            showAlert(alertContainer, 'error', result.error);
            return;
        }

        showAlert(alertContainer, 'success', 'Party deleted successfully! Redirecting...');
        
        setTimeout(() => {
            window.location.hash = '/#/parties';
        }, 2000);

    } catch (error) {
        showAlert(alertContainer, 'error', 'An unexpected error occurred: ' + error.message);
    }
};

const showAlert = (container, type, message) => {
    const alertClass = type === 'error' ? 'alert alert-danger' : 'alert alert-success';
    container.innerHTML = `<div class="${alertClass}" role="alert">${message}</div>`;
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default Party;
