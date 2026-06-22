import DashboardMenu from '../dashboard/dashboardMenu';
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
    try {
      const [feedingRes, batchesRes] = await Promise.all([
        livestockAPI.getAllFeedingRecords().catch(e => ({ data: [] })),
        livestockAPI.getAllBatches().catch(e => ({ data: [] }))
      ]);
      this.data.feedingRecords = feedingRes.data || [];
      this.data.batches = batchesRes.data || [];
      this.data.filteredRecords = this.data.feedingRecords;
      this.calculateStats();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.data.loading = false;
    }
  },

  calculateStats() {
    const records = this.data.feedingRecords;
    this.data.stats.totalFed = records.reduce((sum, r) => sum + (r.quantityFed || 0), 0);
    this.data.stats.totalCost = records.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    this.data.stats.avgCostPerKg = this.data.stats.totalFed > 0 ? (this.data.stats.totalCost / this.data.stats.totalFed).toFixed(2) : 0;
  },

  async createRecord() {
    const { batch, feedType, quantityFed, costPerKg, feedQuality } = this.data.formData;
    if (!batch || !feedType || !quantityFed || !costPerKg) {
      alert('Please fill in required fields');
      return;
    }

    try {
      this.data.loading = true;
      const totalCost = parseFloat(quantityFed) * parseFloat(costPerKg);
      await livestockAPI.createFeedingRecord({
        batch,
        feedType,
        quantityFed: parseFloat(quantityFed),
        costPerKg: parseFloat(costPerKg),
        totalCost,
        feedQuality: feedQuality || 'Good',
        feedingDate: new Date()
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

  render() {
    const startIdx = (this.data.currentPage - 1) * this.data.itemsPerPage;
    const endIdx = startIdx + this.data.itemsPerPage;
    const pageData = this.data.filteredRecords.slice(startIdx, endIdx);
    const totalPages = Math.ceil(this.data.filteredRecords.length / this.data.itemsPerPage);

    const { batch, feedType, quantityFed, costPerKg, feedQuality } = this.data.formData;

    return `
      <div class="wrap">
        ${DashboardMenu.render({ selected: 'livestock' })}
        <div class="main">
          <section class="dashboard-hero">
            <div class="dashboard-hero-copy">
              <span class="dashboard-pill">Livestock Management</span>
              <h1>Feeding Records</h1>
              <p>Track animal feed, costs, and quality.</p>
              <div class="dashboard-hero-actions">
                <button onclick="window.feedingRecordsInstance.data.showForm = true; window.feedingRecordsInstance.updateView();" class="btn-primary text-white">+ Add Record</button>
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

          <div class="livestock-nav" style="padding: 0 2rem; margin-bottom: 1rem;">
            <a href="/#/livestock">Batches</a>
            <a href="/#/livestock/animals">Animals</a>
            <a href="/#/livestock/types">Types</a>
            <a href="/#/livestock/health">Health</a>
            <a href="/#/livestock/feeding" class="active" style="background: rgba(102, 126, 234, 0.3);">Feeding</a>
            <a href="/#/livestock/production">Production</a>
          </div>

          ${this.data.showForm ? `
            <div class="form-panel">
              <h2>Add Feeding Record</h2>
              <form onsubmit="event.preventDefault(); window.feedingRecordsInstance.createRecord();">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
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
                    <label class="form-label">Cost per kg *</label>
                    <input type="number" step="0.01" class="form-control" value="${costPerKg || ''}" onchange="window.feedingRecordsInstance.data.formData.costPerKg = this.value;" placeholder="0.00" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Feed Quality</label>
                    <select class="form-select" onchange="window.feedingRecordsInstance.data.formData.feedQuality = this.value;">
                      <option value="Good" ${feedQuality === 'Good' ? 'selected' : ''}>Good</option>
                      <option value="Average" ${feedQuality === 'Average' ? 'selected' : ''}>Average</option>
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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <h2>Feeding Records</h2>
              <span style="color: #666; font-size: 0.9rem;">Total: ${this.data.filteredRecords.length}</span>
            </div>
            
            <div class="filter-section">
              <div class="row" style="gap: 1rem;">
                <input type="text" class="form-control" style="flex: 1; min-width: 250px;" placeholder="Search by feed type..." onkeyup="window.feedingRecordsInstance.data.searchTerm = this.value; window.feedingRecordsInstance.filterRecords(); window.feedingRecordsInstance.updateView();">
                <select class="form-select" style="flex: 1; min-width: 200px;" onchange="window.feedingRecordsInstance.data.filterBatch = this.value; window.feedingRecordsInstance.filterRecords(); window.feedingRecordsInstance.updateView();">
                  <option value="all">All Batches</option>
                  ${this.data.batches.map(b => `<option value="${b._id}">${b.batchName}</option>`).join('')}
                </select>
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
                      <td>${this.data.batches.find(b => b._id === record.batch)?.batchName || 'N/A'}</td>
                      <td>${record.feedType}</td>
                      <td>${livestockUtils.formatNumber(record.quantityFed)}</td>
                      <td>${livestockUtils.formatCurrency(record.costPerKg)}</td>
                      <td><strong>${livestockUtils.formatCurrency(record.totalCost)}</strong></td>
                      <td><span class="badge badge-quality">${record.feedQuality || 'Good'}</span></td>
                      <td>
                        <button onclick="window.feedingRecordsInstance.deleteRecord('${record._id}');" class="action-link" style="color: #dc3545; background: none; border: none; cursor: pointer;">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${totalPages > 1 ? `
                <div class="pagination" style="margin-top: 1.5rem;">
                  <button onclick="window.feedingRecordsInstance.data.currentPage = ${this.data.currentPage - 1}; window.feedingRecordsInstance.updateView();" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
                  <span style="margin: 0 1rem; color: #666;">Page ${this.data.currentPage} of ${totalPages}</span>
                  <button onclick="window.feedingRecordsInstance.data.currentPage = ${this.data.currentPage + 1}; window.feedingRecordsInstance.updateView();" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
                </div>
              ` : ''}
            `)}
          </div>
        </div>
      </div>

      <style>
        .wrap { display: flex; min-height: 100vh; background: #f5f5f5; }
        .main { flex: 1; }
        .dashboard-hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 3rem 2rem; margin-bottom: 2rem; }
        .dashboard-hero-copy { max-width: 600px; margin-bottom: 2rem; }
        .dashboard-pill { display: inline-block; background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; margin-bottom: 1rem; }
        .dashboard-hero h1 { font-size: 2rem; margin: 0.5rem 0; }
        .dashboard-hero p { opacity: 0.9; }
        .dashboard-hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; }
        .dashboard-hero-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 2rem; }
        .dashboard-mini-stat { background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 8px; }
        .dashboard-mini-stat-label { display: block; font-size: 0.85rem; opacity: 0.9; margin-bottom: 0.5rem; }
        .dashboard-mini-stat-value { display: block; font-size: 1.8rem; font-weight: bold; }
        .btn-primary, .btn-secondary { padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; }
        .btn-primary { background: white; color: #667eea; }
        .btn-secondary { background: rgba(255,255,255,0.2); color: white; text-decoration: none; }
        .text-white { color: white; }
        .content-panel { background: white; border-radius: 8px; padding: 2rem; margin: 0 2rem 2rem 2rem; }
        .form-panel { background: white; border-radius: 8px; padding: 2rem; margin: 2rem; }
        .filter-section { background: #f9f9f9; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; }
        .form-group { margin-bottom: 1rem; }
        .form-label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
        .form-control, .form-select { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        .form-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
        .row { display: flex; }
        .batches-table { width: 100%; border-collapse: collapse; }
        .batches-table thead { background: #f5f5f5; border-bottom: 2px solid #ddd; }
        .batches-table th, .batches-table td { padding: 1rem; text-align: left; }
        .batches-table td { border-bottom: 1px solid #eee; }
        .batches-table tbody tr:hover { background: #f9f9f9; }
        .badge { display: inline-block; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; }
        .badge-quality { background: #d4edda; color: #155724; }
        .action-link { color: #667eea; cursor: pointer; text-decoration: none; }
        .empty-state { background: #f9f9f9; padding: 3rem; text-align: center; }
        .loading-spinner { text-align: center; padding: 2rem; color: #999; }
        .pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; }
        @media (max-width: 768px) {
          .wrap { flex-direction: column; }
          .content-panel, .form-panel { margin: 1rem 0.5rem; }
          .filter-section .row { flex-direction: column; }
        }
      </style>
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
    window.feedingRecordsInstance = this;
    this.fetchData();
  }
};

export default FeedingRecords;
