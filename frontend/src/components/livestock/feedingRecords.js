import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const FeedingRecords = {
  data: {
    feedingRecords: [],
    batches: [],
    loading: false,
    currentPage: 1,
    itemsPerPage: 10,
    filteredRecords: [],
    searchTerm: '',
    filterBatch: 'all',
    formData: {},
    showForm: false,
    stats: {
      totalFed: 0,
      totalCost: 0,
      avgCostPerKg: 0
    }
  },

  async fetchData() {
    this.data.loading = true;
    this.data.errorMessage = '';
    this.updateView();

    try {
      const feedingRes = await livestockAPI.getAllFeedingRecords().catch(e => ({ data: [] }));
      this.data.feedingRecords = feedingRes.data || [];
      this.data.filteredRecords = this.data.feedingRecords;
      this.calculateStats();
      this.data.loading = false;
      this.updateView();

      const batchesRes = await livestockAPI.getAllBatches().catch(e => ({ data: [] }));
      this.data.batches = batchesRes.data || [];
      this.updateView();
    } catch (error) {
      console.error('Error fetching data:', error);
      this.data.loading = false;
      this.data.errorMessage = 'Unable to load feeding records right now.';
      this.updateView();
    }
  },

  calculateStats() {
    const records = this.data.feedingRecords;
    this.data.stats.totalFed = records.reduce((sum, r) => sum + (r.quantityFed || 0), 0);
    this.data.stats.totalCost = records.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    this.data.stats.avgCostPerKg = this.data.stats.totalFed > 0 ? (this.data.stats.totalCost / this.data.stats.totalFed).toFixed(2) : 0;
  },

  async createRecord() {
    const { batch, feedType, quantityFed, quantityAllocated, costPerKg, feedQuality } = this.data.formData;
    if (!batch || !feedType || !quantityFed || !quantityAllocated || !costPerKg) {
      alert('Please fill in required fields');
      return;
    }

    try {
      this.data.loading = true;
      await livestockAPI.createFeedingRecord({
        batch,
        feedingDate: new Date(),
        feedType,
        quantityFed: parseFloat(quantityFed),
        quantityAllocated: parseFloat(quantityAllocated),
        costPerKg: parseFloat(costPerKg),
        feedQuality: feedQuality || 'Good',
        animalCondition: 'Normal consumption',
        wastage: 0
      });
      alert('Feeding record created successfully');
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
    if (confirm('Delete this feeding record?')) {
      try {
        await livestockAPI.deleteFeedingRecord(recordId);
        alert('Record deleted successfully');
        await this.fetchData();
        this.updateView();
      } catch (error) {
        alert('Error: ' + livestockUtils.parseError(error));
      }
    }
  },

  filterRecords() {
    let filtered = this.data.feedingRecords;
    if (this.data.searchTerm) {
      const term = this.data.searchTerm.toLowerCase();
      filtered = filtered.filter(r => r.feedType?.toLowerCase().includes(term));
    }
    if (this.data.filterBatch !== 'all') {
      filtered = filtered.filter(r => r.batch === this.data.filterBatch);
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
      if (batchRef.name) {
        return batchRef.name;
      }
      if (batchRef._id) {
        const matchedBatch = this.data.batches.find((batch) => batch._id === batchRef._id);
        return matchedBatch?.batchName || 'Unassigned';
      }
    }

    if (typeof batchRef === 'string' || typeof batchRef === 'number') {
      const matchedBatch = this.data.batches.find((batch) => batch._id === String(batchRef));
      return matchedBatch?.batchName || record.batchName || 'Unassigned';
    }

    return record.batchName || 'Unassigned';
  },

  render() {
    const startIdx = (this.data.currentPage - 1) * this.data.itemsPerPage;
    const endIdx = startIdx + this.data.itemsPerPage;
    const pageData = this.data.filteredRecords.slice(startIdx, endIdx);
    const totalPages = Math.ceil(this.data.filteredRecords.length / this.data.itemsPerPage);

    const { batch, feedType, quantityFed, costPerKg, feedQuality } = this.data.formData;

    return LivestockLayout.render({
      activePath: '/livestock/feeding',
      heroHtml: `
        <section class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Livestock Management</span>
            <h1>Feeding Records</h1>
            <p>Track animal feed, costs, and quality.</p>
            <div class="dashboard-hero-actions">
              <a class="btn-primary text-white" href="/#/livestock/feeding/add">+ Add Record</a>
              <a class="btn-secondary text-white" href="/#/livestock">View Batches</a>
            </div>
          </div>
          <div class="dashboard-hero-meta">
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Total Fed (kg)</span>
              <span class="dashboard-mini-stat-value">${livestockUtils.formatNumber(this.data.stats.totalFed)}</span>
            </div>
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Total Cost</span>
              <span class="dashboard-mini-stat-value">${livestockUtils.formatCurrency(this.data.stats.totalCost)}</span>
            </div>
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Avg Cost/kg</span>
              <span class="dashboard-mini-stat-value">${livestockUtils.formatCurrency(this.data.stats.avgCostPerKg)}</span>
            </div>
          </div>
        </section>
      `,
      contentHtml: `
        ${this.data.showForm ? `
          <div class="form-panel">
            <h2>Add Feeding Record</h2>
            <form onsubmit="event.preventDefault(); window.feedingRecordsInstance.createRecord();">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Batch *</label>
                  <select class="form-select" onchange="window.feedingRecordsInstance.data.formData.batch = this.value;" required>
                    <option value="">Select Batch</option>
                    ${this.data.batches.map(b => `<option value="${b._id}" ${batch === b._id ? 'selected' : ''}>${b.batchName}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Feed Type *</label>
                  <input type="text" class="form-control" value="${feedType || ''}" onchange="window.feedingRecordsInstance.data.formData.feedType = this.value;" placeholder="e.g., Poultry Pellets" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Quantity Fed (kg) *</label>
                  <input type="number" step="0.1" class="form-control" value="${quantityFed || ''}" onchange="window.feedingRecordsInstance.data.formData.quantityFed = this.value;" placeholder="0.00" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Quantity Allocated (kg) *</label>
                  <input type="number" step="0.1" class="form-control" value="${quantityAllocated || ''}" onchange="window.feedingRecordsInstance.data.formData.quantityAllocated = this.value;" placeholder="0.00" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Cost per kg *</label>
                  <input type="number" step="0.01" class="form-control" value="${costPerKg || ''}" onchange="window.feedingRecordsInstance.data.formData.costPerKg = this.value;" placeholder="0.00" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Feed Quality</label>
                  <select class="form-select" onchange="window.feedingRecordsInstance.data.formData.feedQuality = this.value;">
                    <option value="Excellent" ${feedQuality === 'Excellent' ? 'selected' : ''}>Excellent</option>
                    <option value="Good" ${feedQuality === 'Good' ? 'selected' : ''}>Good</option>
                    <option value="Fair" ${feedQuality === 'Fair' ? 'selected' : ''}>Fair</option>
                    <option value="Poor" ${feedQuality === 'Poor' ? 'selected' : ''}>Poor</option>
                  </select>
                </div>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-primary text-white">Create Record</button>
                <button type="button" class="btn-secondary" onclick="window.feedingRecordsInstance.data.showForm = false; window.feedingRecordsInstance.updateView();">Cancel</button>
              </div>
            </form>
          </div>
        ` : ''}

        <div class="content-panel">
          <div class="content-header">
            <h2>Feeding Records</h2>
            <span class="content-total">Total: ${this.data.filteredRecords.length}</span>
          </div>
          
          <div class="filter-section">
            <div class="filter-row">
              <div class="filter-field">
                <input type="text" class="form-control" placeholder="Search by feed type..." onkeyup="window.feedingRecordsInstance.data.searchTerm = this.value; window.feedingRecordsInstance.filterRecords(); window.feedingRecordsInstance.updateView();">
              </div>
              <div class="filter-field">
                <select class="form-select" onchange="window.feedingRecordsInstance.data.filterBatch = this.value; window.feedingRecordsInstance.filterRecords(); window.feedingRecordsInstance.updateView();">
                  <option value="all">All Batches</option>
                  ${this.data.batches.map(b => `<option value="${b._id}">${b.batchName}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          ${this.data.loading ? '<div class="loading-spinner">Loading records...</div>' : (pageData.length === 0 ? '<div class="empty-state">No feeding records found</div>' : `
            <table class="batches-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Batch</th>
                  <th>Feed Type</th>
                  <th>Quantity (kg)</th>
                  <th>Cost/kg</th>
                  <th>Total Cost</th>
                  <th>Quality</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pageData.map(record => `
                  <tr>
                    <td>${livestockUtils.formatDate(record.feedingDate)}</td>
                    <td>${this.getBatchName(record)}</td>
                    <td>${record.feedType}</td>
                    <td>${livestockUtils.formatNumber(record.quantityFed)}</td>
                    <td>${livestockUtils.formatCurrency(record.costPerKg)}</td>
                    <td><strong>${livestockUtils.formatCurrency(record.totalCost)}</strong></td>
                    <td><span class="badge badge-quality">${record.feedQuality || 'Good'}</span></td>
                    <td>
                      <a href="/#/livestock/feeding/${record._id}" class="action-link">View</a>
                      <button onclick="window.feedingRecordsInstance.deleteRecord('${record._id}');" class="action-link danger">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${totalPages > 1 ? `
              <div class="pagination">
                <button onclick="window.feedingRecordsInstance.data.currentPage = ${this.data.currentPage - 1}; window.feedingRecordsInstance.updateView();" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
                <span class="page-info">Page ${this.data.currentPage} of ${totalPages}</span>
                <button onclick="window.feedingRecordsInstance.data.currentPage = ${this.data.currentPage + 1}; window.feedingRecordsInstance.updateView();" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
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
  },

  vignette() {
    this.init();
  },

  init() {
    window.feedingRecordsInstance = this;
    this.fetchData();
  }
};

export default FeedingRecords;
