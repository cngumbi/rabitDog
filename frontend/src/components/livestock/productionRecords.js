import DashboardMenu from '../dashboard/dashboardMenu';
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
    try {
      const [productionRes, batchesRes] = await Promise.all([
        livestockAPI.getAllProductionRecords().catch(e => ({ data: [] })),
        livestockAPI.getAllBatches().catch(e => ({ data: [] }))
      ]);
      this.data.productionRecords = productionRes.data || [];
      this.data.batches = batchesRes.data || [];
      this.data.filteredRecords = this.data.productionRecords;
      this.calculateStats();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.data.loading = false;
    }
  },

  calculateStats() {
    const records = this.data.productionRecords;
    this.data.stats.totalProduction = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
    this.data.stats.totalRevenue = records.reduce((sum, r) => sum + (r.revenue || 0), 0);
    this.data.stats.totalProfit = records.reduce((sum, r) => sum + ((r.revenue || 0) - (r.expenses || 0)), 0);
  },

  async createRecord() {
    const { batch, productionType, quantity, unitPrice, expenses, qualityGrade } = this.data.formData;
    if (!batch || !productionType || !quantity || !unitPrice) {
      alert('Please fill in required fields');
      return;
    }

    try {
      this.data.loading = true;
      const revenue = parseFloat(quantity) * parseFloat(unitPrice);
      const profit = revenue - (parseFloat(expenses) || 0);
      await livestockAPI.createProductionRecord({
        batch,
        productionType,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
        revenue,
        expenses: parseFloat(expenses) || 0,
        profit,
        qualityGrade: qualityGrade || 'Good',
        productionDate: new Date()
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

  render() {
    const startIdx = (this.data.currentPage - 1) * this.data.itemsPerPage;
    const endIdx = startIdx + this.data.itemsPerPage;
    const pageData = this.data.filteredRecords.slice(startIdx, endIdx);
    const totalPages = Math.ceil(this.data.filteredRecords.length / this.data.itemsPerPage);

    const { batch, productionType, quantity, unitPrice, expenses, qualityGrade } = this.data.formData;

    return `
      <div class="wrap">
        ${DashboardMenu.render({ selected: 'livestock' })}
        <div class="main">
          <section class="dashboard-hero">
            <div class="dashboard-hero-copy">
              <span class="dashboard-pill">Livestock Management</span>
              <h1>Production Records</h1>
              <p>Track production output, revenue, and profitability.</p>
              <div class="dashboard-hero-actions">
                <button onclick="window.productionRecordsInstance.data.showForm = true; window.productionRecordsInstance.updateView();" class="btn-primary text-white">+ Add Record</button>
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

          <div class="livestock-nav" style="padding: 0 2rem; margin-bottom: 1rem;">
            <a href="/#/livestock">Batches</a>
            <a href="/#/livestock/animals">Animals</a>
            <a href="/#/livestock/types">Types</a>
            <a href="/#/livestock/health">Health</a>
            <a href="/#/livestock/feeding">Feeding</a>
            <a href="/#/livestock/production" class="active" style="background: rgba(102, 126, 234, 0.3);">Production</a>
          </div>

          ${this.data.showForm ? `
            <div class="form-panel">
              <h2>Add Production Record</h2>
              <form onsubmit="event.preventDefault(); window.productionRecordsInstance.createRecord();">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label class="form-label">Batch *</label>
                    <select class="form-select" onchange="window.productionRecordsInstance.data.formData.batch = this.value;" required>
                      <option value="">Select Batch</option>
                      ${this.data.batches.map(b => `<option value="${b._id}" ${batch === b._id ? 'selected' : ''}>${b.batchName}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Production Type *</label>
                    <select class="form-select" onchange="window.productionRecordsInstance.data.formData.productionType = this.value;" required>
                      <option value="">Select Type</option>
                      <option value="Eggs" ${productionType === 'Eggs' ? 'selected' : ''}>Eggs</option>
                      <option value="Meat" ${productionType === 'Meat' ? 'selected' : ''}>Meat</option>
                      <option value="Milk" ${productionType === 'Milk' ? 'selected' : ''}>Milk</option>
                      <option value="Honey" ${productionType === 'Honey' ? 'selected' : ''}>Honey</option>
                      <option value="Wool" ${productionType === 'Wool' ? 'selected' : ''}>Wool</option>
                      <option value="Fish" ${productionType === 'Fish' ? 'selected' : ''}>Fish</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantity *</label>
                    <input type="number" step="0.1" class="form-control" value="${quantity || ''}" onchange="window.productionRecordsInstance.data.formData.quantity = this.value;" placeholder="0.00" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Unit Price *</label>
                    <input type="number" step="0.01" class="form-control" value="${unitPrice || ''}" onchange="window.productionRecordsInstance.data.formData.unitPrice = this.value;" placeholder="0.00" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Expenses</label>
                    <input type="number" step="0.01" class="form-control" value="${expenses || ''}" onchange="window.productionRecordsInstance.data.formData.expenses = this.value;" placeholder="0.00">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quality Grade</label>
                    <select class="form-select" onchange="window.productionRecordsInstance.data.formData.qualityGrade = this.value;">
                      <option value="Excellent" ${qualityGrade === 'Excellent' ? 'selected' : ''}>Excellent</option>
                      <option value="Good" ${qualityGrade === 'Good' ? 'selected' : ''}>Good</option>
                      <option value="Average" ${qualityGrade === 'Average' ? 'selected' : ''}>Average</option>
                      <option value="Poor" ${qualityGrade === 'Poor' ? 'selected' : ''}>Poor</option>
                    </select>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary text-white">Create Record</button>
                  <button type="button" class="btn-secondary" onclick="window.productionRecordsInstance.data.showForm = false; window.productionRecordsInstance.updateView();">Cancel</button>
                </div>
              </form>
            </div>
          ` : ''}

          <div class="content-panel">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <h2>Production Records</h2>
              <span style="color: #666; font-size: 0.9rem;">Total: ${this.data.filteredRecords.length}</span>
            </div>
            
            <div class="filter-section">
              <div class="row" style="gap: 1rem;">
                <input type="text" class="form-control" style="flex: 1; min-width: 250px;" placeholder="Search by type..." onkeyup="window.productionRecordsInstance.data.searchTerm = this.value; window.productionRecordsInstance.filterRecords(); window.productionRecordsInstance.updateView();">
                <select class="form-select" style="flex: 1; min-width: 150px;" onchange="window.productionRecordsInstance.data.filterBatch = this.value; window.productionRecordsInstance.filterRecords(); window.productionRecordsInstance.updateView();">
                  <option value="all">All Batches</option>
                  ${this.data.batches.map(b => `<option value="${b._id}">${b.batchName}</option>`).join('')}
                </select>
                <select class="form-select" style="flex: 1; min-width: 150px;" onchange="window.productionRecordsInstance.data.filterQuality = this.value; window.productionRecordsInstance.filterRecords(); window.productionRecordsInstance.updateView();">
                  <option value="all">All Grades</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
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
                    <th>Unit Price</th>
                    <th>Revenue</th>
                    <th>Expenses</th>
                    <th>Profit</th>
                    <th>Quality</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${pageData.map(record => `
                    <tr>
                      <td>${livestockUtils.formatDate(record.productionDate)}</td>
                      <td>${this.data.batches.find(b => b._id === record.batch)?.batchName || 'N/A'}</td>
                      <td>${record.productionType}</td>
                      <td>${livestockUtils.formatNumber(record.quantity)}</td>
                      <td>${livestockUtils.formatCurrency(record.unitPrice)}</td>
                      <td><strong>${livestockUtils.formatCurrency(record.revenue)}</strong></td>
                      <td>${livestockUtils.formatCurrency(record.expenses)}</td>
                      <td><strong class="${(record.profit || 0) >= 0 ? 'profit' : 'loss'}">${livestockUtils.formatCurrency(record.profit)}</strong></td>
                      <td><span class="badge badge-${record.qualityGrade?.toLowerCase()}">${record.qualityGrade}</span></td>
                      <td>
                        <button onclick="window.productionRecordsInstance.deleteRecord('${record._id}');" class="action-link" style="color: #dc3545; background: none; border: none; cursor: pointer;">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${totalPages > 1 ? `
                <div class="pagination" style="margin-top: 1.5rem;">
                  <button onclick="window.productionRecordsInstance.data.currentPage = ${this.data.currentPage - 1}; window.productionRecordsInstance.updateView();" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
                  <span style="margin: 0 1rem; color: #666;">Page ${this.data.currentPage} of ${totalPages}</span>
                  <button onclick="window.productionRecordsInstance.data.currentPage = ${this.data.currentPage + 1}; window.productionRecordsInstance.updateView();" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
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
        .profit { color: #28a745; }
        .loss { color: #dc3545; }
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
        .batches-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
        .batches-table thead { background: #f5f5f5; border-bottom: 2px solid #ddd; }
        .batches-table th, .batches-table td { padding: 0.8rem; text-align: left; }
        .batches-table td { border-bottom: 1px solid #eee; }
        .batches-table tbody tr:hover { background: #f9f9f9; }
        .badge { display: inline-block; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; }
        .badge-excellent { background: #d4edda; color: #155724; }
        .badge-good { background: #cfe2ff; color: #084298; }
        .badge-average { background: #fff3cd; color: #664d03; }
        .badge-poor { background: #f8d7da; color: #721c24; }
        .action-link { color: #667eea; cursor: pointer; text-decoration: none; }
        .empty-state { background: #f9f9f9; padding: 3rem; text-align: center; }
        .loading-spinner { text-align: center; padding: 2rem; color: #999; }
        .pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; }
        @media (max-width: 768px) {
          .wrap { flex-direction: column; }
          .content-panel, .form-panel { margin: 1rem 0.5rem; }
          .filter-section .row { flex-direction: column; }
          .batches-table { font-size: 0.85rem; }
          .batches-table th, .batches-table td { padding: 0.5rem; }
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
    window.productionRecordsInstance = this;
    this.fetchData();
  }
};

export default ProductionRecords;
