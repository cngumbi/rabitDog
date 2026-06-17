import DashboardMenu from '../dashboard/dashboardMenu';
import { createParty, getPartySummaryStats } from '../../connection/api';

// Calculate profile readiness based on completed fields
const calculateProfileReadiness = () => {
    const partyName = document.querySelector('#partyName')?.value.trim() || '';
    const partyType = document.querySelector('#partyType')?.value || '';
    const partyPhone = document.querySelector('#partyPhone')?.value.trim() || '';
    const partyEmail = document.querySelector('#partyEmail')?.value.trim() || '';
    const partyAddress = document.querySelector('#partyAddress')?.value.trim() || '';
    const partyPaymentTerms = document.querySelector('#partyPaymentTerms')?.value || '';
    const partyNotes = document.querySelector('#partyNotes')?.value.trim() || '';

    let completedFields = 0;
    const totalFields = 8;
    
    if (partyName) completedFields++;
    if (partyType) completedFields++;
    if (partyPhone) completedFields++;
    if (partyEmail) completedFields++;
    if (partyAddress) completedFields++;
    if (partyPaymentTerms) completedFields++;
    if (partyNotes) completedFields++;
    // 8th field is contact person (optional, counted if name exists)
    if (partyName) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
};

// Update the submission checklist status
const updateChecklistStatus = () => {
    const partyName = document.querySelector('#partyName')?.value.trim() || '';
    const partyType = document.querySelector('#partyType')?.value || '';
    const partyPhone = document.querySelector('#partyPhone')?.value.trim() || '';
    const partyEmail = document.querySelector('#partyEmail')?.value.trim() || '';
    const partyAddress = document.querySelector('#partyAddress')?.value.trim() || '';
    const partyPaymentTerms = document.querySelector('#partyPaymentTerms')?.value || '';
    const partyNotes = document.querySelector('#partyNotes')?.value.trim() || '';

    // Party identity: name, type, phone, email
    const identityComplete = partyName && partyType && partyPhone && partyEmail;
    
    // Business profile: address and payment terms
    const profileComplete = partyAddress && partyPaymentTerms;
    
    // Relationship notes: any notes
    const notesComplete = partyNotes.length > 0;

    // Update checklist items
    updateChecklistItem(0, identityComplete);
    updateChecklistItem(1, profileComplete);
    updateChecklistItem(2, notesComplete);

    // Update profile readiness display
    updateProfileReadinessDisplay();
};

// Update individual checklist item
const updateChecklistItem = (index, isComplete) => {
    const items = document.querySelectorAll('.add-party-check-item');
    if (items[index]) {
        const dot = items[index].querySelector('.add-party-check-dot');
        if (isComplete) {
            dot.textContent = '✓';
            dot.style.color = '#10b981';
            items[index].style.opacity = '1';
        } else {
            dot.textContent = '○';
            dot.style.color = '#d1d5db';
            items[index].style.opacity = '0.6';
        }
    }
};

// Update profile readiness display
const updateProfileReadinessDisplay = () => {
    const readiness = calculateProfileReadiness();
    const readinessValue = document.querySelector('[data-readiness-value]');
    if (readinessValue) {
        readinessValue.textContent = readiness + '%';
    }
};

