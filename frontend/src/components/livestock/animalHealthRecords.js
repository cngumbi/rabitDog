import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const AnimalHealthRecords = {
  data: {
    healthRecords: [],
    animals: [],
    loading: false,
    currentPage: 1,
    itemsPerPage: 10,
    filteredRecords: [],
    searchTerm: '',
    filterSeverity: 'all',
    formData: {},
    showForm: false,
    errorMessage: ''
  },

  async fetchData() {
    this.data.loading = true;
    this.data.errorMessage = '';
    this.updateView();

    try {
      const healthRes = await livestockAPI.getAllHealthRecords().catch(() => ({ data: [] }));
      this.data.healthRecords = healthRes.data || [];
      this.data.filteredRecords = this.data.healthRecords;
      this.data.loading = false;
      this.updateView();

      const animalsRes = await livestockAPI.getAllRecords().catch(() => ({ data: [] }));
      this.data.animals = animalsRes.data || [];
      this.updateView();
    } catch (error) {
      console.error('Error fetching data:', error);
      this.data.loading = false;
      this.data.errorMessage = 'Unable to load health records right now.';
      this.updateView();
    }
  },

  async createHealthRecord() {
    const { recordType, animal, severity, description, treatment, outcome } = this.data.formData;
    if (!recordType || !animal || !severity) {
      alert('Please fill in required fields');
      return;
    }

    try {
      this.data.loading = true;
      const payload = {
        recordType,
        animal,
        severity,
        description: description || '',
        treatment: treatment ? { medicineName: treatment } : undefined,
        outcome: outcome || 'Ongoing',
        recordDate: new Date()
      };
      await livestockAPI.createHealthRecord(payload);
      alert('Health record created successfully');
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

  async deleteHealthRecord(recordId) {
    if (confirm('Delete this health record?')) {
      try {
        await livestockAPI.deleteHealthRecord(recordId);
        alert('Health record deleted successfully');
        await this.fetchData();
        this.updateView();
      } catch (error) {
        alert('Error: ' + livestockUtils.parseError(error));
      }
    }
  },

  getAnimalName(record) {
    const animalRef = record.animal;

    if (animalRef && typeof animalRef === 'object') {
      if (animalRef.identificationNumber) {
        return animalRef.identificationNumber;
      }

      if (animalRef._id) {
        const matchedAnimal = this.data.animals.find((animal) => animal._id === animalRef._id);
        return matchedAnimal?.identificationNumber || 'N/A';
      }
    }

    if (typeof animalRef === 'string' || typeof animalRef === 'number') {
      const matchedAnimal = this.data.animals.find((animal) => animal._id === String(animalRef));
      return matchedAnimal?.identificationNumber || 'N/A';
    }

    return 'N/A';
  },

  filterRecords() {
    let filtered = this.data.healthRecords;
    if (this.data.searchTerm) {
      const term = this.data.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.description?.toLowerCase().includes(term) ||
        r.recordType?.toLowerCase().includes(term)
      );
    }
    if (this.data.filterSeverity !== 'all') {
      filtered = filtered.filter(r => r.severity === this.data.filterSeverity);
    }
    this.data.filteredRecords = filtered;
    this.data.currentPage = 1;
  },

  render() {
    const startIdx = (this.data.currentPage - 1) * this.data.itemsPerPage;
    const endIdx = startIdx + this.data.itemsPerPage;
    const pageData = this.data.filteredRecords.slice(startIdx, endIdx);
    const totalPages = Math.ceil(this.data.filteredRecords.length / this.data.itemsPerPage);

    const { recordType, animal, severity, description, treatment, outcome } = this.data.formData;

    return LivestockLayout.render({
      activePath: '/livestock/health',
      heroHtml: `
        <section class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Livestock Management</span>
            <h1>Animal Health Records</h1>
            <p>Track health issues, treatments, and medical history.</p>
            <div class="dashboard-hero-actions">
              <a href="/#/livestock/health/add" class="btn-primary text-white">+ Add Health Record</a>
              <a class="btn-secondary text-white" href="/#/medicallogs">Medical Logs</a>
            </div>
          </div>
          <div class="dashboard-hero-meta">
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Total Records</span>
              <span class="dashboard-mini-stat-value">${this.data.healthRecords.length}</span>
              <span class="dashboard-mini-stat-trend">All health records</span>
            </div>
            <div class="dashboard-mini-stat">
              <span class="dashboard-mini-stat-label">Severe Cases</span>
              <span class="dashboard-mini-stat-value">${this.data.healthRecords.filter(r => r.severity === 'Severe' || r.severity === 'Critical').length}</span>
              <span class="dashboard-mini-stat-trend">Requiring attention</span>
            </div>
          </div>
        </section>
      `,
      contentHtml: `
        <div class="content-panel">
          <div class="content-header">
            <h2>Health Records</h2>
            <span class="content-total">Total: ${this.data.filteredRecords.length}</span>
          </div>
          
          <div class="filter-section">
            <div class="filter-row">
              <div class="filter-field">
                <input type="text" class="form-control" placeholder="Search records..." onkeyup="window.animalHealthInstance.data.searchTerm = this.value; window.animalHealthInstance.filterRecords(); window.animalHealthInstance.updateView();">
              </div>
              <div class="filter-field">
                <select class="form-select" onchange="window.animalHealthInstance.data.filterSeverity = this.value; window.animalHealthInstance.filterRecords(); window.animalHealthInstance.updateView();">
                  <option value="all">All Severity Levels</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          ${this.data.errorMessage ? `<div class="empty-state">${this.data.errorMessage}</div>` : ''}
          ${this.data.loading ? '<div class="loading-spinner">Loading records...</div>' : (pageData.length === 0 ? '<div class="empty-state">No health records found</div>' : `
            <table class="batches-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Animal</th>
                  <th>Record Type</th>
                  <th>Severity</th>
                  <th>Description</th>
                  <th>Outcome</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pageData.map(record => `
                  <tr>
                    <td>${livestockUtils.formatDate(record.recordDate)}</td>
                    <td>${this.getAnimalName(record)}</td>
                    <td>${record.recordType}</td>
                    <td><span class="badge badge-${record.severity?.toLowerCase()}">${record.severity}</span></td>
                    <td>${record.description || 'N/A'}</td>
                    <td>${record.outcome || 'Pending'}</td>
                    <td>
                      <a href="/#/livestock/health/${record._id}" class="action-link">View</a>
                      <button onclick="window.animalHealthInstance.deleteHealthRecord('${record._id}');" class="action-link danger">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${totalPages > 1 ? `
              <div class="pagination">
                <button onclick="window.animalHealthInstance.data.currentPage = ${this.data.currentPage - 1}; window.animalHealthInstance.updateView();" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
                <span class="page-info">Page ${this.data.currentPage} of ${totalPages}</span>
                <button onclick="window.animalHealthInstance.data.currentPage = ${this.data.currentPage + 1}; window.animalHealthInstance.updateView();" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
              </div>
            ` : ''}
          `)}
        </div>
      `
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
    window.animalHealthInstance = this;
    this.fetchData();
  }
};

export default AnimalHealthRecords;
