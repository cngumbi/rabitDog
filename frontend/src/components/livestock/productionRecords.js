import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const ProductionRecords = {
  data: {
    productionRecords: [],
    batches: [],
    loading: false,
    currentPage: 1,
    itemsPerPage: 10,
    filteredRecords: [],
    searchTerm: '',
    filterBatch: 'all',
    filterQuality: 'all',
    formData: {},
    showForm: false,
    stats: {
      totalProduction: 0,
      totalRevenue: 0,
      totalProfit: 0,
      averageQuality: 0
    }
  },

  async fetchData() {
    this.data.loading = true;
    this.data.errorMessage = '';
    this.updateView();

    try {
      const productionRes = await livestockAPI.getAllProductionRecords().catch(() => ({ data: [] }));
      this.data.productionRecords = productionRes.data || [];
      this.data.filteredRecords = this.data.productionRecords;
      this.calculateStats();
      this.data.loading = false;
      this.updateView();

      const batchesRes = await livestockAPI.getAllBatches().catch(() => ({ data: [] }));
      this.data.batches = batchesRes.data || [];
      this.updateView();
    } catch (error) {
      console.error('Error fetching data:', error);
      this.data.loading = false;
      this.data.errorMessage = 'Unable to load production records right now.';
      this.updateView();
    }
  },

  calculateStats() {
    const records = this.data.productionRecords;
    this.data.stats.totalProduction = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
    this.data.stats.totalRevenue = records.reduce((sum, r) => sum + (r.revenue || 0), 0);
    this.data.stats.totalProfit = records.reduce((sum, r) => sum + ((r.revenue || 0) - (r.expenses || 0)), 0);
  },

  async createRecord() {
    const { batch, productionType, unit, quantity, pricePerUnit, qualityGrade } = this.data.formData;
    if (!batch || !productionType || !unit || !quantity || !pricePerUnit) {
      alert('Please fill in required fields');
      return;
    }

    try {
      this.data.loading = true;
      await livestockAPI.createProductionRecord({
        batch,
        productionType,
        unit,
        quantity: parseFloat(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        quality: qualityGrade || 'Grade A',
        productionDate: new Date(),
        status: 'Produced'
      });
      alert('Production record created successfully');
      this.data.formData = {};
      this.data.showForm = false;
      await this.fetchData();
      this.updateView();
    } catch (error) {
      alert('Error: ' + livestockUtils.parseError(error));
    } finally {
      this.data.loading = false;
    }
  },

  async deleteRecord(recordId) {
    if (confirm('Delete this production record?')) {
      try {
        await livestockAPI.deleteProductionRecord(recordId);
        alert('Record deleted successfully');
        await this.fetchData();
        this.updateView();
      } catch (error) {
        alert('Error: ' + livestockUtils.parseError(error));
      }
    }
  },

  filterRecords() {
    let filtered = this.data.productionRecords;
    if (this.data.searchTerm) {
      const term = this.data.searchTerm.toLowerCase();
      filtered = filtered.filter(r => r.productionType?.toLowerCase().includes(term));
    }
    if (this.data.filterBatch !== 'all') {
      filtered = filtered.filter(r => r.batch === this.data.filterBatch);
    }
    if (this.data.filterQuality !== 'all') {
      filtered = filtered.filter(r => r.qualityGrade === this.data.filterQuality);
    }
    this.data.filteredRecords = filtered;
    this.data.currentPage = 1;
  },

  getBatchName(record) {
    const batchRef = record.batch;

    if (batchRef && typeof batchRef === 'object') {
      if (batchRef.batchName) {
        return batchRef.batchName;
      }

      if (batchRef._id) {
        const matchedBatch = this.data.batches.find((batch) => batch._id === batchRef._id);
        return matchedBatch?.batchName || 'N/A';
      }
    }

    if (typeof batchRef === 'string' || typeof batchRef === 'number') {
      const matchedBatch = this.data.batches.find((batch) => batch._id === String(batchRef));
      return matchedBatch?.batchName || record.batchName || 'N/A';
    }

    return record.batchName || 'N/A';
  },

  attachEventListeners() {
    if (this._listenersAttached) {
      return;
    }

    const container = document.getElementById('main-content');
    if (!container) {
      return;
    }

    this._listenersAttached = true;

    container.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-action]');
      if (!trigger) {
        return;
      }

      const action = trigger.dataset.action;
      if (action === 'show-form') {
        event.preventDefault();
        this.data.showForm = true;
        this.data.errorMessage = '';
        this.updateView();
      } else if (action === 'hide-form') {
        event.preventDefault();
        this.data.showForm = false;
        this.data.formData = {};
        this.updateView();
      } else if (action === 'delete-record') {
        const recordId = trigger.dataset.recordId;
        if (recordId) {
          this.deleteRecord(recordId);
        }
      }
    });

    container.addEventListener('input', (event) => {
      const field = event.target.dataset.field;
      if (field) {
        this.data.formData[field] = event.target.value;
        if (this.data.errorMessage) {
          this.data.errorMessage = '';
        }
      }

      if (event.target.matches('[data-filter="search"]')) {
        this.data.searchTerm = event.target.value;
        this.filterRecords();
        this.updateView();
      }
    });

    container.addEventListener('change', (event) => {
      const field = event.target.dataset.field;
      if (field) {
        this.data.formData[field] = event.target.value;
      }

      if (event.target.matches('[data-filter="batch"]')) {
        this.data.filterBatch = event.target.value;
        this.filterRecords();
        this.updateView();
      } else if (event.target.matches('[data-filter="quality"]')) {
        this.data.filterQuality = event.target.value;
        this.filterRecords();
        this.updateView();
      }
    });

    container.addEventListener('submit', (event) => {
      if (event.target.matches('form[data-production-form]')) {
        event.preventDefault();
        this.createRecord();
      }
    });
  },

  render() {
    const startIdx = (this.data.currentPage - 1) * this.data.itemsPerPage;
    const endIdx = startIdx + this.data.itemsPerPage;
    const pageData = this.data.filteredRecords.slice(startIdx, endIdx);
    const totalPages = Math.ceil(this.data.filteredRecords.length / this.data.itemsPerPage);

    const { batch, productionType, quantity, pricePerUnit, qualityGrade } = this.data.formData;

    return LivestockLayout.render({
      activePath: '/livestock/production',
      heroHtml: `
        <section class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Livestock Management</span>
            <h1>Production Records</h1>
            <p>Track production output, revenue, and profitability.</p>
            <div class="dashboard-hero-actions">
              <button type="button" class="btn-primary text-white" data-action="show-form">+ Add Record</button>
              <a class="btn-secondary text-white" href="/#/livestock">View Batches</a>
            </div>
          </div>
          <div class="dashboard-hero-meta">
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Total Production</span>
              <span class="dashboard-mini-stat-value">${livestockUtils.formatNumber(this.data.stats.totalProduction)}</span>
            </div>
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Total Revenue</span>
              <span class="dashboard-mini-stat-value">${livestockUtils.formatCurrency(this.data.stats.totalRevenue)}</span>
            </div>
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Total Profit</span>
              <span class="dashboard-mini-stat-value ${this.data.stats.totalProfit >= 0 ? 'profit' : 'loss'}">${livestockUtils.formatCurrency(this.data.stats.totalProfit)}</span>
            </div>
          </div>
        </section>
      `,
      contentHtml: `
        ${this.data.showForm ? `
          <div class="content-panel page-card add-record-card">
            <div class="content-header">
              <h2>Add Production Record</h2>
              <div>
                <button class="btn-secondary" type="button" data-action="hide-form">Close</button>
              </div>
            </div>
            <div class="form-panel">
              <form data-production-form="true">
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Batch *</label>
                    <select class="form-select" data-field="batch" required>
                      <option value="">Select Batch</option>
                      ${this.data.batches.map(b => `<option value="${b._id}" ${batch === b._id ? 'selected' : ''}>${b.batchName}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Production Type *</label>
                    <select class="form-select" data-field="productionType" required>
                      <option value="">Select Type</option>
                      <option value="Eggs" ${productionType === 'Eggs' ? 'selected' : ''}>Eggs</option>
                      <option value="Meat" ${productionType === 'Meat' ? 'selected' : ''}>Meat</option>
                      <option value="Milk" ${productionType === 'Milk' ? 'selected' : ''}>Milk</option>
                      <option value="Honey" ${productionType === 'Honey' ? 'selected' : ''}>Honey</option>
                      <option value="Wool" ${productionType === 'Wool' ? 'selected' : ''}>Wool</option>
                      <option value="Other" ${productionType === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantity *</label>
                    <input type="number" step="0.1" class="form-control" value="${quantity || ''}" data-field="quantity" placeholder="0.00" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Unit *</label>
                    <select class="form-select" data-field="unit" required>
                      <option value="">Select Unit</option>
                      <option value="Kg" ${this.data.formData.unit === 'Kg' ? 'selected' : ''}>Kg</option>
                      <option value="Liters" ${this.data.formData.unit === 'Liters' ? 'selected' : ''}>Liters</option>
                      <option value="Units" ${this.data.formData.unit === 'Units' ? 'selected' : ''}>Units</option>
                      <option value="Grams" ${this.data.formData.unit === 'Grams' ? 'selected' : ''}>Grams</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Price per Unit *</label>
                    <input type="number" step="0.01" class="form-control" value="${pricePerUnit || ''}" data-field="pricePerUnit" placeholder="0.00" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quality Grade</label>
                    <select class="form-select" data-field="qualityGrade">
                      <option value="Grade A" ${qualityGrade === 'Grade A' ? 'selected' : ''}>Grade A</option>
                      <option value="Grade B" ${qualityGrade === 'Grade B' ? 'selected' : ''}>Grade B</option>
                      <option value="Grade C" ${qualityGrade === 'Grade C' ? 'selected' : ''}>Grade C</option>
                      <option value="Reject" ${qualityGrade === 'Reject' ? 'selected' : ''}>Reject</option>
                    </select>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary text-white">Create Record</button>
                  <button type="button" class="btn-secondary" data-action="hide-form">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        ` : `
          <div class="content-panel add-record-cta">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>Add production records</strong>
                <p style="margin:0.25rem 0 0 0; color:#666; font-size:0.95rem;">Quickly log production output for a batch.</p>
              </div>
              <div>
                <button class="btn-primary text-white" type="button" data-action="show-form">+ Add Record</button>
              </div>
            </div>
          </div>
        `}

        <div class="content-panel">
          <div class="content-header">
            <h2>Production Records</h2>
            <span class="content-total">Total: ${this.data.filteredRecords.length}</span>
          </div>

          <div class="filter-section">
            <div class="filter-row">
              <div class="filter-field">
                <input type="text" class="form-control" placeholder="Search by type..." data-filter="search">
              </div>
              <div class="filter-field">
                <select class="form-select" data-filter="batch">
                  <option value="all">All Batches</option>
                  ${this.data.batches.map(b => `<option value="${b._id}">${b.batchName}</option>`).join('')}
                </select>
              </div>
              <div class="filter-field">
                <select class="form-select" data-filter="quality">
                  <option value="all">All Grades</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>
          </div>

          ${this.data.loading ? '<div class="loading-spinner">Loading records...</div>' : (pageData.length === 0 ? '<div class="empty-state">No production records found</div>' : `
            <table class="batches-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Batch</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pageData.map(record => `
                  <tr>
                    <td>${livestockUtils.formatDate(record.productionDate)}</td>
                    <td>${this.getBatchName(record)}</td>
                    <td>${record.productionType}</td>
                    <td>${livestockUtils.formatNumber(record.quantity)}</td>
                    <td>${record.unit}</td>
                    <td>${livestockUtils.formatCurrency(record.revenue || 0)}</td>
                    <td>${livestockUtils.formatCurrency((record.revenue || 0) - (record.expenses || 0))}</td>
                    <td>
                      <a href="/#/livestock/production/${record._id}" class="action-link">View</a>
                      <button type="button" class="action-link danger" data-action="delete-record" data-record-id="${record._id}">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${totalPages > 1 ? `
              <div class="pagination">
                <button onclick="window.productionRecordsInstance.data.currentPage = ${this.data.currentPage - 1}; window.productionRecordsInstance.updateView();" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
                <span class="page-info">Page ${this.data.currentPage} of ${totalPages}</span>
                <button onclick="window.productionRecordsInstance.data.currentPage = ${this.data.currentPage + 1}; window.productionRecordsInstance.updateView();" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
              </div>
            ` : ''}
          `)}
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
    this.attachEventListeners();
  },

  vignette() { this.init(); },

  init() {
    window.productionRecordsInstance = this;
    this.fetchData();
  }
};

export default ProductionRecords;