const AddParties = {
    vignette: async ()=> {
        // Load stats
        await loadStats();

        // Handle form submission
        const saveBtn = document.querySelector('#save-party-btn');
        const saveDraftBtn = document.querySelector('#save-draft-btn');
        const cancelBtn = document.querySelector('#cancel-party-btn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleSaveParty(true);
            });
        }

        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleSaveParty(false);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Discard changes and go back?')) {
                    window.location.hash = '/parties';
                }
            });
        }

        // Add listeners to form inputs for real-time checklist and readiness updates
        const formInputs = [
            '#partyName',
            '#partyType',
            '#partyPhone',
            '#partyEmail',
            '#partyAddress',
            '#partyPaymentTerms',
            '#partyNotes'
        ];

        formInputs.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener('input', updateChecklistStatus);
                element.addEventListener('change', updateChecklistStatus);
            }
        });

        // Initial checklist update
        updateChecklistStatus();
    },
    render: ()=>{
       return `
        <div class="wrap">
            ${DashboardMenu.render({ selected: "parties" })}
            <div class="main">
                <section class="dashboard-hero">
                  <div class="dashboard-hero-copy">
                    <span class="dashboard-pill">New party</span>
                    <h1>Create partner record</h1>
                    <p>Add a buyer, supplier, or strategic partner with contact, accounting, and relationship metadata in one guided form.</p>
                    <div class="dashboard-hero-actions">
                      <a class="btn-primary text-white" href="/#/parties">Back to Parties</a>
                    </div>
                  </div>
                  <div class="dashboard-hero-meta">
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">New entries</span>
                      <span class="dashboard-mini-stat-value" data-new-entries-value>--</span>
                      <span class="dashboard-mini-stat-trend">This month</span>
                    </div>
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Profile readiness</span>
                      <span class="dashboard-mini-stat-value" data-readiness-value>0%</span>
                      <span class="dashboard-mini-stat-trend">Complete fields</span>
                    </div>
                  </div>
                </section>

                <div id="alert-container"></div>

                <section class="add-party-layout">
                  <article class="panel add-party-main-panel">
                    <div class="card-title">Party details</div>
                    <div class="add-party-section-header">
                      <div>
                        <div class="add-party-section-title">Identity</div>
                        <div class="text-muted">Basic profile and classification</div>
                      </div>
                      <span class="badge-primary text-white">Required</span>
                    </div>

                    <div class="add-party-form-grid">
                      <div>
                        <label class="form-label">Party Name</label>
                        <input id="partyName" class="form-control" placeholder="Enter party name" required>
                      </div>
                      <div>
                        <label class="form-label">Party Type</label>
                        <select id="partyType" class="form-select" required>
                          <option value="">Select type</option>
                          <option value="buyer">Buyer</option>
                          <option value="supplier">Supplier</option>
                          <option value="both">Buyer & Supplier</option>
                        </select>
                      </div>
                      <div>
                        <label class="form-label">Phone</label>
                        <input id="partyPhone" class="form-control" placeholder="Phone number" type="tel" required>
                      </div>
                      <div>
                        <label class="form-label">Email</label>
                        <input id="partyEmail" class="form-control" placeholder="Email address" type="email" required>
                      </div>
                    </div>

                    <div class="add-party-info-box">
                      <span class="add-party-info-icon">ℹ️</span>
                      <div>
                        <div class="add-party-info-title">Supplier Approval Workflow</div>
                        <p class="text-muted">Buyers are saved directly and become active immediately. Suppliers will appear in the <strong>Pending Supplier Reviews</strong> section on the Parties page for admin approval before they become active in the system.</p>
                      </div>
                    </div>

                    <div class="add-party-section-header mt-3">
                      <div>
                        <div class="add-party-section-title">Business details</div>
                        <div class="text-muted">Address, balance, and contact notes</div>
                      </div>
                    </div>

                    <div class="add-party-form-grid">
                      <div class="add-party-span-2">
                        <label class="form-label">Address</label>
                        <input id="partyAddress" class="form-control" placeholder="Street or location">
                      </div>
                      <div>
                        <label class="form-label">Opening Balance</label>
                        <input id="partyOpeningBalance" class="form-control" placeholder="Ksh amount" type="number" min="0">
                      </div>
                      <div>
                        <label class="form-label">Payment Terms</label>
                        <select id="partyPaymentTerms" class="form-select">
                          <option value="">Select payment terms</option>
                          <option value="Cash on delivery">Cash on delivery</option>
                          <option value="7 days">7 days</option>
                          <option value="14 days">14 days</option>
                          <option value="30 days">30 days</option>
                        </select>
                      </div>
                    </div>

                    <div class="add-party-section-header mt-3">
                      <div>
                        <div class="add-party-section-title">Notes</div>
                        <div class="text-muted">Optional internal context for the sales team</div>
                      </div>
                    </div>

                    <div>
                      <label class="form-label">Internal notes</label>
                      <textarea id="partyNotes" class="form-control" rows="5" placeholder="Add delivery preferences, credit notes, or relationship reminders"></textarea>
                    </div>

                    <div class="add-party-action-row">
                      <button id="save-party-btn" class="btn-primary text-white">Save Party</button>
                      <button id="save-draft-btn" class="btn-outline-primary text-primary">Save Draft</button>
                      <button id="cancel-party-btn" class="btn-red text-white">Cancel</button>
                    </div>
                  </article>

                  <aside class="panel add-party-side-panel">
                    <div class="card-title">Submission checklist</div>
                    <div class="add-party-checklist">
                      <div class="add-party-check-item" style="opacity: 0.6;">
                        <span class="add-party-check-dot" style="color: #d1d5db;">○</span>
                        <div>
                          <div class="add-party-check-title">Party identity</div>
                          <div class="text-muted">Name, type, and contact details entered</div>
                        </div>
                      </div>
                      <div class="add-party-check-item" style="opacity: 0.6;">
                        <span class="add-party-check-dot" style="color: #d1d5db;">○</span>
                        <div>
                          <div class="add-party-check-title">Business profile</div>
                          <div class="text-muted">Address and preferred payment terms assigned</div>
                        </div>
                      </div>
                      <div class="add-party-check-item" style="opacity: 0.6;">
                        <span class="add-party-check-dot" style="color: #d1d5db;">○</span>
                        <div>
                          <div class="add-party-check-title">Relationship notes</div>
                          <div class="text-muted">Any contract or follow-up notes added</div>
                        </div>
                      </div>
                    </div>

                    <div class="add-party-helper-card">
                      <div class="add-party-helper-title">Tip</div>
                      <p class="text-muted">Buyers are automatically activated and available immediately. Suppliers require admin approval and will appear in the pending reviews section until approved or rejected.</p>
                    </div>
                  </aside>
                </section>

            </div>
        </div>
        `
    }
};

