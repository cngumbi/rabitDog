import axios from 'axios';

const InvoiceCreate = {
  data: {
    loading: false,
    parties: [],
    formData: {
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
      const lineTotal = Number(item.lineTotal) || quantity * unitPrice;
      return sum + lineTotal + (Number(item.taxAmount) || 0);
    }, 0).toFixed(2);
  },

  async handleSubmit() {
    try {
      this.data.loading = true;
      const lineItems = this.data.formData.lineItems.map((item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const lineTotal = quantity * unitPrice;
        return {
          description: item.description,
          quantity,
          unitPrice,
          lineTotal,
          taxAmount: Number(item.taxAmount) || 0
        };
      });

      const payload = {
        ...this.data.formData,
        lineItems,
        total: Number(this.calculateTotal())
      };

      if (!payload.customer) {
        alert('Please select a customer for the invoice.');
        return;
      }

      if (!payload.total || payload.total <= 0) {
        alert('Invoice total must be greater than zero.');
        return;
      }

      await axios.post('/api/accounting/invoices/create', payload);
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
            <select onchange="window.invoiceCreateInstance.data.formData.customer = this.value; window.invoiceCreateInstance.updateView();">
              <option value="">Select customer</option>
              ${parties.map((party) => `
                <option value="${party._id}" ${party._id === formData.customer ? 'selected' : ''}>${party.name}${party.email ? ' · ' + party.email : ''}</option>
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
                    <td><input type="text" value="${item.description}" onchange="window.invoiceCreateInstance.data.formData.lineItems[${index}].description = this.value; window.invoiceCreateInstance.updateView();" /></td>
                    <td><input type="number" step="1" value="${item.quantity}" onchange="window.invoiceCreateInstance.data.formData.lineItems[${index}].quantity = parseFloat(this.value); window.invoiceCreateInstance.data.formData.lineItems[${index}].lineTotal = (window.invoiceCreateInstance.data.formData.lineItems[${index}].quantity || 0) * (window.invoiceCreateInstance.data.formData.lineItems[${index}].unitPrice || 0); window.invoiceCreateInstance.updateView();" /></td>
                    <td><input type="number" step="0.01" value="${item.unitPrice}" onchange="window.invoiceCreateInstance.data.formData.lineItems[${index}].unitPrice = parseFloat(this.value); window.invoiceCreateInstance.data.formData.lineItems[${index}].lineTotal = (window.invoiceCreateInstance.data.formData.lineItems[${index}].quantity || 0) * (window.invoiceCreateInstance.data.formData.lineItems[${index}].unitPrice || 0); window.invoiceCreateInstance.updateView();" /></td>
                    <td><input type="number" step="0.01" value="${item.taxAmount || 0}" onchange="window.invoiceCreateInstance.data.formData.lineItems[${index}].taxAmount = parseFloat(this.value) || 0; window.invoiceCreateInstance.updateView();" /></td>
                    <td class="amount">$${item.lineTotal ? Number(item.lineTotal).toFixed(2) : '0.00'}</td>
                    <td>${formData.lineItems.length > 1 ? `<button onclick="window.invoiceCreateInstance.data.formData.lineItems.splice(${index}, 1); window.invoiceCreateInstance.updateView();" class="btn-remove">Remove</button>` : ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="line-totals">
              <p><strong>Total:</strong> $${total}</p>
            </div>
            <button type="button" onclick="window.invoiceCreateInstance.data.formData.lineItems.push({ description: '', quantity: 1, unitPrice: 0, lineTotal: 0, taxAmount: 0 }); window.invoiceCreateInstance.updateView();" class="btn-add">Add Line Item</button>
          </div>

          <div class="form-actions">
            <button type="button" onclick="window.invoiceCreateInstance.handleSubmit();" class="btn-submit" ${loading ? 'disabled' : ''}>${loading ? 'Creating...' : 'Create Invoice'}</button>
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
      const response = await axios.get('/api/parties');
      this.data.parties = response.data || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      this.data.parties = [];
    }
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
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
