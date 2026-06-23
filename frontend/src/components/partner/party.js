import DashboardMenu from '../dashboard/dashboardMenu';
import ParseRequestUrl from '../../config/parseUrl';
import { getParty, updateParty, deleteParty } from '../../connection/api';
import { showLoading, hideLoading } from '../../utils';

// Calculate profile readiness based on completed fields
const calculateProfileReadiness = (partyData) => {
    let completedFields = 0;
    const totalFields = 8;
    
    // Required identity fields
    if (partyData.name && partyData.name.trim()) completedFields++;
    if (partyData.type) completedFields++;
    if (partyData.phone && partyData.phone.trim()) completedFields++;
    if (partyData.email && partyData.email.trim()) completedFields++;
    
    // Business profile fields
    if (partyData.address && partyData.address.trim()) completedFields++;
    if (partyData.paymentTerms && partyData.paymentTerms.trim()) completedFields++;
    
    // Optional but valuable fields
    if (partyData.notes && partyData.notes.trim()) completedFields++;
    if (partyData.contactPerson && partyData.contactPerson.trim()) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
};

const Party = {
    vignette: async () => {
        const request = ParseRequestUrl();
        const partyId = request.id || request.verb;
        
        // Handle edit button
        const editBtn = document.querySelector('#edit-party-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                toggleEditMode(partyId);
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
                toggleEditMode(partyId);
            });
        }

        // Handle delete button
        const deleteBtn = document.querySelector('#delete-party-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                handleDeleteParty(partyId);
            });
        }

        // Add listeners for profile readiness updates during edit
        const formInputs = ['#partyEmail', '#partyPhone', '#partyAddress', '#partyContactPerson', '#partyPaymentTerms', '#partyNotes'];
        formInputs.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener('input', updateProfileReadinessDisplay);
            }
        });
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

            const roleLabel = party.type === 'buyer' ? 'Buyer' : party.type === 'supplier' ? 'Supplier' : party.type === 'wholesale' ? 'Wholesale Buyer' : 'Buyer & Supplier';
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
                                            <input id="partyEmail" class="form-control" value="${party.email}" readonly data-editable="true">
                                        </div>
                                        <div>
                                            <label class="form-label">Phone</label>
                                            <input id="partyPhone" class="form-control" value="${party.phone}" readonly data-editable="true">
                                        </div>
                                        <div class="span-2">
                                            <label class="form-label">Address</label>
                                            <input id="partyAddress" class="form-control" value="${party.address || ''}" readonly data-editable="true">
                                        </div>
                                        <div>
                                            <label class="form-label">Contact Person</label>
                                            <input id="partyContactPerson" class="form-control" value="${party.contactPerson || ''}" readonly data-editable="true">
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
                                            <input id="partyPaymentTerms" class="form-control" value="${party.paymentTerms || 'Not specified'}" readonly data-editable="true">
                                        </div>
                                        <div>
                                            <label class="form-label">Credit Limit</label>
                                            <input id="partyCreditLimit" class="form-control" value="Ksh ${party.creditLimit.toLocaleString()}" readonly>
                                        </div>
                                        <div>
                                            <label class="form-label">Current Balance</label>
                                            <input id="partyCurrentBalance" class="form-control" value="Ksh ${party.currentBalance.toLocaleString()}" readonly>
                                        </div>
                                        <div>
                                            <label class="form-label" style="display: flex; align-items: center;">
                                                <input id="partyWholesales" type="checkbox" ${party.wholesales ? 'checked' : ''} readonly data-editable="true" style="margin-right: 8px; width: auto; cursor: pointer;">
                                                Wholesaler
                                            </label>
                                            <div class="text-muted" style="font-size: 0.875rem; margin-top: 4px;">Indicates wholesale operations</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="party-detail-section">
                                    <div class="party-detail-section-header">
                                        <h3>Notes</h3>
                                    </div>
                                    <div>
                                        <textarea id="partyNotes" class="form-control" rows="4" readonly data-editable="true">${party.notes || 'No notes'}</textarea>
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

                                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                                    <div class="party-detail-helper-title" style="margin-bottom: 1rem;">Profile Readiness Factors</div>
                                    <div style="font-size: 0.875rem; line-height: 1.6;">
                                        <div style="margin-bottom: 0.75rem;">
                                            <strong style="color: ${party.email && party.email.trim() ? '#10b981' : '#ef4444'};">✓</strong>
                                            <span style="color: ${party.email && party.email.trim() ? '#10b981' : '#6b7280'};">Email address</span>
                                        </div>
                                        <div style="margin-bottom: 0.75rem;">
                                            <strong style="color: ${party.phone && party.phone.trim() ? '#10b981' : '#ef4444'};">✓</strong>
                                            <span style="color: ${party.phone && party.phone.trim() ? '#10b981' : '#6b7280'};">Phone number</span>
                                        </div>
                                        <div style="margin-bottom: 0.75rem;">
                                            <strong style="color: ${party.address && party.address.trim() ? '#10b981' : '#ef4444'};">✓</strong>
                                            <span style="color: ${party.address && party.address.trim() ? '#10b981' : '#6b7280'};">Address</span>
                                        </div>
                                        <div style="margin-bottom: 0.75rem;">
                                            <strong style="color: ${party.contactPerson && party.contactPerson.trim() ? '#10b981' : '#ef4444'};">✓</strong>
                                            <span style="color: ${party.contactPerson && party.contactPerson.trim() ? '#10b981' : '#6b7280'};">Contact person</span>
                                        </div>
                                        <div style="margin-bottom: 0.75rem;">
                                            <strong style="color: ${party.paymentTerms && party.paymentTerms.trim() ? '#10b981' : '#ef4444'};">✓</strong>
                                            <span style="color: ${party.paymentTerms && party.paymentTerms.trim() ? '#10b981' : '#6b7280'};">Payment terms</span>
                                        </div>
                                        <div style="margin-bottom: 0.75rem;">
                                            <strong style="color: ${party.notes && party.notes.trim() ? '#10b981' : '#ef4444'};">✓</strong>
                                            <span style="color: ${party.notes && party.notes.trim() ? '#10b981' : '#6b7280'};">Notes/Comments</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="party-detail-helper-card" style="margin-top: 1.5rem;">
                                    <div class="party-detail-helper-title">Tip</div>
                                    <p class="text-muted">Edit party details, monitor balance changes, and track communication history from this dashboard. Complete all fields to increase profile readiness.</p>
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
    const editableInputs = document.querySelectorAll('[data-editable="true"]');
    const editBtn = document.querySelector('#edit-party-btn');
    const editSection = document.querySelector('#edit-section');
    const deleteBtn = document.querySelector('#delete-party-btn');

    editableInputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.disabled = !input.disabled;
        } else {
            input.readOnly = !input.readOnly;
        }
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