// Load statistics
const loadStats = async () => {
    try {
        const stats = await getPartySummaryStats();
        if (stats && !stats.error) {
            const newEntriesDisplay = document.querySelector('[data-new-entries-value]');
            if (newEntriesDisplay) {
                newEntriesDisplay.textContent = stats.newThisMonth;
            }
        }
    } catch (error) {
        console.error('Failed to load party stats:', error);
    }
};

const handleSaveParty = async (isPublished = true) => {
    const alertContainer = document.querySelector('#alert-container');
    
    // Get form values
    const partyName = document.querySelector('#partyName').value.trim();
    const partyType = document.querySelector('#partyType').value;
    const partyPhone = document.querySelector('#partyPhone').value.trim();
    const partyEmail = document.querySelector('#partyEmail').value.trim();
    const partyAddress = document.querySelector('#partyAddress').value.trim();
    const partyOpeningBalance = document.querySelector('#partyOpeningBalance').value;
    const partyPaymentTerms = document.querySelector('#partyPaymentTerms').value;
    const partyNotes = document.querySelector('#partyNotes').value.trim();

    // Validate required fields
    const errors = [];
    if (!partyName) errors.push('Party name is required');
    if (!partyType) errors.push('Party type is required');
    if (!partyPhone) errors.push('Phone number is required');
    if (!partyEmail) errors.push('Email address is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partyEmail)) errors.push('Invalid email address');

    if (errors.length > 0) {
        showAlert(alertContainer, 'error', errors.join('<br>'));
        return;
    }

    // Show loading state
    const saveBtn = document.querySelector('#save-party-btn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = isPublished ? 'Saving...' : 'Saving Draft...';

    try {
        const partyData = {
            name: partyName,
            type: partyType,
            phone: partyPhone,
            email: partyEmail,
            address: partyAddress || undefined,
            paymentTerms: partyPaymentTerms || undefined,
            notes: partyNotes || undefined,
            currentBalance: partyOpeningBalance ? parseFloat(partyOpeningBalance) : 0,
            // Buyers are saved directly as active
            // Suppliers and Buyer & Supplier require admin approval - set to inactive
            status: (partyType === 'supplier' || partyType === 'both') ? 'inactive' : 'active',
            // Mark if this is a supplier that needs explicit review
            requiresApproval: partyType === 'supplier' || partyType === 'both'
        };

        const result = await createParty(partyData);

        if (result.error) {
            showAlert(alertContainer, 'error', result.error);
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
            return;
        }

        // Success
        const successMessage = (partyType === 'supplier' || partyType === 'both')
            ? (isPublished 
                ? 'Supplier added successfully! It will appear in pending reviews for approval.'
                : 'Supplier draft saved successfully! An admin will review and approve it.')
            : (isPublished
                ? 'Buyer added successfully and is now active!'
                : 'Buyer saved successfully and is now active!');
        showAlert(alertContainer, 'success', successMessage);
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.hash = '/parties';
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

export default AddParties;