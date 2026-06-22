import LivestockLayout from './LivestockLayout';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const AddType = {
  data: {
    formData: {},
    errors: {},
    loading: false,
    success: false,
    errorMessage: ''
  },

  validateForm() {
    this.data.errors = {};
    const { name, category } = this.data.formData;

    if (!name || name.trim() === '') {
      this.data.errors.name = 'Type name is required';
    }
    if (!category || category === '') {
      this.data.errors.category = 'Category is required';
    }

    return Object.keys(this.data.errors).length === 0;
  },

  async submitForm() {
    if (!this.validateForm()) {
      this.updateView();
      return;
    }

    const { name, description, category } = this.data.formData;

    try {
      this.data.loading = true;
      this.data.errorMessage = '';

      await livestockAPI.createType({
        name: name.trim(),
        description: description?.trim() || '',
        category: category || 'Poultry'
      });

      this.data.success = true;
      setTimeout(() => {
        window.location.hash = '#/livestock/types';
      }, 1000);
    } catch (error) {
      this.data.errorMessage = 'Error creating type: ' + livestockUtils.parseError(error);
      this.updateView();
    } finally {
      this.data.loading = false;
    }
  },

  render() {
    const { name, description, category } = this.data.formData;

    return LivestockLayout.render({
      activePath: '/livestock/types/add',
      heroHtml: `
        <section class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <span class="dashboard-pill">Livestock Management</span>
            <h1>Add Livestock Type</h1>
            <p>Create a new livestock type for your system.</p>
          </div>
        </section>
      `,
      contentHtml: `
        <div class="content-panel">
            ${this.data.success ? `
              <div style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                ✓ Type created successfully! Redirecting...
              </div>
            ` : ''}

            ${this.data.errorMessage ? `
              <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                ✗ ${this.data.errorMessage}
              </div>
            ` : ''}

            <div class="form-panel">
              <form onsubmit="event.preventDefault(); window.addTypeInstance.submitForm();">
                <div class="form-section">
                  <h3 class="form-section-title">Basic Information</h3>
                  
                  <div class="form-group">
                    <label class="form-label">Type Name *</label>
                    <p class="form-hint">Enter a descriptive name for this livestock type (e.g., Broiler Chicken, Dairy Cow)</p>
                    <input 
                      type="text" 
                      class="form-control ${this.data.errors.name ? 'error' : ''}" 
                      value="${name || ''}" 
                      onchange="window.addTypeInstance.data.formData.name = this.value;" 
                      placeholder="e.g., Broiler Chicken"
                      required
                    >
                    ${this.data.errors.name ? `<div class="form-error">${this.data.errors.name}</div>` : ''}
                  </div>

                  <div class="form-group">
                    <label class="form-label">Category *</label>
                    <p class="form-hint">Select the main category this livestock type belongs to</p>
                    <select 
                      class="form-select ${this.data.errors.category ? 'error' : ''}" 
                      onchange="window.addTypeInstance.data.formData.category = this.value;"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Poultry" ${category === 'Poultry' ? 'selected' : ''}>Poultry</option>
                      <option value="Livestock" ${category === 'Livestock' ? 'selected' : ''}>Livestock</option>
                      <option value="Aquaculture" ${category === 'Aquaculture' ? 'selected' : ''}>Aquaculture</option>
                      <option value="Apiary" ${category === 'Apiary' ? 'selected' : ''}>Apiary</option>
                      <option value="Other" ${category === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                    ${this.data.errors.category ? `<div class="form-error">${this.data.errors.category}</div>` : ''}
                  </div>
                </div>

                <div class="form-section">
                  <h3 class="form-section-title">Additional Details</h3>
                  
                  <div class="form-group form-grid-full">
                    <label class="form-label">Description</label>
                    <p class="form-hint">Provide details about this type, characteristics, or special notes</p>
                    <textarea 
                      class="form-control" 
                      onchange="window.addTypeInstance.data.formData.description = this.value;" 
                      placeholder="Describe this livestock type (e.g., Average weight, lifespan, special characteristics)"
                      rows="4"
                    >${description || ''}</textarea>
                  </div>
                </div>

                <div class="form-actions">
                  <button 
                    type="submit" 
                    class="btn-primary text-white"
                    ${this.data.loading ? 'disabled' : ''}
                  >
                    ${this.data.loading ? 'Creating...' : 'Create Type'}
                  </button>
                  <a href="/#/livestock/types" class="btn-secondary">Cancel</a>
                </div>
              </form>
            </div>
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
    window.addTypeInstance = this;
    this.data.formData = {};
    this.data.errors = {};
    this.data.loading = false;
    this.data.success = false;
    this.data.errorMessage = '';
  }
};

export default AddType;