const updateProfileReadinessDisplay = () => {
    const partyData = {
        name: document.querySelector('#partyEmail') ? 'exists' : '', // We'll check all fields
        email: document.querySelector('#partyEmail')?.value.trim() || '',
        phone: document.querySelector('#partyPhone')?.value.trim() || '',
        address: document.querySelector('#partyAddress')?.value.trim() || '',
        paymentTerms: document.querySelector('#partyPaymentTerms')?.value.trim() || '',
        notes: document.querySelector('#partyNotes')?.value.trim() || '',
        contactPerson: document.querySelector('#partyContactPerson')?.value.trim() || ''
    };

    // Recalculate readiness
    const readiness = calculateProfileReadiness(partyData);
    
    // Update all profile readiness displays
    const displays = document.querySelectorAll('[data-profile-readiness]');
    displays.forEach(display => {
        display.textContent = readiness + '%';
    });

    // Also update in the quick stats if it has a different selector
    const quickStatValue = document.querySelector('.party-detail-stat:nth-child(2) .party-detail-stat-value');
    if (quickStatValue) {
        quickStatValue.textContent = readiness + '%';
    }

    // Update hero section readiness value
    const heroReadiness = document.querySelector('.dashboard-hero-meta .dashboard-mini-stat:nth-child(4) .dashboard-mini-stat-value');
    if (heroReadiness) {
        heroReadiness.textContent = readiness + '%';
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
            contactPerson: document.querySelector('#partyContactPerson')?.value.trim() || undefined,
            paymentTerms: document.querySelector('#partyPaymentTerms').value.trim(),
            wholesales: document.querySelector('#partyWholesales').checked,
            notes: document.querySelector('#partyNotes').value.trim()
        };

        const result = await updateParty(partyId, partyData);

        if (result.error) {
            showAlert(alertContainer, 'error', result.error);
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
            return;
        }

        // Reload party to get updated profileReadiness from backend
        showLoading();
        const updatedParty = await getParty(partyId);
        hideLoading();

        if (!updatedParty.error && updatedParty && updatedParty.profileReadiness !== undefined) {
            // Update the readiness display with new value from backend
            const quickStatValue = document.querySelector('.party-detail-stat:nth-child(2) .party-detail-stat-value');
            if (quickStatValue) {
                quickStatValue.textContent = (updatedParty.profileReadiness || 0) + '%';
            }

            const heroReadiness = document.querySelector('.dashboard-hero-meta .dashboard-mini-stat:nth-child(4) .dashboard-mini-stat-value');
            if (heroReadiness) {
                heroReadiness.textContent = (updatedParty.profileReadiness || 0) + '%';
            }

            // Update the profile readiness factors display
            const contactDetailsSection = document.querySelector('.party-detail-side-panel');
            if (contactDetailsSection) {
                const emailCheck = contactDetailsSection.querySelector('[data-check="email"]');
                if (emailCheck) {
                    emailCheck.style.color = updatedParty.email && updatedParty.email.trim() ? '#10b981' : '#ef4444';
                    emailCheck.parentElement.style.color = updatedParty.email && updatedParty.email.trim() ? '#10b981' : '#6b7280';
                }
            }
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
            window.location.hash = '/parties';
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
