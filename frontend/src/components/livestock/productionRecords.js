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
    try {
      const [productionRes, batchesRes] = await Promise.all([
        livestockAPI.getAllProductionRecords().catch(() => ({ data: [] })),
        livestockAPI.getAllBatches().catch(() => ({ data: [] }))
      ]);
      this.data.productionRecords = productionRes.data || [];
      this.data.batches = batchesRes.data || [];
      this.data.filteredRecords = this.data.productionRecords;
      this.calculateStats();
      this.updateView();
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
              <a class="btn-primary text-white" href="/#/livestock/production/add">+ Add Record</a>
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
                <button class="btn-secondary" type="button" onclick="window.productionRecordsInstance.data.showForm = false; window.productionRecordsInstance.updateView();">Close</button>
              </div>
            </div>
            <div class="form-panel">
              <form onsubmit="event.preventDefault(); window.productionRecordsInstance.createRecord();">
                <div class="form-grid">
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
                      <option value="Other" ${productionType === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantity *</label>
                    <input type="number" step="0.1" class="form-control" value="${quantity || ''}" onchange="window.productionRecordsInstance.data.formData.quantity = this.value;" placeholder="0.00" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Unit *</label>
                    <select class="form-select" onchange="window.productionRecordsInstance.data.formData.unit = this.value;" required>
                      <option value="">Select Unit</option>
                      <option value="Kg" ${this.data.formData.unit === 'Kg' ? 'selected' : ''}>Kg</option>
                      <option value="Liters" ${this.data.formData.unit === 'Liters' ? 'selected' : ''}>Liters</option>
                      <option value="Units" ${this.data.formData.unit === 'Units' ? 'selected' : ''}>Units</option>
                      <option value="Grams" ${this.data.formData.unit === 'Grams' ? 'selected' : ''}>Grams</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Price per Unit *</label>
                    <input type="number" step="0.01" class="form-control" value="${pricePerUnit || ''}" onchange="window.productionRecordsInstance.data.formData.pricePerUnit = this.value;" placeholder="0.00" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quality Grade</label>
                    <select class="form-select" onchange="window.productionRecordsInstance.data.formData.qualityGrade = this.value;">
                      <option value="Grade A" ${qualityGrade === 'Grade A' ? 'selected' : ''}>Grade A</option>
                      <option value="Grade B" ${qualityGrade === 'Grade B' ? 'selected' : ''}>Grade B</option>
                      <option value="Grade C" ${qualityGrade === 'Grade C' ? 'selected' : ''}>Grade C</option>
                      <option value="Reject" ${qualityGrade === 'Reject' ? 'selected' : ''}>Reject</option>
                    </select>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary text-white">Create Record</button>
                  <button type="button" class="btn-secondary" onclick="window.productionRecordsInstance.data.showForm = false; window.productionRecordsInstance.updateView();">Cancel</button>
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
                <button class="btn-primary text-white" onclick="window.productionRecordsInstance.data.showForm = true; window.productionRecordsInstance.updateView();">+ Add Record</button>
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
                <input type="text" class="form-control" placeholder="Search by type..." onkeyup="window.productionRecordsInstance.data.searchTerm = this.value; window.productionRecordsInstance.filterRecords(); window.productionRecordsInstance.updateView();">
              </div>
              <div class="filter-field">
                <select class="form-select" onchange="window.productionRecordsInstance.data.filterBatch = this.value; window.productionRecordsInstance.filterRecords(); window.productionRecordsInstance.updateView();">
                  <option value="all">All Batches</option>
                  ${this.data.batches.map(b => `<option value="${b._id}">${b.batchName}</option>`).join('')}
                </select>
              </div>
              <div class="filter-field">
                <select class="form-select" onchange="window.productionRecordsInstance.data.filterQuality = this.value; window.productionRecordsInstance.filterRecords(); window.productionRecordsInstance.updateView();">
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
                    <td>${this.data.batches.find(b => b._id === record.batch)?.batchName || 'N/A'}</td>
                    <td>${record.productionType}</td>
                    <td>${livestockUtils.formatNumber(record.quantity)}</td>
                    <td>${record.unit}</td>
                    <td>${livestockUtils.formatCurrency(record.revenue || 0)}</td>
                    <td>${livestockUtils.formatCurrency((record.revenue || 0) - (record.expenses || 0))}</td>
                    <td><button onclick="window.productionRecordsInstance.deleteRecord('${record._id}');" class="action-link danger">Delete</button></td>
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

  updateView() {
    const container = document.getElementById('main-content');
    if (container) container.innerHTML = this.render();
  },

  vignette() { this.init(); },

  init() {
    window.productionRecordsInstance = this;
    this.fetchData();
  }
};

export default ProductionRecords;
