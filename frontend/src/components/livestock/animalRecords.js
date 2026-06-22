import DashboardMenu from '../dashboard/dashboardMenu';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const AnimalRecords = {
  data: {
    animals: [],
    batches: [],
    loading: false,
    currentPage: 1,
    itemsPerPage: 10,
    filteredAnimals: [],
    searchTerm: '',
    filterBatch: 'all',
    formData: {},
    showForm: false
  },

  async fetchData() {
    this.data.loading = true;
    try {
      const [animalsRes, batchesRes] = await Promise.all([
        livestockAPI.getAllRecords().catch(e => ({ data: [] })),
        livestockAPI.getAllBatches().catch(e => ({ data: [] }))
      ]);
      this.data.animals = animalsRes.data || [];
      this.data.batches = batchesRes.data || [];
      this.data.filteredAnimals = this.data.animals;
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.data.loading = false;
    }
  },

  async createAnimal() {
    const { identificationNumber, batch, gender, weight, health } = this.data.formData;
    if (!identificationNumber || !batch || !gender) {
      alert('Please fill in required fields');
      return;
    }

    try {
      this.data.loading = true;
      await livestockAPI.createRecord({
        identificationNumber,
        batch,
        gender,
        weight: weight || 0,
        health: health || 'Healthy',
        status: 'Active'
      });
      alert('Animal record created successfully');
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

  async deleteAnimal(animalId) {
    if (confirm('Delete this animal record?')) {
      try {
        await livestockAPI.deleteRecord(animalId);
        alert('Animal deleted successfully');
        await this.fetchData();
        this.updateView();
      } catch (error) {
        alert('Error: ' + livestockUtils.parseError(error));
      }
    }
  },

  filterAnimals() {
    let filtered = this.data.animals;
    if (this.data.searchTerm) {
      const term = this.data.searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.identificationNumber?.toLowerCase().includes(term) ||
        a.animalCode?.toLowerCase().includes(term)
      );
    }
    if (this.data.filterBatch !== 'all') {
      filtered = filtered.filter(a => a.batch === this.data.filterBatch);
    }
    this.data.filteredAnimals = filtered;
    this.data.currentPage = 1;
  },

  render() {
    const startIdx = (this.data.currentPage - 1) * this.data.itemsPerPage;
    const endIdx = startIdx + this.data.itemsPerPage;
    const pageData = this.data.filteredAnimals.slice(startIdx, endIdx);
    const totalPages = Math.ceil(this.data.filteredAnimals.length / this.data.itemsPerPage);

    const { identificationNumber, batch, gender, weight, health } = this.data.formData;

    return `
      <div class="wrap">
        ${DashboardMenu.render({ selected: 'livestock' })}
        <div class="main">
          <section class="dashboard-hero">
            <div class="dashboard-hero-copy">
              <span class="dashboard-pill">Livestock Management</span>
              <h1>Animal Records</h1>
              <p>Manage individual animal records and details.</p>
              <div class="dashboard-hero-actions">
                <button onclick="window.animalRecordsInstance.data.showForm = true; window.animalRecordsInstance.updateView();" class="btn-primary text-white">+ Add Animal</button>
              </div>
            </div>
            <div class="dashboard-hero-meta">
              <div class="dashboard-mini-stat">
                <span class="dashboard-mini-stat-label">Total Animals</span>
                <span class="dashboard-mini-stat-value">${this.data.animals.length}</span>
                <span class="dashboard-mini-stat-trend">All records</span>
              </div>
              <div class="dashboard-mini-stat">
                <span class="dashboard-mini-stat-label">Active Batches</span>
                <span class="dashboard-mini-stat-value">${this.data.batches.length}</span>
                <span class="dashboard-mini-stat-trend">Linked batches</span>
              </div>
            </div>
          </section>

          <div class="livestock-nav" style="padding: 0 2rem; margin-bottom: 1rem;">
            <a href="/#/livestock">Batches</a>
            <a href="/#/livestock/animals" class="active" style="background: rgba(102, 126, 234, 0.3);">Animals</a>
            <a href="/#/livestock/types">Types</a>
            <a href="/#/livestock/health">Health</a>
            <a href="/#/livestock/feeding">Feeding</a>
            <a href="/#/livestock/production">Production</a>
          </div>

          ${this.data.showForm ? `
            <div class="form-panel">
              <h2>Add Animal Record</h2>
              <form onsubmit="event.preventDefault(); window.animalRecordsInstance.createAnimal();">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label class="form-label">ID Number *</label>
                    <input type="text" class="form-control" value="${identificationNumber || ''}" onchange="window.animalRecordsInstance.data.formData.identificationNumber = this.value;" placeholder="e.g., ANM-001" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Batch *</label>
                    <select class="form-select" onchange="window.animalRecordsInstance.data.formData.batch = this.value;" required>
                      <option value="">Select Batch</option>
                      ${this.data.batches.map(b => `<option value="${b._id}" ${batch === b._id ? 'selected' : ''}>${b.batchName}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Gender *</label>
                    <select class="form-select" onchange="window.animalRecordsInstance.data.formData.gender = this.value;" required>
                      <option value="">Select Gender</option>
                      <option value="Male" ${gender === 'Male' ? 'selected' : ''}>Male</option>
                      <option value="Female" ${gender === 'Female' ? 'selected' : ''}>Female</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Weight (kg)</label>
                    <input type="number" step="0.1" class="form-control" value="${weight || ''}" onchange="window.animalRecordsInstance.data.formData.weight = this.value;" placeholder="0.00">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Health Status</label>
                    <select class="form-select" onchange="window.animalRecordsInstance.data.formData.health = this.value;">
                      <option value="Healthy" ${health === 'Healthy' ? 'selected' : ''}>Healthy</option>
                      <option value="Sick" ${health === 'Sick' ? 'selected' : ''}>Sick</option>
                      <option value="Treated" ${health === 'Treated' ? 'selected' : ''}>Treated</option>
                    </select>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary text-white">Create Record</button>
                  <button type="button" class="btn-secondary" onclick="window.animalRecordsInstance.data.showForm = false; window.animalRecordsInstance.updateView();">Cancel</button>
                </div>
              </form>
            </div>
          ` : ''}

          <div class="content-panel">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <h2>Animals</h2>
              <span style="color: #666; font-size: 0.9rem;">Total: ${this.data.filteredAnimals.length}</span>
            </div>
            
            <div class="filter-section">
              <div class="row" style="gap: 1rem;">
                <input type="text" class="form-control" style="flex: 1; min-width: 250px;" placeholder="Search animals..." onkeyup="window.animalRecordsInstance.data.searchTerm = this.value; window.animalRecordsInstance.filterAnimals(); window.animalRecordsInstance.updateView();">
                <select class="form-select" style="flex: 1; min-width: 200px;" onchange="window.animalRecordsInstance.data.filterBatch = this.value; window.animalRecordsInstance.filterAnimals(); window.animalRecordsInstance.updateView();">
                  <option value="all">All Batches</option>
                  ${this.data.batches.map(b => `<option value="${b._id}">${b.batchName}</option>`).join('')}
                </select>
              </div>
            </div>

            ${this.data.loading ? '<div class="loading-spinner">Loading animals...</div>' : (pageData.length === 0 ? '<div class="empty-state">No animal records found</div>' : `
              <table class="batches-table">
                <thead>
                  <tr>
                    <th>ID Code</th>
                    <th>ID Number</th>
                    <th>Batch</th>
                    <th>Gender</th>
                    <th>Weight (kg)</th>
                    <th>Health</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${pageData.map(animal => `
                    <tr>
                      <td>${animal.animalCode || 'N/A'}</td>
                      <td><strong>${animal.identificationNumber}</strong></td>
                      <td>${this.data.batches.find(b => b._id === animal.batch)?.batchName || 'N/A'}</td>
                      <td>${animal.gender || 'N/A'}</td>
                      <td>${livestockUtils.formatNumber(animal.weight || 0)}</td>
                      <td><span class="badge badge-${animal.health?.toLowerCase()}">${animal.health || 'Healthy'}</span></td>
                      <td>${animal.status || 'Active'}</td>
                      <td>
                        <button onclick="window.animalRecordsInstance.deleteAnimal('${animal._id}');" class="action-link" style="color: #dc3545; background: none; border: none; cursor: pointer;">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${totalPages > 1 ? `
                <div class="pagination" style="margin-top: 1.5rem;">
                  <button onclick="window.animalRecordsInstance.data.currentPage = ${this.data.currentPage - 1}; window.animalRecordsInstance.updateView();" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
                  <span style="margin: 0 1rem; color: #666;">Page ${this.data.currentPage} of ${totalPages}</span>
                  <button onclick="window.animalRecordsInstance.data.currentPage = ${this.data.currentPage + 1}; window.animalRecordsInstance.updateView();" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
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
        .dashboard-hero-copy { max-width: 600px; }
        .dashboard-pill { display: inline-block; background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; margin-bottom: 1rem; }
        .dashboard-hero h1 { font-size: 2rem; margin: 0.5rem 0; }
        .dashboard-hero p { opacity: 0.9; }
        .dashboard-hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; }
        .btn-primary, .btn-secondary { padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
        .btn-primary { background: white; color: #667eea; }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-secondary { background: rgba(255,255,255,0.2); color: white; text-decoration: none; }
        .text-white { color: white; }
        .content-panel { background: white; border-radius: 8px; padding: 2rem; margin: 0 2rem 2rem 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .form-panel { background: white; border-radius: 8px; padding: 2rem; margin: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .filter-section { background: #f9f9f9; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; }
        .form-group { margin-bottom: 1rem; }
        .form-label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
        .form-control, .form-select { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; box-sizing: border-box; }
        .form-control:focus, .form-select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
        .form-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
        .row { display: flex; }
        .batches-table { width: 100%; border-collapse: collapse; }
        .batches-table thead { background: #f5f5f5; border-bottom: 2px solid #ddd; }
        .batches-table th, .batches-table td { padding: 1rem; text-align: left; }
        .batches-table th { font-weight: 600; }
        .batches-table td { border-bottom: 1px solid #eee; }
        .batches-table tbody tr:hover { background: #f9f9f9; }
        .badge { display: inline-block; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 500; }
        .badge-healthy { background: #d4edda; color: #155724; }
        .badge-sick { background: #f8d7da; color: #721c24; }
        .badge-treated { background: #cfe2ff; color: #084298; }
        .action-link { color: #667eea; cursor: pointer; text-decoration: none; }
        .empty-state { background: #f9f9f9; padding: 3rem; text-align: center; color: #666; }
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
    window.animalRecordsInstance = this;
    this.fetchData();
  }
};

export default AnimalRecords;
