import DashboardMenu from '../dashboard/dashboardMenu';
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
    showForm: false
  },

  async fetchData() {
    this.data.loading = true;
    try {
      const [healthRes, animalsRes] = await Promise.all([
        livestockAPI.getAllHealthRecords().catch(e => ({ data: [] })),
        livestockAPI.getAllRecords().catch(e => ({ data: [] }))
      ]);
      this.data.healthRecords = healthRes.data || [];
      this.data.animals = animalsRes.data || [];
      this.data.filteredRecords = this.data.healthRecords;
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.data.loading = false;
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
      await livestockAPI.createHealthRecord({
        recordType,
        animal,
        severity,
        description: description || '',
        treatment: treatment ? { medicineName: treatment } : undefined,
        outcome: outcome || 'Ongoing'
      });
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

    return `
      <div class="wrap">
        ${DashboardMenu.render({ selected: 'livestock' })}
        <div class="main">
          <section class="dashboard-hero">
            <div class="dashboard-hero-copy">
              <span class="dashboard-pill">Livestock Management</span>
              <h1>Animal Health Records</h1>
              <p>Track health issues, treatments, and medical history.</p>
              <div class="dashboard-hero-actions">
                <button onclick="window.animalHealthInstance.data.showForm = true; window.animalHealthInstance.updateView();" class="btn-primary text-white">+ Add Record</button>
                <a class="btn-secondary text-white" href="/#/medicalogs">Medical Logs</a>
              </div>
            </div>
            <div class="dashboard-hero-meta">
              <div class="dashboard-mini-stat">
                <span class="dashboard-mini-stat-label">Total Records</span>
                <span class="dashboard-mini-stat-value">${this.data.records.length}</span>
                <span class="dashboard-mini-stat-trend">All health records</span>
              </div>
              <div class="dashboard-mini-stat">
                <span class="dashboard-mini-stat-label">Severe Cases</span>
                <span class="dashboard-mini-stat-value">${this.data.records.filter(r => r.severity === 'Severe' || r.severity === 'Critical').length}</span>
                <span class="dashboard-mini-stat-trend">Requiring attention</span>
              </div>
            </div>
          </section>

          <div class="livestock-nav" style="padding: 0 2rem; margin-bottom: 1rem;">
            <a href="/#/livestock">Batches</a>
            <a href="/#/livestock/animals">Animals</a>
            <a href="/#/livestock/types">Types</a>
            <a href="/#/livestock/health" class="active" style="background: rgba(102, 126, 234, 0.3);">Health</a>
            <a href="/#/livestock/feeding">Feeding</a>
            <a href="/#/livestock/production">Production</a>
          </div>

          ${this.data.showForm ? `
            <div class="form-panel">
              <h2>Add Health Record</h2>
              <form onsubmit="event.preventDefault(); window.animalHealthInstance.createHealthRecord();">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label class="form-label">Record Type *</label>
                    <select class="form-select" onchange="window.animalHealthInstance.data.formData.recordType = this.value;" required>
                      <option value="">Select Type</option>
                      <option value="Illness" ${recordType === 'Illness' ? 'selected' : ''}>Illness</option>
                      <option value="Vaccination" ${recordType === 'Vaccination' ? 'selected' : ''}>Vaccination</option>
                      <option value="Treatment" ${recordType === 'Treatment' ? 'selected' : ''}>Treatment</option>
                      <option value="Routine Check" ${recordType === 'Routine Check' ? 'selected' : ''}>Routine Check</option>
                      <option value="Injury" ${recordType === 'Injury' ? 'selected' : ''}>Injury</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Animal *</label>
                    <select class="form-select" onchange="window.animalHealthInstance.data.formData.animal = this.value;" required>
                      <option value="">Select Animal</option>
                      ${this.data.animals.map(a => `<option value="${a._id}" ${animal === a._id ? 'selected' : ''}>${a.identificationNumber || a.animalCode}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Severity *</label>
                    <select class="form-select" onchange="window.animalHealthInstance.data.formData.severity = this.value;" required>
                      <option value="">Select Severity</option>
                      <option value="Mild" ${severity === 'Mild' ? 'selected' : ''}>Mild</option>
                      <option value="Moderate" ${severity === 'Moderate' ? 'selected' : ''}>Moderate</option>
                      <option value="Severe" ${severity === 'Severe' ? 'selected' : ''}>Severe</option>
                      <option value="Critical" ${severity === 'Critical' ? 'selected' : ''}>Critical</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Outcome</label>
                    <select class="form-select" onchange="window.animalHealthInstance.data.formData.outcome = this.value;">
                      <option value="Ongoing" ${outcome === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
                      <option value="Recovered" ${outcome === 'Recovered' ? 'selected' : ''}>Recovered</option>
                      <option value="Deceased" ${outcome === 'Deceased' ? 'selected' : ''}>Deceased</option>
                    </select>
                  </div>
                  <div class="form-group" style="grid-column: 1/-1;">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" onchange="window.animalHealthInstance.data.formData.description = this.value;" placeholder="Describe the health issue...">${description || ''}</textarea>
                  </div>
                  <div class="form-group" style="grid-column: 1/-1;">
                    <label class="form-label">Treatment/Medicine</label>
                    <input type="text" class="form-control" value="${treatment || ''}" onchange="window.animalHealthInstance.data.formData.treatment = this.value;" placeholder="Medicine or treatment given">
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary text-white">Create Record</button>
                  <button type="button" class="btn-secondary" onclick="window.animalHealthInstance.data.showForm = false; window.animalHealthInstance.updateView();">Cancel</button>
                </div>
              </form>
            </div>
          ` : ''}

          <div class="content-panel">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <h2>Health Records</h2>
              <span style="color: #666; font-size: 0.9rem;">Total: ${this.data.filteredRecords.length}</span>
            </div>
            
            <div class="filter-section">
              <div class="row" style="gap: 1rem;">
                <input type="text" class="form-control" style="flex: 1; min-width: 250px;" placeholder="Search records..." onkeyup="window.animalHealthInstance.data.searchTerm = this.value; window.animalHealthInstance.filterRecords(); window.animalHealthInstance.updateView();">
                <select class="form-select" style="flex: 1; min-width: 200px;" onchange="window.animalHealthInstance.data.filterSeverity = this.value; window.animalHealthInstance.filterRecords(); window.animalHealthInstance.updateView();">
                  <option value="all">All Severity Levels</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

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
                      <td>${this.data.animals.find(a => a._id === record.animal)?.identificationNumber || 'N/A'}</td>
                      <td>${record.recordType}</td>
                      <td><span class="badge badge-${record.severity?.toLowerCase()}">${record.severity}</span></td>
                      <td>${record.description || 'N/A'}</td>
                      <td>${record.outcome || 'Pending'}</td>
                      <td>
                        <button onclick="window.animalHealthInstance.deleteHealthRecord('${record._id}');" class="action-link" style="color: #dc3545; background: none; border: none; cursor: pointer;">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${totalPages > 1 ? `
                <div class="pagination" style="margin-top: 1.5rem;">
                  <button onclick="window.animalHealthInstance.data.currentPage = ${this.data.currentPage - 1}; window.animalHealthInstance.updateView();" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
                  <span style="margin: 0 1rem; color: #666;">Page ${this.data.currentPage} of ${totalPages}</span>
                  <button onclick="window.animalHealthInstance.data.currentPage = ${this.data.currentPage + 1}; window.animalHealthInstance.updateView();" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
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
        .badge { display: inline-block; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 500; }
        .badge-mild { background: #d4edda; color: #155724; }
        .badge-moderate { background: #fff3cd; color: #664d03; }
        .badge-severe { background: #f8d7da; color: #721c24; }
        .badge-critical { background: #e2e3e5; color: #383d41; }
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
    window.animalHealthInstance = this;
    this.fetchData();
  }
};

export default AnimalHealthRecords;
