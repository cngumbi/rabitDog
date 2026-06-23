import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const LivestockTypes = {
  data: {
    types: [],
    loading: false,
    currentPage: 1,
    itemsPerPage: 10,
    filteredTypes: [],
    searchTerm: ''
  },

  async fetchTypes() {
    this.data.loading = true;
    this.updateView();

    try {
      const response = await livestockAPI.getAllTypes();
      this.data.types = response.data || [];
      this.data.filteredTypes = this.data.types;
    } catch (error) {
      console.error('Error fetching types:', error);
      alert('Error: ' + livestockUtils.parseError(error));
    } finally {
      this.data.loading = false;
      this.updateView();
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

  renderTable() {
    const startIdx = (this.data.currentPage - 1) * this.data.itemsPerPage;
    const endIdx = startIdx + this.data.itemsPerPage;
    const pageData = this.data.filteredTypes.slice(startIdx, endIdx);
    const totalPages = Math.ceil(this.data.filteredTypes.length / this.data.itemsPerPage);

    if (this.data.loading) {
      return '<div class="loading-spinner"><p>Loading types...</p></div>';
    }

    if (pageData.length === 0) {
      return `
        <div class="empty-state">
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
                <button onclick="window.livestockTypesInstance.deleteType('${type._id}');" class="action-link danger">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${totalPages > 1 ? `
        <div class="pagination">
          <button onclick="window.livestockTypesInstance.data.currentPage = ${this.data.currentPage - 1}; window.livestockTypesInstance.updateView();" ${this.data.currentPage === 1 ? 'disabled' : ''} class="btn-secondary">← Previous</button>
          <span class="page-info">Page ${this.data.currentPage} of ${totalPages}</span>
          <button onclick="window.livestockTypesInstance.data.currentPage = ${this.data.currentPage + 1}; window.livestockTypesInstance.updateView();" ${this.data.currentPage === totalPages ? 'disabled' : ''} class="btn-secondary">Next →</button>
        </div>
      ` : ''}
    `;
  },

  render() {
    return LivestockLayout.render({
      activePath: '/livestock/types',
      heroHtml: `
        <section class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Livestock Management</span>
            <h1>Livestock Types</h1>
            <p>Manage different livestock types in your system.</p>
            <div class="dashboard-hero-actions">
              <a href="/#/livestock/types/add" class="btn-primary text-white">+ Add Type</a>
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
      `,
      contentHtml: `
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
    window.livestockTypesInstance = this;
    this.fetchTypes();
  }
};

export default LivestockTypes;
