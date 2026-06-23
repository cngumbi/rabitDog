import LivestockLayout from './LivestockLayout';
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
    showForm: false,
    errorMessage: '',
    stats: {
      totalBatches: 0,
      activeBatches: 0,
      totalAnimals: 0,
      completedBatches: 0
    }
  },

  async fetchData() {
    this.data.loading = true;
    this.data.errorMessage = '';
    this.updateView();

    try {
      const batchesRes = await livestockAPI.getAllBatches().catch(e => ({ data: [] }));
      this.data.batches = batchesRes.data || [];
      this.data.filteredBatches = this.data.batches;
      this.calculateStats();
      if (!this.data.batches.length) {
        this.data.showForm = true;
      }

      this.data.loading = false;
      this.updateView();
      this.loadTypes();
    } catch (error) {
      console.error('Error fetching data:', error);
      this.data.errorMessage = 'Unable to load livestock batches right now. Please refresh or try again shortly.';
      this.data.loading = false;
      this.updateView();
    }
  },

  async loadTypes() {
    try {
      const typesRes = await livestockAPI.getAllTypes().catch(e => ({ data: [] }));
      this.data.livestockTypes = typesRes.data || [];
      this.updateView();
    } catch (error) {
      console.error('Error fetching livestock types:', error);
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
      this.data.showForm = false;
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

  toggleCreateForm(forceOpen = null) {
    const shouldOpen = forceOpen !== null ? forceOpen : !this.data.showForm;
    this.data.showForm = shouldOpen;
    if (!this.data.showForm) {
      this.data.formData = {};
    }
    this.updateView();
  },

  attachEventListeners() {
    if (this._eventListenersAttached) {
      return;
    }

    const container = document.getElementById('main-content');
    if (!container) {
      return;
    }

    this._eventListenersAttached = true;

    container.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) {
        return;
      }

      const { action, batchId, page, open } = button.dataset;

      switch (action) {
        case 'toggle-create-form':
          this.toggleCreateForm(open === 'true');
          break;
        case 'reset-create-form':
          this.data.formData = {};
          this.toggleCreateForm(false);
          break;
        case 'delete-batch':
          if (batchId) {
            this.deleteBatch(batchId);
          }
          break;
        case 'change-page':
          if (page) {
            this.changePage(parseInt(page, 10));
          }
          break;
        default:
          break;
      }
    });

    container.addEventListener('submit', (event) => {
      if (event.target.matches('form[data-create-batch-form]')) {
        event.preventDefault();
        this.createBatch();
      }
    });

    container.addEventListener('input', (event) => {
      const field = event.target.dataset.field;
      if (!field) {
        return;
      }

      this.data.formData[field] = event.target.value;
    });

    container.addEventListener('change', (event) => {
      const field = event.target.dataset.field;
      if (field) {
        this.data.formData[field] = event.target.value;
      }

      if (event.target.matches('[data-role="status-filter"]')) {
        this.handleStatusFilter(event.target.value);
      }

      if (event.target.matches('[data-role="items-per-page"]')) {
        this.data.itemsPerPage = parseInt(event.target.value, 10);
        this.data.currentPage = 1;
        this.updateView();
      }
    });

    container.addEventListener('keyup', (event) => {
      if (event.target.matches('[data-role="search-input"]')) {
        this.handleSearch(event.target.value);
      }
    });
  },

  renderHeroSection() {
    const { totalBatches, activeBatches, totalAnimals, completedBatches } = this.data.stats;

    return `
      <section class="dashboard-hero card livestock-hero-card">
        <div class="dashboard-hero-copy">
          <span class="dashboard-pill">Livestock Management</span>
          <h1>Manage Your Livestock</h1>
          <p>Track batches, animals, health records, feeding, and production in one place.</p>
          <div class="dashboard-hero-actions">
            <a class="btn-primary text-white" href="/#/livestock/add">+ New Batch</a>
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
        <form data-create-batch-form="true">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Batch Name *</label>
              <input type="text" class="form-control" data-field="batchName" value="${batchName || ''}" placeholder="e.g., Batch A-01" required>
            </div>
            <div class="form-group">
              <label class="form-label">Livestock Type *</label>
              <select class="form-select" data-field="livestockTypeId" required>
                <option value="">Select Type</option>
                ${this.data.livestockTypes.map(type => `<option value="${type._id}" ${livestockTypeId === type._id ? 'selected' : ''}>${type.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Initial Quantity *</label>
              <input type="number" class="form-control" data-field="quantity" value="${quantity || ''}" placeholder="100" required>
            </div>
            <div class="form-group">
              <label class="form-label">Unit Cost *</label>
              <input type="number" class="form-control" step="0.01" data-field="unitCost" value="${unitCost || ''}" placeholder="500" required>
            </div>
            <div class="form-group">
              <label class="form-label">Start Date *</label>
              <input type="date" class="form-control" data-field="startDate" value="${startDate || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Expected End Date</label>
              <input type="date" class="form-control" data-field="expectedEndDate" value="${expectedEndDate || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Location</label>
              <input type="text" class="form-control" data-field="location" value="${location || ''}" placeholder="e.g., House 1">
            </div>
            <div class="form-group">
              <label class="form-label">Purpose</label>
              <select class="form-select" data-field="purpose">
                <option value="">Select Purpose</option>
                <option value="Production" ${purpose === 'Production' ? 'selected' : ''}>Production</option>
                <option value="Breeding" ${purpose === 'Breeding' ? 'selected' : ''}>Breeding</option>
                <option value="Fattening" ${purpose === 'Fattening' ? 'selected' : ''}>Fattening</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary text-white">Create Batch</button>
            <button type="button" class="btn-secondary" data-action="reset-create-form">Cancel</button>
          </div>
        </form>
      </div>
    `;
  },

  renderCreateSection() {
    return `
      <div class="content-panel batch-create-panel">
        <div class="content-header">
          <h2>Create New Batch</h2>
          <button type="button" data-action="toggle-create-form" data-open="${this.data.showForm ? 'false' : 'true'}" class="btn-primary text-white">${this.data.showForm ? 'Hide Form' : '+ New Batch'}</button>
        </div>
        ${this.data.showForm ? this.renderCreateForm() : `
          <div class="empty-state">
            <p>Start a new livestock batch to track production, feeding, and health records.</p>
            <button type="button" data-action="toggle-create-form" data-open="true" class="btn-primary text-white">Create New Batch</button>
          </div>
        `}
      </div>
    `;
  },

  renderFilterSection() {
    return `
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-field">
            <label class="form-label">Search</label>
            <input type="text" class="form-control" id="search-input" data-role="search-input" placeholder="Search by batch name or code...">
          </div>
          <div class="filter-field">
            <label class="form-label">Filter by Status</label>
            <select class="form-select" data-role="status-filter">
              <option value="all">All Batches</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Suspended">Suspended</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <div class="filter-field">
            <label class="form-label">Items per page</label>
            <select class="form-select" data-role="items-per-page">
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
      return `<div class="loading-spinner"><p>Loading batches...</p></div>`;
    }

    if (pageData.length === 0) {
      return `
        <div class="empty-state">
          <p>${this.data.batches.length === 0 ? 'No batches created yet.' : 'No batches match your search.'}</p>
          <button type="button" data-action="toggle-create-form" data-open="true" class="btn-primary text-white">Create First Batch</button>
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
                <a href="/#/livestock/batch/${batch._id}" class="action-link">View</a>
                <button type="button" data-action="delete-batch" data-batch-id="${batch._id}" class="action-link danger">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="pagination">
        <button type="button" data-action="change-page" data-page="${this.data.currentPage - 1}" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
        <div class="pagination-pages">
          ${Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, this.data.currentPage - 2), Math.min(totalPages, this.data.currentPage + 1)).map(page => `
            <button type="button" data-action="change-page" data-page="${page}" class="btn-secondary ${page === this.data.currentPage ? 'active' : ''}">${page}</button>
          `).join('')}
        </div>
        <button type="button" data-action="change-page" data-page="${this.data.currentPage + 1}" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
        <span class="page-info">Page ${this.data.currentPage} of ${totalPages}</span>
      </div>
    `;
  },

  renderLivestockNav() {
    const activePath = window.location.hash.slice(1).toLowerCase() || '/livestock';
    const navItems = [
      { href: '/livestock', label: 'Batches', icon: '🗃' },
      { href: '/livestock/add', label: 'New Batch', icon: '➕' },
      { href: '/livestock/animals', label: 'Animals', icon: '🐮' },
      { href: '/livestock/types', label: 'Types', icon: '🏷' },
      { href: '/livestock/health', label: 'Health', icon: '🩺' },
      { href: '/livestock/feeding', label: 'Feeding', icon: '🥣' },
      { href: '/livestock/production', label: 'Production', icon: '📈' }
    ];

    return `
      <nav class="livestock-nav pills" role="navigation" aria-label="Livestock navigation">
        ${navItems.map(item => `
          <a href="/#${item.href}" class="nav-item ${activePath === item.href ? 'active' : ''}">
            <span class="nav-icon" aria-hidden="true">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
          </a>
        `).join('')}
      </nav>
    `;
  },

  render() {
    const showForm = this.data.showForm || (!this.data.batches.length && !this.data.loading);

    return LivestockLayout.render({
      pageTitle: 'Manage Your Livestock',
      description: 'Track batches, animals, health records, feeding, and production in one place.',
      heroActions: `
        <a class="btn-primary text-white" href="/#/livestock/add">+ New Batch</a>
        <a class="btn-secondary text-white" href="/#/medicallogs">Health Records</a>
      `,
      heroMeta: `
        <div class="dashboard-mini-stat">
          <span class="dashboard-mini-stat-label">Total Batches</span>
          <span class="dashboard-mini-stat-value">${this.data.stats.totalBatches}</span>
          <span class="dashboard-mini-stat-trend">All livestock</span>
        </div>
        <div class="dashboard-mini-stat">
          <span class="dashboard-mini-stat-label">Active Batches</span>
          <span class="dashboard-mini-stat-value">${this.data.stats.activeBatches}</span>
          <span class="dashboard-mini-stat-trend">Currently running</span>
        </div>
        <div class="dashboard-mini-stat">
          <span class="dashboard-mini-stat-label">Total Animals</span>
          <span class="dashboard-mini-stat-value">${this.data.stats.totalAnimals}</span>
          <span class="dashboard-mini-stat-trend">In all batches</span>
        </div>
        <div class="dashboard-mini-stat">
          <span class="dashboard-mini-stat-label">Completed</span>
          <span class="dashboard-mini-stat-value">${this.data.stats.completedBatches}</span>
          <span class="dashboard-mini-stat-trend">Finished batches</span>
        </div>
      `,
      activePath: window.location.hash.slice(1).toLowerCase() || '/livestock',
      contentHtml: `
        ${this.renderCreateSection()}
        ${this.data.errorMessage ? `
          <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            ✗ ${this.data.errorMessage}
          </div>
        ` : ''}
        <div class="content-panel">
          <div class="content-header">
            <h2>Batches</h2>
            <span class="content-total">Total: ${this.data.filteredBatches.length}</span>
          </div>
          ${this.renderFilterSection()}
          ${this.renderBatchesTable()}
        </div>
      `
    });
  },

  scheduleRender() {
    if (this._renderScheduled) {
      return;
    }

    this._renderScheduled = true;
    const renderNow = () => {
      this._renderScheduled = false;
      const container = document.getElementById('main-content');
      if (container) {
        container.innerHTML = this.render();
        this.attachEventListeners();
      }
    };

    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(renderNow);
    } else {
      renderNow();
    }
  },

  updateView() {
    this.scheduleRender();
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
