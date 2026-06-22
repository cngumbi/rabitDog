import LivestockLayout from './LivestockLayout';
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
    filterBatch: 'all'
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

    return LivestockLayout.render({
      activePath: '/livestock/animals',
      heroHtml: `
        <section class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Livestock Management</span>
            <h1>Animal Records</h1>
            <p>Manage individual animal records and details.</p>
            <div class="dashboard-hero-actions">
              <a href="/#/livestock/animals/add" class="btn-primary text-white">+ Add Animal</a>
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
      `,
      contentHtml: `
        <div class="content-panel">
            <div class="content-header">
              <h2>Animals</h2>
              <span class="content-total">Total: ${this.data.filteredAnimals.length}</span>
            </div>
            
            <div class="filter-section">
              <div class="filter-row">
                <div class="filter-field">
                  <input type="text" class="form-control" placeholder="Search animals..." onkeyup="window.animalRecordsInstance.data.searchTerm = this.value; window.animalRecordsInstance.filterAnimals(); window.animalRecordsInstance.updateView();">
                </div>
                <div class="filter-field">
                  <select class="form-select" onchange="window.animalRecordsInstance.data.filterBatch = this.value; window.animalRecordsInstance.filterAnimals(); window.animalRecordsInstance.updateView();">
                    <option value="all">All Batches</option>
                    ${this.data.batches.map(b => `<option value="${b._id}">${b.batchName}</option>`).join('')}
                  </select>
                </div>
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
                        <button onclick="window.animalRecordsInstance.deleteAnimal('${animal._id}');" class="action-link danger">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${totalPages > 1 ? `
                <div class="pagination">
                  <button onclick="window.animalRecordsInstance.data.currentPage = ${this.data.currentPage - 1}; window.animalRecordsInstance.updateView();" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
                  <span class="page-info">Page ${this.data.currentPage} of ${totalPages}</span>
                  <button onclick="window.animalRecordsInstance.data.currentPage = ${this.data.currentPage + 1}; window.animalRecordsInstance.updateView();" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
                </div>
              ` : ''}
            `)}
          </div>
        </div>
      </div>
    
    `,
    });
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
