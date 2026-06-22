import DashboardMenu from '../dashboard/dashboardMenu';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const LivestockTypes = {
  data: {
    types: [],
    loading: false,
    currentPage: 1,
    itemsPerPage: 10,
    filteredTypes: [],
    searchTerm: '',
    formData: {},
    showForm: false
  },

  async fetchTypes() {
    this.data.loading = true;
    try {
      const response = await livestockAPI.getAllTypes();
      this.data.types = response.data || [];
      this.data.filteredTypes = this.data.types;
    } catch (error) {
      console.error('Error fetching types:', error);
      alert('Error: ' + livestockUtils.parseError(error));
    } finally {
      this.data.loading = false;
    }
  },

  async createType() {
    const { name, description, category } = this.data.formData;
    if (!name || !category) {
      alert('Please fill in required fields');
      return;
    }

    try {
      this.data.loading = true;
      await livestockAPI.createType({
        name,
        description: description || '',
        category: category || 'Poultry'
      });
      alert('Type created successfully');
      this.data.formData = {};
      this.data.showForm = false;
      await this.fetchTypes();
      this.updateView();
    } catch (error) {
      alert('Error: ' + livestockUtils.parseError(error));
    } finally {
      this.data.loading = false;
    }
  },

  async deleteType(typeId) {
    if (confirm('Are you sure you want to delete this type?')) {
      try {
        await livestockAPI.deleteType(typeId);
        alert('Type deleted successfully');
        await this.fetchTypes();
        this.updateView();
      } catch (error) {
        alert('Error: ' + livestockUtils.parseError(error));
      }
    }
  },

  filterTypes() {
    let filtered = this.data.types;
    if (this.data.searchTerm) {
      const term = this.data.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      );
    }
    this.data.filteredTypes = filtered;
    this.data.currentPage = 1;
  },

  renderForm() {
    if (!this.data.showForm) return '';
    
    const { name, description, category } = this.data.formData;
    return `
      <div class="form-panel">
        <h2>Add Livestock Type</h2>
        <form onsubmit="event.preventDefault(); window.livestockTypesInstance.createType();">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Type Name *</label>
              <input type="text" class="form-control" value="${name || ''}" onchange="window.livestockTypesInstance.data.formData.name = this.value;" placeholder="e.g., Broiler Chicken" required>
            </div>
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select class="form-select" onchange="window.livestockTypesInstance.data.formData.category = this.value;" required>
                <option value="">Select Category</option>
                <option value="Poultry" ${category === 'Poultry' ? 'selected' : ''}>Poultry</option>
                <option value="Livestock" ${category === 'Livestock' ? 'selected' : ''}>Livestock</option>
                <option value="Aquaculture" ${category === 'Aquaculture' ? 'selected' : ''}>Aquaculture</option>
                <option value="Apiary" ${category === 'Apiary' ? 'selected' : ''}>Apiary</option>
                <option value="Other" ${category === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
            <div class="form-group" style="grid-column: 1/-1;">
              <label class="form-label">Description</label>
              <textarea class="form-control" onchange="window.livestockTypesInstance.data.formData.description = this.value;" placeholder="Describe this livestock type">${description || ''}</textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary text-white">Create Type</button>
            <button type="button" class="btn-secondary" onclick="window.livestockTypesInstance.data.showForm = false; window.livestockTypesInstance.updateView();">Cancel</button>
          </div>
        </form>
      </div>
    `;
  },

  renderTable() {
    const startIdx = (this.data.currentPage - 1) * this.data.itemsPerPage;
    const endIdx = startIdx + this.data.itemsPerPage;
    const pageData = this.data.filteredTypes.slice(startIdx, endIdx);
    const totalPages = Math.ceil(this.data.filteredTypes.length / this.data.itemsPerPage);

    if (this.data.loading) {
      return '<div class="loading-spinner" style="text-align: center; padding: 2rem;"><p>Loading types...</p></div>';
    }

    if (pageData.length === 0) {
      return `
        <div class="empty-state" style="text-align: center; padding: 3rem;">
          <p>${this.data.types.length === 0 ? 'No types created yet' : 'No types match your search'}</p>
        </div>
      `;
    }

    return `
      <table class="batches-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pageData.map(type => `
            <tr>
              <td><strong>${type.name}</strong></td>
              <td>${type.category || 'N/A'}</td>
              <td>${type.description || 'N/A'}</td>
              <td>
                <button onclick="window.livestockTypesInstance.deleteType('${type._id}');" class="action-link" style="color: #dc3545; background: none; border: none; cursor: pointer;">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${totalPages > 1 ? `
        <div class="pagination" style="margin-top: 1.5rem;">
          <button onclick="window.livestockTypesInstance.data.currentPage = ${this.data.currentPage - 1}; window.livestockTypesInstance.updateView();" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
          <span style="margin: 0 1rem; color: #666;">Page ${this.data.currentPage} of ${totalPages}</span>
          <button onclick="window.livestockTypesInstance.data.currentPage = ${this.data.currentPage + 1}; window.livestockTypesInstance.updateView();" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
        </div>
      ` : ''}
    `;
  },

  render() {
    return `
      <div class="wrap">
        ${DashboardMenu.render({ selected: 'livestock' })}
        <div class="main">
          <section class="dashboard-hero">
            <div class="dashboard-hero-copy">
              <span class="dashboard-pill">Livestock Management</span>
              <h1>Livestock Types</h1>
              <p>Manage different livestock types in your system.</p>
              <div class="dashboard-hero-actions">
                <button onclick="window.livestockTypesInstance.data.showForm = true; window.livestockTypesInstance.updateView();" class="btn-primary text-white">+ Add Type</button>
              </div>
            </div>
            <div class="dashboard-hero-meta">
              <div class="dashboard-mini-stat">
                <span class="dashboard-mini-stat-label">Total Types</span>
                <span class="dashboard-mini-stat-value">${this.data.types.length}</span>
                <span class="dashboard-mini-stat-trend">All categories</span>
              </div>
            </div>
          </section>

          <div class="livestock-nav" style="padding: 0 2rem; margin-bottom: 1rem;">
            <a href="/#/livestock">Batches</a>
            <a href="/#/livestock/animals">Animals</a>
            <a href="/#/livestock/types" class="active" style="background: rgba(102, 126, 234, 0.3);">Types</a>
            <a href="/#/livestock/health">Health</a>
            <a href="/#/livestock/feeding">Feeding</a>
            <a href="/#/livestock/production">Production</a>
          </div>

          ${this.renderForm()}

          <div class="content-panel">
            <div class="content-header">
              <h2>Livestock Types</h2>
              <span class="content-total">Total: ${this.data.filteredTypes.length}</span>
            </div>
            
            <div class="filter-section">
              <input type="text" class="form-control" placeholder="Search types..." onkeyup="window.livestockTypesInstance.data.searchTerm = this.value; window.livestockTypesInstance.filterTypes(); window.livestockTypesInstance.updateView();">
            </div>

            ${this.renderTable()}
          </div>
        </div>
      </div>
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
    window.livestockTypesInstance = this;
    this.fetchTypes();
  }
};

export default LivestockTypes;
