import DashboardMenu from '../dashboard/dashboardMenu';
import { getPartyStats, getParties, updateParty } from '../../connection/api';

const Parties = {
    vignette: ()=> {
        // Initialize pagination state
        let currentPage = 1;
        let filteredData = window.partiesData || [];
        let selectedChannel = null;
        const itemsPerPage = 5;

        // Handle search
        const searchInput = document.querySelector('#parties-search-input');
        const typeFilter = document.querySelector('#parties-type-filter');
        const searchBtn = document.querySelector('#search-btn');
        const channelButtons = document.querySelectorAll('.top-partner-channel');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentPage = 1;
                filterAndSearch();
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                currentPage = 1;
                filterAndSearch();
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                currentPage = 1;
                filterAndSearch();
            });
        }

        // Handle channel button clicks
        channelButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const channel = btn.textContent.trim().toLowerCase();
                
                // Toggle channel selection
                if (selectedChannel === channel) {
                    selectedChannel = null;
                    btn.classList.remove('active');
                } else {
                    // Remove active class from all buttons
                    channelButtons.forEach(b => b.classList.remove('active'));
                    selectedChannel = channel;
                    btn.classList.add('active');
                }
                
                currentPage = 1;
                filterAndSearch();
                updateChannelStats();
            });
        });

        const filterAndSearch = () => {
            const searchTerm = searchInput?.value.toLowerCase() || '';
            const typeValue = typeFilter?.value || 'all';

            filteredData = window.partiesData.filter(party => {
                // Don't show suspended (rejected) parties in the main table
                if (party.status === 'suspended') return false;

                const matchesSearch = !searchTerm || 
                    party.name.toLowerCase().includes(searchTerm) ||
                    party.phone?.toLowerCase().includes(searchTerm) ||
                    party.email?.toLowerCase().includes(searchTerm);

                const matchesType = typeValue === 'all' || party.type === typeValue;

                // Filter by channel if selected
                let matchesChannel = true;
                if (selectedChannel) {
                    if (selectedChannel === 'wholesale') {
                        // Wholesale channel is a boolean flag on the party
                        matchesChannel = !!party.wholesales;
                    } else {
                        const partyChannel = party.businessType?.toLowerCase() || 
                                            (party.type === 'supplier' ? 'supplier' : 'retail');
                        matchesChannel = partyChannel === selectedChannel;
                    }
                }

                return matchesSearch && matchesType && matchesChannel;
            });

            updateTable();
            updateChannelStats();
        };

        // Update channel stats based on filtered data
        const updateChannelStats = () => {
            const totalPartiesElem = document.querySelector('[data-stat="total-parties"]');
            const activeContractsElem = document.querySelector('[data-stat="active-contracts"]');
            const outstandingBalanceElem = document.querySelector('[data-stat="outstanding-balance"]');
            const contactsReachedElem = document.querySelector('[data-stat="contacts-reached"]');
            
            if (totalPartiesElem) {
                totalPartiesElem.textContent = filteredData.length;
            }
            if (activeContractsElem) {
                activeContractsElem.textContent = filteredData.filter(p => p.status === 'active').length;
            }
            if (outstandingBalanceElem) {
                const totalBalance = filteredData.reduce((sum, p) => sum + (p.currentBalance || 0), 0);
                outstandingBalanceElem.textContent = `Ksh ${totalBalance.toLocaleString()}`;
            }
            if (contactsReachedElem) {
                // Calculate contacts reached percentage (parties with phone or email)
                const totalParties = filteredData.length;
                if (totalParties > 0) {
                    const partiesWithContact = filteredData.filter(p => p.phone || p.email).length;
                    const contactPercentage = Math.round((partiesWithContact / totalParties) * 100);
                    contactsReachedElem.textContent = `${contactPercentage}%`;
                } else {
                    contactsReachedElem.textContent = '0%';
                }
            }
        };

        // Attach pagination event listeners
        const setupPagination = () => {
            const prevBtn = document.querySelector('#pagination-prev');
            const nextBtn = document.querySelector('#pagination-next');
            const pageButtons = document.querySelectorAll('.pagination-page-btn');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        updateTable();
                    }
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
                    if (currentPage < totalPages) {
                        currentPage++;
                        updateTable();
                    }
                });
            }

            pageButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    currentPage = parseInt(btn.dataset.page);
                    updateTable();
                });
            });
        };

        const updateTable = () => {
            const tableBody = document.querySelector('#parties-table-body');
            
            if (!tableBody) return;

            const startIdx = (currentPage - 1) * itemsPerPage;
            const endIdx = startIdx + itemsPerPage;
            const pageData = filteredData.slice(startIdx, endIdx);
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);

            // Update table rows
            tableBody.innerHTML = pageData.map(party => {
                const roleLabel = party.type === 'buyer' ? 'Buyer' : party.type === 'supplier' ? 'Supplier' : 'Buyer & Supplier';
                const statusClass = party.status === 'active' ? 'badge-success' : party.status === 'inactive' ? 'badge-warning' : 'badge-danger';
                
                return `
                    <tr>
                        <td>${party.name}</td>
                        <td>${roleLabel}</td>
                        <td>${party.phone || '-'}</td>
                        <td>${party.email || '-'}</td>
                        <td><span class="badge ${statusClass}">${party.status.charAt(0).toUpperCase() + party.status.slice(1)}</span></td>
                        <td>Ksh ${party.currentBalance.toLocaleString()}</td>
                        <td><a href="#/party/${party._id}" class="action-link">Edit</a></td>
                    </tr>
                `;
            }).join('');

            // Update pagination info
            const paginationInfo = document.querySelector('#pagination-info');
            if (paginationInfo) {
                const totalCount = filteredData.length;
                paginationInfo.textContent = `${totalCount} result${totalCount !== 1 ? 's' : ''}`;
            }

            // Update pagination buttons
            const prevBtn = document.querySelector('#pagination-prev');
            const nextBtn = document.querySelector('#pagination-next');
            if (prevBtn) prevBtn.disabled = currentPage === 1;
            if (nextBtn) nextBtn.disabled = currentPage === totalPages;

            // Update page number buttons
            const pageButtons = document.querySelectorAll('.pagination-page-btn');
            pageButtons.forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.page) === currentPage);
            });
        };

        // Handle approve button clicks
        const handleApproveSupplier = async (supplierId) => {
            try {
                const result = await updateParty(supplierId, { status: 'active' });
                if (result.error) {
                    alert('Failed to approve supplier: ' + result.error);
                    return;
                }
                // Reload parties data
                const parties = await getParties();
                window.partiesData = parties;
                updatePendingReviews();
                filterAndSearch();
            } catch (error) {
                console.error('Error approving supplier:', error);
                alert('Failed to approve supplier');
            }
        };

        // Handle reject button clicks
        const handleRejectSupplier = async (supplierId) => {
            try {
                const result = await updateParty(supplierId, { status: 'suspended' });
                if (result.error) {
                    alert('Failed to reject supplier: ' + result.error);
                    return;
                }
                // Reload parties data
                const parties = await getParties();
                window.partiesData = parties;
                updatePendingReviews();
                filterAndSearch();
            } catch (error) {
                console.error('Error rejecting supplier:', error);
                alert('Failed to reject supplier');
            }
        };

        // Update pending reviews section
        const updatePendingReviews = () => {
            const pendingReviewsContainer = document.querySelector('#pending-reviews-list');
            if (!pendingReviewsContainer) return;

            const pendingSuppliers = (window.partiesData || []).filter(p => p.status === 'inactive' && (p.type === 'supplier' || p.type === 'both'));
            
            if (pendingSuppliers.length === 0) {
                pendingReviewsContainer.innerHTML = '<div class="no-pending-message">No pending supplier reviews at this time</div>';
                return;
            }

            const pendingHTML = pendingSuppliers.map(supplier => {
                const initials = supplier.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                return `
                    <div class="pending-supplier-card">
                        <div class="pending-supplier-header">
                            <div class="pending-supplier-avatar">${initials}</div>
                            <div class="pending-supplier-info">
                                <div class="pending-supplier-name">${supplier.name}</div>
                                <div class="pending-supplier-business">${supplier.businessName || 'No business name'}</div>
                            </div>
                        </div>
                        <div class="pending-supplier-details">
                            <span class="detail-item"><strong>Phone:</strong> ${supplier.phone || '-'}</span>
                            <span class="detail-item"><strong>Email:</strong> ${supplier.email || '-'}</span>
                        </div>
                        <div class="pending-supplier-actions">
                            <button class="btn-approve" data-supplier-id="${supplier._id}">Approve</button>
                            <button class="btn-reject" data-supplier-id="${supplier._id}">Reject</button>
                        </div>
                    </div>
                `;
            }).join('');

            pendingReviewsContainer.innerHTML = pendingHTML;

            // Attach event listeners to approve/reject buttons
            pendingReviewsContainer.querySelectorAll('.btn-approve').forEach(btn => {
                btn.addEventListener('click', () => {
                    const supplierId = btn.dataset.supplierId;
                    handleApproveSupplier(supplierId);
                });
            });

            pendingReviewsContainer.querySelectorAll('.btn-reject').forEach(btn => {
                btn.addEventListener('click', () => {
                    const supplierId = btn.dataset.supplierId;
                    handleRejectSupplier(supplierId);
                });
            });
        };

        // Wait for parties table to be rendered
        setTimeout(() => {
            setupPagination();
            updateTable();
            updateChannelStats();
            updatePendingReviews();
        }, 100);
    },
    render: async ()=>{
        try {
            const stats = await getPartyStats();
            const parties = await getParties();
            
            // Handle errors from API calls
            if (stats.error || parties.error) {
                const errorMsg = stats.error || parties.error;
                return `
                    <div class="wrap">
                        ${DashboardMenu.render({ selected: "parties" })}
                        <div class="main">
                            <div class="alert alert-danger">Error loading parties: ${errorMsg}</div>
                        </div>
                    </div>
                `;
            }

            // Store parties data in window for pagination
            window.partiesData = parties;

            // Filter out suspended parties for display
            const activeParties = parties.filter(p => p.status !== 'suspended');

            // Sort parties by creation date (most recent first) and get top 2
            const sortedByDate = [...activeParties].sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            const recentParties = sortedByDate.slice(0, 2);

            // Build recent party cards HTML
            const recentPartyCards = recentParties.map((party, index) => {
                const initials = party.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const roleLabel = party.type === 'buyer' ? 'Buyer' : party.type === 'supplier' ? 'Supplier' : 'Buyer & Supplier';
                const statusClass = party.status === 'active' ? 'badge-green' : party.status === 'inactive' ? 'badge-yellow' : 'badge-red';
                const cardClass = index === 0 ? 'party-card party-card-primary' : 'party-card';
                
                return `
                    <div class="${cardClass}">
                        <div class="party-card-header">
                            <div class="party-avatar">${initials}</div>
                            <div>
                                <div class="party-card-name">${party.name}</div>
                                <div class="party-card-role">${roleLabel}${party.businessName ? ' · ' + party.businessName : ''}</div>
                            </div>
                        </div>
                        <div class="party-card-meta">
                            <span>${party.phone || 'No phone'}</span>
                            <span>Ksh ${party.currentBalance.toLocaleString()}</span>
                        </div>
                        <div class="party-card-footer">
                            <span class="${statusClass} text-white">${party.status.charAt(0).toUpperCase() + party.status.slice(1)}</span>
                            <a class="text-primary" href="#/party/${party._id}">View</a>
                        </div>
                    </div>
                `;
            }).join('');

            // Build pagination controls
            const itemsPerPage = 5;
            const totalPages = Math.ceil(activeParties.length / itemsPerPage);
            const pageButtons = Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                return `<button class="pagination-page-btn ${pageNum === 1 ? 'active' : ''}" data-page="${pageNum}">${pageNum}</button>`;
            }).join('');

            // Build table rows for first page
            const firstPageData = activeParties.slice(0, itemsPerPage);
            const tableRows = firstPageData.map(party => {
                const roleLabel = party.type === 'buyer' ? 'Buyer' : party.type === 'supplier' ? 'Supplier' : 'Buyer & Supplier';
                const statusClass = party.status === 'active' ? 'badge-green' : party.status === 'inactive' ? 'badge-yellow' : 'badge-red';
                
                return `
                    <tr>
                        <td>${party.name}</td>
                        <td>${roleLabel}</td>
                        <td>${party.phone || '-'}</td>
                        <td>${party.email || '-'}</td>
                        <td><span class="${statusClass} text-white">${party.status.charAt(0).toUpperCase() + party.status.slice(1)}</span></td>
                        <td>Ksh ${party.currentBalance.toLocaleString()}</td>
                        <td><a class="text-primary" href="#/party/${party._id}">View</a></td>
                    </tr>
                `;
            }).join('');

            const buyersCount = activeParties.filter(p => p.type === 'buyer' || p.type === 'both').length;
            const suppliersCount = activeParties.filter(p => p.type === 'supplier' || p.type === 'both').length;

            // Calculate contacts reached percentage (parties with phone or email)
            const partiesWithContact = activeParties.filter(p => p.phone || p.email).length;
            const contactPercentage = activeParties.length > 0 ? Math.round((partiesWithContact / activeParties.length) * 100) : 0;

            // Get pending suppliers for review (status is 'inactive' and type includes supplier)
            const pendingSuppliers = parties.filter(p => p.status === 'inactive' && (p.type === 'supplier' || p.type === 'both'));

            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "parties" })}
                    <div class="main">
                        <section class="dashboard-hero">
                          <div class="dashboard-hero-copy">
                            <span class="dashboard-pill">Parties</span>
                            <h1>Partner directory</h1>
                            <p>Track buyers, suppliers, and recurring farm partners with contact details, balance health, and active relationships.</p>
                            <div class="dashboard-hero-actions">
                              <a class="btn-primary text-white" href="/#/add-party">Add Party</a>
                            </div>
                          </div>
                          <div class="dashboard-hero-meta">
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">Buyers</span>
                              <span class="dashboard-mini-stat-value">${stats.buyers || 0}</span>
                              <span class="dashboard-mini-stat-trend">▲ ${stats.newThisMonth || 0} new this month</span>
                            </div>
                            <div class="dashboard-mini-stat">
                              <span class="dashboard-mini-stat-label">Suppliers</span>
                              <span class="dashboard-mini-stat-value">${stats.suppliers || 0}</span>
                              <span class="dashboard-mini-stat-trend">● ${stats.pendingReviews || 0} pending reviews</span>
                            </div>
                          </div>
                        </section>

                        <section class="dashboard-kpi-grid">
                          <article class="card-metric">
                            <div class="icon">👥</div>
                            <div>
                              <div class="metric-title">Total parties</div>
                              <div class="metric-value">${activeParties.length}</div>
                              <div class="metric-desc metric-desc--info">Across buyers and suppliers</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">⚡</div>
                            <div>
                              <div class="metric-title">Active parties</div>
                              <div class="metric-value">${activeParties.filter(p => p.status === 'active').length}</div>
                              <div class="metric-desc metric-desc--success">High-priority relationships</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">💳</div>
                            <div>
                              <div class="metric-title">Total balance</div>
                              <div class="metric-value">Ksh ${(stats.totalBalance || 0).toLocaleString()}</div>
                              <div class="metric-desc ${(stats.totalBalance || 0) > 50000 ? 'metric-desc--danger' : 'metric-desc--success'}">Outstanding balance</div>
                            </div>
                          </article>
                          <article class="card-metric">
                            <div class="icon">📊</div>
                            <div>
                              <div class="metric-title">Profile Readiness</div>
                              <div class="metric-value">${Math.round((activeParties.reduce((sum, p) => sum + (p.profileReadiness || 0), 0) / (activeParties.length || 1)) * 10) / 10}%</div>
                              <div class="metric-desc metric-desc--info">Average completion</div>
                            </div>
                          </article>
                        </section>

                        ${pendingSuppliers.length > 0 ? `
                        <section class="pending-reviews-section">
                          <article class="panel">
                            <div class="pending-reviews-header">
                              <h2 class="pending-reviews-title">⏳ Pending Supplier Reviews</h2>
                              <span class="pending-reviews-badge">${pendingSuppliers.length} awaiting approval</span>
                            </div>
                            <div class="pending-reviews-container" id="pending-reviews-list">
                              <!-- Pending suppliers will be rendered here -->
                            </div>
                          </article>
                        </section>
                        ` : ''}

                        <section class="parties-layout">
                          <article class="panel parties-main-panel">
                            <div class="card-title">Recent parties</div>
                            <div class="parties-directory-grid">
                              ${recentPartyCards}
                            </div>
                          </article>

                          <aside class="panel parties-side-panel">
                            <div class="card-title">Top partner channels</div>
                            <div class="top-partner-channels">
                              <button class="top-partner-channel" style="cursor: pointer; border: none; background: none; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; transition: all 0.3s ease;">Retail</button>
                              <button class="top-partner-channel" style="cursor: pointer; border: none; background: none; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; transition: all 0.3s ease;">Wholesale</button>
                              <button class="top-partner-channel" style="cursor: pointer; border: none; background: none; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; transition: all 0.3s ease;">Supplier</button>
                            </div>

                            <div class="party-summary-panel">
                              <div class="party-summary-item">
                                <div class="party-summary-label">Total parties</div>
                                <div class="party-summary-value" data-stat="total-parties">${activeParties.length}</div>
                              </div>
                              <div class="party-summary-item">
                                <div class="party-summary-label">Active contracts</div>
                                <div class="party-summary-value" data-stat="active-contracts">${activeParties.filter(p => p.status === 'active').length}</div>
                              </div>
                              <div class="party-summary-item">
                                <div class="party-summary-label">Outstanding balance</div>
                                <div class="party-summary-value" data-stat="outstanding-balance">Ksh ${(stats.totalBalance || 0).toLocaleString()}</div>
                              </div>
                              <div class="party-summary-item">
                                <div class="party-summary-label">Contacts reached</div>
                                <div class="party-summary-value" data-stat="contacts-reached">${contactPercentage}%</div>
                              </div>
                            </div>
                          </aside>
                        </section>

                        <section class="parties-table-section">
                          <article class="panel">
                            <div class="parties-table-header">
                              <h2 class="parties-table-title">All Parties</h2>
                              <div class="parties-table-controls">
                                <input 
                                  type="text" 
                                  id="parties-search-input" 
                                  class="parties-search-input" 
                                  placeholder="Search by name, phone or email"
                                >
                                <select id="parties-type-filter" class="parties-type-filter">
                                  <option value="all">All Types</option>
                                  <option value="buyer">Buyer</option>
                                  <option value="supplier">Supplier</option>
                                  <option value="both">Buyer & Supplier</option>
                                </select>
                                <button id="search-btn" class="btn-primary text-white">Search</button>
                              </div>
                            </div>
                            <div class="table-responsive">
                              <table class="table table-striped table-hover parties-table">
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Balance</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody id="parties-table-body">
                                  ${tableRows}
                                </tbody>
                              </table>
                            </div>

                            <div class="pagination-container">
                              <button id="pagination-prev" class=" btn-secondary text-white">← Previous</button>
                              <div class="pagination-buttons" style="display: flex; gap: 8px;">
                                ${pageButtons}
                              </div>
                              <button id="pagination-next" class=" btn-secondary text-white">Next →</button>
                              <span id="pagination-info" class="pagination-info"></span>
                            </div>
                          </article>
                        </section>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering parties:', error);
            return `
                <div class="wrap">
                    ${DashboardMenu.render({ selected: "parties" })}
                    <div class="main">
                        <div class="alert alert-danger">Error loading parties data</div>
                    </div>
                </div>
            `;
        }
    }
};
export default Parties;