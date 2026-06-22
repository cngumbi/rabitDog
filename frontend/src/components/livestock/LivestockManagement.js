import DashboardMenu from '../dashboard/dashboardMenu';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const LivestockManagement = {
  data: {
    batches: [],
    livestockTypes: [],
    selectedBatch: null,
    loading: false,
    currentPage: 1,
    itemsPerPage: 10,
    filteredBatches: [],
    searchTerm: '',
    filterStatus: 'all',
    formData: {},
    stats: {
      totalBatches: 0,
      activeBatches: 0,
      totalAnimals: 0,
      completedBatches: 0
    }
  },

  async fetchData() {
    this.data.loading = true;
    try {
      // Parallel fetch for better performance
      const [typesRes, batchesRes] = await Promise.all([
        livestockAPI.getAllTypes().catch(e => ({ data: [] })),
        livestockAPI.getAllBatches().catch(e => ({ data: [] }))
      ]);

      this.data.livestockTypes = typesRes.data || [];
      this.data.batches = batchesRes.data || [];
      
      this.data.filteredBatches = this.data.batches;
      this.calculateStats();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.data.loading = false;
    }
  },

  calculateStats() {
    const batches = this.data.batches;
    this.data.stats.totalBatches = batches.length;
    this.data.stats.activeBatches = batches.filter(b => b.status === 'Active').length;
    this.data.stats.completedBatches = batches.filter(b => b.status === 'Completed').length;
    this.data.stats.totalAnimals = batches.reduce((sum, b) => sum + (b.currentQuantity || 0), 0);
  },

  filterBatches() {
    let filtered = this.data.batches;

    if (this.data.searchTerm) {
      const term = this.data.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.batchName?.toLowerCase().includes(term) ||
        b.batchCode?.toLowerCase().includes(term) ||
        b.livestockType?.name?.toLowerCase().includes(term)
      );
    }

    if (this.data.filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === this.data.filterStatus);
    }

    this.data.filteredBatches = filtered;
    this.data.currentPage = 1;
    this.updateView();
  },

  async deleteBatch(batchId) {
    if (confirm('Are you sure you want to delete this batch?')) {
      try {
        await livestockAPI.deleteBatch(batchId);
        alert('Batch deleted successfully');
        await this.fetchData();
        this.updateView();
      } catch (error) {
        alert('Error deleting batch: ' + livestockUtils.parseError(error));
      }
    }
  },

  async createBatch() {
    const { batchName, livestockTypeId, quantity, unitCost, startDate, expectedEndDate, location, purpose } = this.data.formData;

    if (!batchName || !livestockTypeId || !quantity || !unitCost || !startDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      this.data.loading = true;
      const payload = {
        batchName,
        livestockType: livestockTypeId,
        quantity: parseInt(quantity),
        currentQuantity: parseInt(quantity),
        unitCost: parseFloat(unitCost),
        startDate,
        expectedEndDate: expectedEndDate || null,
        location: location || '',
        purpose: purpose || '',
        status: 'Active'
      };

      await livestockAPI.createBatch(payload);
      alert('Batch created successfully');
      this.data.formData = {};
      await this.fetchData();
      this.updateView();
    } catch (error) {
      alert('Error creating batch: ' + livestockUtils.parseError(error));
    } finally {
      this.data.loading = false;
    }
  },

  handleSearch(value) {
    this.data.searchTerm = value;
    this.filterBatches();
  },

  handleStatusFilter(value) {
    this.data.filterStatus = value;
    this.filterBatches();
  },

  changePage(page) {
    const totalPages = Math.ceil(this.data.filteredBatches.length / this.data.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      this.data.currentPage = page;
      this.updateView();
      window.scrollTo(0, 0);
    }
  },

  toggleCreateForm() {
    this.data.formData = Object.keys(this.data.formData).length > 0 ? {} : this.data.formData;
    this.updateView();
  },

  renderHeroSection() {
    const { totalBatches, activeBatches, totalAnimals, completedBatches } = this.data.stats;

    return `
      <section class="dashboard-hero">
        <div class="dashboard-hero-copy">
          <span class="dashboard-pill">Livestock Management</span>
          <h1>Manage Your Livestock</h1>
          <p>Track batches, animals, health records, feeding, and production in one place.</p>
          <div class="dashboard-hero-actions">
            <button onclick="window.livestockInstance.toggleCreateForm();" class="btn-primary text-white">+ New Batch</button>
            <a class="btn-secondary text-white" href="/#/medicallogs">Health Records</a>
          </div>
        </div>
        <div class="dashboard-hero-meta" aria-label="Livestock snapshot">
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Total Batches</span>
            <span class="dashboard-mini-stat-value">${totalBatches}</span>
            <span class="dashboard-mini-stat-trend">All livestock</span>
          </div>
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Active Batches</span>
            <span class="dashboard-mini-stat-value">${activeBatches}</span>
            <span class="dashboard-mini-stat-trend">Currently running</span>
          </div>
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Total Animals</span>
            <span class="dashboard-mini-stat-value">${totalAnimals}</span>
            <span class="dashboard-mini-stat-trend">In all batches</span>
          </div>
          <div class="dashboard-mini-stat">
            <span class="dashboard-mini-stat-label">Completed</span>
            <span class="dashboard-mini-stat-value">${completedBatches}</span>
            <span class="dashboard-mini-stat-trend">Finished batches</span>
          </div>
        </div>
      </section>
    `;
  },

  renderCreateForm() {
    if (this.data.loading) {
      return '';
    }

    const { batchName, livestockTypeId, quantity, unitCost, startDate, expectedEndDate, location, purpose } = this.data.formData;

    return `
      <div class="form-panel">
        <h2>Create New Batch</h2>
        <form onsubmit="event.preventDefault(); window.livestockInstance.createBatch();">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Batch Name *</label>
              <input type="text" class="form-control" value="${batchName || ''}" onchange="window.livestockInstance.data.formData.batchName = this.value;" placeholder="e.g., Batch A-01" required>
            </div>
            <div class="form-group">
              <label class="form-label">Livestock Type *</label>
              <select class="form-select" onchange="window.livestockInstance.data.formData.livestockTypeId = this.value;" required>
                <option value="">Select Type</option>
                ${this.data.livestockTypes.map(type => `<option value="${type._id}" ${livestockTypeId === type._id ? 'selected' : ''}>${type.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Initial Quantity *</label>
              <input type="number" class="form-control" value="${quantity || ''}" onchange="window.livestockInstance.data.formData.quantity = this.value;" placeholder="100" required>
            </div>
            <div class="form-group">
              <label class="form-label">Unit Cost *</label>
              <input type="number" class="form-control" step="0.01" value="${unitCost || ''}" onchange="window.livestockInstance.data.formData.unitCost = this.value;" placeholder="500" required>
            </div>
            <div class="form-group">
              <label class="form-label">Start Date *</label>
              <input type="date" class="form-control" value="${startDate || ''}" onchange="window.livestockInstance.data.formData.startDate = this.value;" required>
            </div>
            <div class="form-group">
              <label class="form-label">Expected End Date</label>
              <input type="date" class="form-control" value="${expectedEndDate || ''}" onchange="window.livestockInstance.data.formData.expectedEndDate = this.value;">
            </div>
            <div class="form-group">
              <label class="form-label">Location</label>
              <input type="text" class="form-control" value="${location || ''}" onchange="window.livestockInstance.data.formData.location = this.value;" placeholder="e.g., House 1">
            </div>
            <div class="form-group">
              <label class="form-label">Purpose</label>
              <select class="form-select" onchange="window.livestockInstance.data.formData.purpose = this.value;">
                <option value="">Select Purpose</option>
                <option value="Production" ${purpose === 'Production' ? 'selected' : ''}>Production</option>
                <option value="Breeding" ${purpose === 'Breeding' ? 'selected' : ''}>Breeding</option>
                <option value="Fattening" ${purpose === 'Fattening' ? 'selected' : ''}>Fattening</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary text-white">Create Batch</button>
            <button type="button" class="btn-secondary" onclick="window.livestockInstance.data.formData = {}; window.livestockInstance.toggleCreateForm();">Cancel</button>
          </div>
        </form>
      </div>
    `;
  },

  renderFilterSection() {
    return `
      <div class="filter-section">
        <div class="row" style="align-items: flex-end; gap: 1rem;">
          <div style="flex: 1; min-width: 250px;">
            <label class="form-label">Search</label>
            <input type="text" class="form-control" id="search-input" placeholder="Search by batch name or code..." onkeyup="window.livestockInstance.handleSearch(this.value)">
          </div>
          <div style="flex: 1; min-width: 200px;">
            <label class="form-label">Filter by Status</label>
            <select class="form-select" onchange="window.livestockInstance.handleStatusFilter(this.value);">
              <option value="all">All Batches</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Suspended">Suspended</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <label class="form-label">Items per page</label>
            <select class="form-select" onchange="window.livestockInstance.data.itemsPerPage = parseInt(this.value); window.livestockInstance.data.currentPage = 1; window.livestockInstance.updateView();">
              <option value="5" ${this.data.itemsPerPage === 5 ? 'selected' : ''}>5</option>
              <option value="10" ${this.data.itemsPerPage === 10 ? 'selected' : ''}>10</option>
              <option value="20" ${this.data.itemsPerPage === 20 ? 'selected' : ''}>20</option>
              <option value="50" ${this.data.itemsPerPage === 50 ? 'selected' : ''}>50</option>
            </select>
          </div>
        </div>
      </div>
    `;
  },

  renderBatchesTable() {
    const startIdx = (this.data.currentPage - 1) * this.data.itemsPerPage;
    const endIdx = startIdx + this.data.itemsPerPage;
    const pageData = this.data.filteredBatches.slice(startIdx, endIdx);
    const totalPages = Math.ceil(this.data.filteredBatches.length / this.data.itemsPerPage);

    if (this.data.loading) {
      return `<div class="loading-spinner" style="text-align: center; padding: 2rem;"><p>Loading batches...</p></div>`;
    }

    if (pageData.length === 0) {
      return `
        <div class="empty-state">
          <p>${this.data.batches.length === 0 ? 'No batches created yet.' : 'No batches match your search.'}</p>
          <button onclick="window.livestockInstance.toggleCreateForm();" class="btn-primary text-white" style="margin-top: 1rem;">Create First Batch</button>
        </div>
      `;
    }

    return `
      <table class="batches-table">
        <thead>
          <tr>
            <th>Batch Name</th>
            <th>Code</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Current</th>
            <th>Unit Cost</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pageData.map(batch => `
            <tr>
              <td><strong>${batch.batchName}</strong></td>
              <td>${batch.batchCode}</td>
              <td>${batch.livestockType?.name || 'N/A'}</td>
              <td>${batch.quantity}</td>
              <td>${batch.currentQuantity}</td>
              <td>${livestockUtils.formatCurrency(batch.unitCost)}</td>
              <td><span class="badge badge-${batch.status.toLowerCase()}">${batch.status}</span></td>
              <td>${livestockUtils.formatDate(batch.startDate)}</td>
              <td>
                <a href="#" class="action-link">View</a>
                <button onclick="window.livestockInstance.deleteBatch('${batch._id}');" class="action-link" style="color: #dc3545;">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="pagination">
        <button onclick="window.livestockInstance.changePage(${this.data.currentPage - 1});" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
        <div style="display: flex; gap: 0.25rem;">
          ${Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, this.data.currentPage - 2), Math.min(totalPages, this.data.currentPage + 1)).map(page => `
            <button onclick="window.livestockInstance.changePage(${page});" class="btn-secondary" style="${page === this.data.currentPage ? 'background: #667eea; color: white;' : ''}">${page}</button>
          `).join('')}
        </div>
        <button onclick="window.livestockInstance.changePage(${this.data.currentPage + 1});" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
        <span style="margin-left: 1rem; color: #666;">Page ${this.data.currentPage} of ${totalPages}</span>
      </div>
    `;
  },

  renderLivestockNav() {
    return `
      <div class="livestock-nav" style="padding: 0 2rem; margin-bottom: 1rem;">
        <a href="/#/livestock" class="active" style="background: rgba(102, 126, 234, 0.3);">Batches</a>
        <a href="/#/livestock/animals">Animals</a>
        <a href="/#/livestock/types">Types</a>
        <a href="/#/livestock/health">Health</a>
        <a href="/#/livestock/feeding">Feeding</a>
        <a href="/#/livestock/production">Production</a>
      </div>
    `;
  },

  render() {
    const showForm = Object.keys(this.data.formData).length > 0 || this.data.loading === false && !this.data.batches.length;
    
    return `
      <div class="wrap">
        ${DashboardMenu.render({ selected: 'livestock' })}
        <div class="main">
          ${this.renderHeroSection()}
          ${this.renderLivestockNav()}
          
          ${showForm ? this.renderCreateForm() : ''}
          
          <div class="content-panel">
            <div class="content-header">
              <h2>Batches</h2>
              <span class="content-total">Total: ${this.data.filteredBatches.length}</span>
            </div>
            
            ${this.renderFilterSection()}
            ${this.renderBatchesTable()}
          </div>
        </div>
      </div>
    `;
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
    }
  },

  vignette() {
    this.init();
  },

  init() {
    window.livestockInstance = this;
    this.fetchData();
  }
};

export default LivestockManagement;
