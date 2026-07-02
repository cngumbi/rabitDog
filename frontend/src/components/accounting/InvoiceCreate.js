import axios from 'axios';
import { getUserInfo } from '../../localStorage';

const InvoiceCreate = {
  data: {
    loading: false,
    parties: [],
    formData: {
      partyId: '',
      customer: '',
      lineItems: [{ description: '', quantity: 1, unitPrice: 0, lineTotal: 0, taxAmount: 0 }],
      discountAmount: 0,
      status: 'Draft'
    }
  },

  calculateTotal() {
    return this.data.formData.lineItems.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const taxAmount = Number(item.taxAmount) || 0;
      const lineTotal = quantity * unitPrice + taxAmount;
      return sum + lineTotal;
    }, 0).toFixed(2);
  },

  updateLineItem(index, field, value) {
    const item = this.data.formData.lineItems[index];
    if (!item) return;

    if (field === 'description') {
      item.description = value;
    } else if (field === 'quantity') {
      item.quantity = Number(value) || 0;
    } else if (field === 'unitPrice') {
      item.unitPrice = Number(value) || 0;
    } else if (field === 'taxAmount') {
      item.taxAmount = Number(value) || 0;
    }

    item.lineTotal = item.quantity * item.unitPrice + Number(item.taxAmount || 0);
    this.refreshLineTotals(index);
  },

  refreshLineTotals(index) {
    const container = document.getElementById('main-content');
    if (!container) return;

    const lineTotalCell = container.querySelector(`[data-line-total="${index}"]`);
    if (lineTotalCell) {
      const item = this.data.formData.lineItems[index];
      lineTotalCell.textContent = `$${(Number(item.quantity || 0) * Number(item.unitPrice || 0) + Number(item.taxAmount || 0)).toFixed(2)}`;
    }

    const totalElement = container.querySelector('[data-invoice-total]');
    if (totalElement) {
      totalElement.textContent = `$${this.calculateTotal()}`;
    }
  },

  addLineItem() {
    this.data.formData.lineItems.push({ description: '', quantity: 1, unitPrice: 0, lineTotal: 0, taxAmount: 0 });
    this.updateView();
  },

  removeLineItem(index) {
    if (this.data.formData.lineItems.length <= 1) return;
    this.data.formData.lineItems.splice(index, 1);
    this.updateView();
  },

  async handleSubmit() {
    try {
      this.data.loading = true;
      const lineItems = this.data.formData.lineItems.map((item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const taxAmount = Number(item.taxAmount) || 0;
        const lineTotal = quantity * unitPrice + taxAmount;
        return {
          description: item.description,
          quantity,
          unitPrice,
          lineTotal,
          taxAmount
        };
      });

      const payload = {
        ...this.data.formData,
        customer: this.data.formData.customer || this.data.formData.partyId,
        partyId: this.data.formData.partyId,
        lineItems,
        total: Number(this.calculateTotal())
      };

      const { token } = getUserInfo();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (!payload.partyId) {
        alert('Please select a customer for the invoice.');
        return;
      }

      if (!payload.total || payload.total <= 0) {
        alert('Invoice total must be greater than zero.');
        return;
      }

      await axios.post('/api/accounting/invoices/create', payload, { withCredentials: true, headers });
      alert('Invoice created successfully!');
      window.location.hash = '#/invoices';
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  registerEvents() {
    const container = document.getElementById('main-content');
    if (!container) return;

    const partySelect = container.querySelector('[data-party-select]');
    const addButton = container.querySelector('[data-add-line]');
    const submitButton = container.querySelector('[data-submit-invoice]');

    if (partySelect) {
      partySelect.addEventListener('change', (event) => {
        this.data.formData.partyId = event.target.value;
        this.updateView();
      });
    }

    container.querySelectorAll('[data-line-input]').forEach((input) => {
      input.addEventListener('input', (event) => {
        const index = Number(input.dataset.index);
        const field = input.dataset.lineInput;
        this.updateLineItem(index, field, event.target.value);
      });
    });

    if (addButton) {
      addButton.addEventListener('click', () => this.addLineItem());
    }

    if (submitButton) {
      submitButton.addEventListener('click', () => this.handleSubmit());
    }

    container.querySelectorAll('[data-remove-line]').forEach((button) => {
      const index = Number(button.dataset.removeLine);
      button.addEventListener('click', () => this.removeLineItem(index));
    });
  },

  render() {
    const { loading, formData, parties } = this.data;
    const total = this.calculateTotal();

    return `
      <div class="invoice-container">
        <div class="financial-nav">
          <a href="#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="#/budget" class="financial-nav-link">Budgets</a>
          <a href="#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="#/invoices" class="financial-nav-link">Invoices</a>
          <a href="#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>

        <h2>Create Invoice</h2>
        <p class="subtitle">Enter the invoice details and line items then save to generate a new transaction.</p>

        <div class="invoice-form">
          <div class="form-group">
            <label>Customer</label>
            <select data-party-select value="${formData.partyId}">
              <option value="">Select customer</option>
              ${parties.map((party) => `
                <option value="${party._id}" ${party._id === formData.partyId ? 'selected' : ''}>${party.name}${party.email ? ' · ' + party.email : ''}</option>
              `).join('')}
            </select>
          </div>

          <div class="line-items">
            <h4>Line Items</h4>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Tax Amount</th>
                  <th>Line Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${formData.lineItems.map((item, index) => `
                  <tr>
                    <td><input type="text" value="${item.description}" data-line-input="description" data-index="${index}" /></td>
                    <td><input type="number" step="1" value="${item.quantity}" data-line-input="quantity" data-index="${index}" /></td>
                    <td><input type="number" step="0.01" value="${item.unitPrice}" data-line-input="unitPrice" data-index="${index}" /></td>
                    <td><input type="number" step="0.01" value="${item.taxAmount || 0}" data-line-input="taxAmount" data-index="${index}" /></td>
                    <td class="amount" data-line-total="${index}">$${(Number(item.quantity || 0) * Number(item.unitPrice || 0) + Number(item.taxAmount || 0)).toFixed(2)}</td>
                    <td>${formData.lineItems.length > 1 ? `<button type="button" data-remove-line="${index}" class="btn-remove">Remove</button>` : ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="line-totals">
              <p><strong>Total:</strong> <span data-invoice-total>$${total}</span></p>
            </div>
            <button type="button" data-add-line class="btn-add">Add Line Item</button>
          </div>

          <div class="form-actions">
            <button type="button" data-submit-invoice class="btn-submit" ${loading ? 'disabled' : ''}>${loading ? 'Creating...' : 'Create Invoice'}</button>
            <a href="#/invoices" class="btn-cancel">Cancel</a>
          </div>
        </div>

        <style>
          .invoice-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .subtitle { color: #475569; margin-bottom: 20px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .invoice-form { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .form-group { margin-bottom: 15px; }
          .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
          .form-group input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          .line-items table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .line-items th, .line-items td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          .line-items th { background-color: #007bff; color: white; }
          .line-items input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          .line-totals { background: #e8f4f8; padding: 10px; border-radius: 4px; margin: 10px 0; }
          .amount { text-align: right; font-family: monospace; font-weight: bold; }
          .btn-remove, .btn-add, .btn-submit, .btn-cancel { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .btn-add { background-color: #17a2b8; color: white; margin-top: 10px; }
          .btn-remove { background-color: #dc3545; color: white; }
          .btn-submit { background-color: #28a745; color: white; }
          .btn-submit:disabled { background-color: #ccc; cursor: not-allowed; }
          .btn-cancel { background-color: #6c757d; color: white; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
          .form-actions { display: flex; gap: 10px; margin-top: 20px; }
          .form-actions a { flex: 1; text-align: center; }
          @media (max-width: 768px) { .line-items table, .line-items th, .line-items td { display: block; width: 100%; } }
        </style>
      </div>
    `;
  },

  async fetchParties() {
    try {
      const response = await axios.get('/api/parties', { withCredentials: true });
      this.data.parties = response.data || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      this.data.parties = [];
    }
  },

  updateView() {
    window.invoiceCreateInstance = this;
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
      this.registerEvents();
    }
  },

  async init() {
    window.invoiceCreateInstance = this;
    await this.fetchParties();
    this.updateView();
  },

  vignette() {
    return this.init();
  }
};

export default InvoiceCreate;
