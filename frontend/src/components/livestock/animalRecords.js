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
    this.data.errorMessage = '';
    this.updateView();

    try {
      const animalsRes = await livestockAPI.getAllRecords().catch(e => ({ data: [] }));
      this.data.animals = animalsRes.data || [];
      this.data.filteredAnimals = this.data.animals;
      this.data.currentPage = 1;
      this.data.loading = false;
      this.updateView();

      const batchesRes = await livestockAPI.getAllBatches().catch(e => ({ data: [] }));
      this.data.batches = batchesRes.data || [];
      this.updateView();
    } catch (error) {
      console.error('Error fetching data:', error);
      this.data.loading = false;
      this.data.errorMessage = 'Unable to load animal records right now.';
      this.updateView();
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
    const searchTerm = (this.data.searchTerm || '').trim().toLowerCase();
    let filtered = this.data.animals;

    if (searchTerm) {
      filtered = filtered.filter((animal) => {
        const batchName = this.getBatchName(animal);
        const searchableText = [
          animal.identificationNumber,
          animal.animalCode,
          animal.gender,
          animal.status,
          animal.health,
          batchName,
          animal.weight,
          animal.age,
          animal.livestockType?.name,
          animal.livestockType?.typeName
        ].filter(Boolean).join(' ').toLowerCase();

        return searchableText.includes(searchTerm);
      });
    }

    if (this.data.filterBatch !== 'all') {
      filtered = filtered.filter((animal) => this.getBatchId(animal) === this.data.filterBatch);
    }

    this.data.filteredAnimals = filtered;
    this.data.currentPage = 1;
    this.refreshResultsView();
  },

  getBatchId(animal) {
    const batchRef = animal.batch;

    if (batchRef && typeof batchRef === 'object') {
      return batchRef._id || '';
    }

    if (typeof batchRef === 'string' || typeof batchRef === 'number') {
      return String(batchRef);
    }

    return '';
  },

  getBatchName(animal) {
    const batchRef = animal.batch;

    if (batchRef && typeof batchRef === 'object') {
      return batchRef.batchName || batchRef.name || 'Unassigned';
    }

    if (typeof batchRef === 'string' || typeof batchRef === 'number') {
      const matchedBatch = this.data.batches.find((batch) => batch._id === String(batchRef));
      return matchedBatch?.batchName || animal.batchName || 'Unassigned';
    }

    return animal.batchName || 'Unassigned';
  },

  refreshResultsView() {
    const resultsContainer = document.getElementById('animal-records-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = this.renderResultsTable();
    }

    const countElement = document.querySelector('[data-role="results-count"]');
    if (countElement) {
      countElement.textContent = `Total: ${this.data.filteredAnimals.length}`;
    }
  },

  renderResultsTable() {
    const startIdx = (this.data.currentPage - 1) * this.data.itemsPerPage;
    const endIdx = startIdx + this.data.itemsPerPage;
    const pageData = this.data.filteredAnimals.slice(startIdx, endIdx);
    const totalPages = Math.ceil(this.data.filteredAnimals.length / this.data.itemsPerPage);

    if (this.data.loading) {
      return '<div class="loading-spinner">Loading animals...</div>';
    }

    if (pageData.length === 0) {
      return '<div class="empty-state">No animal records found</div>';
    }

    return `
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
              <td>${this.getBatchName(animal)}</td>
              <td>${animal.gender || 'N/A'}</td>
              <td>${livestockUtils.formatNumber(animal.weight || 0)}</td>
              <td><span class="badge badge-${animal.health?.toLowerCase()}">${animal.health || 'Healthy'}</span></td>
              <td>${animal.status || 'Active'}</td>
              <td>
                <a href="/#/livestock/animal/${animal._id}" class="action-link">View</a>
                <button onclick="window.animalRecordsInstance.deleteAnimal('${animal._id}');" class="action-link danger">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${totalPages > 1 ? `
        <div class="pagination">
          <button onclick="window.animalRecordsInstance.data.currentPage = ${this.data.currentPage - 1}; window.animalRecordsInstance.refreshResultsView();" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
          <span class="page-info">Page ${this.data.currentPage} of ${totalPages}</span>
          <button onclick="window.animalRecordsInstance.data.currentPage = ${this.data.currentPage + 1}; window.animalRecordsInstance.refreshResultsView();" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
        </div>
      ` : ''}
    `;
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

    container.addEventListener('input', (event) => {
      if (event.target.matches('[data-role="animal-search-input"]')) {
        this.data.searchTerm = event.target.value;
        this.filterAnimals();
      }
    });

    container.addEventListener('change', (event) => {
      if (event.target.matches('[data-role="animal-batch-filter"]')) {
        this.data.filterBatch = event.target.value;
        this.filterAnimals();
      }
    });
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
              <span class="content-total" data-role="results-count">Total: ${this.data.filteredAnimals.length}</span>
            </div>
            
            <div class="filter-section">
              <div class="filter-row">
                <div class="filter-field">
                  <input type="text" class="form-control" value="${this.data.searchTerm || ''}" data-role="animal-search-input" placeholder="Search animals...">
                </div>
                <div class="filter-field">
                  <select class="form-select" data-role="animal-batch-filter">
                    <option value="all" ${this.data.filterBatch === 'all' ? 'selected' : ''}>All Batches</option>
                    ${this.data.batches.map(b => `<option value="${b._id}" ${this.data.filterBatch === b._id ? 'selected' : ''}>${b.batchName}</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>

            <div id="animal-records-results">
              ${this.renderResultsTable()}
            </div>
          </div>
        </div>
      </div>
    
    `,
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
    window.animalRecordsInstance = this;
    this.fetchData();
  }
};

export default AnimalRecords;
