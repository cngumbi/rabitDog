import axios from 'axios';

const InvoiceEdit = {
  data: {
    loading: false,
    invoice: null,
    error: null
  },

  calculateTotal() {
    if (!this.data.invoice) return '0.00';
    return this.data.invoice.lineItems.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const lineTotal = Number(item.lineTotal) || quantity * unitPrice;
      return sum + lineTotal + (Number(item.taxAmount) || 0);
    }, 0).toFixed(2);
  },

  async fetchInvoice(id) {
    this.data.loading = true;
    this.data.error = null;
    try {
      const response = await axios.get(`/api/accounting/invoices/${id}`);
      this.data.invoice = response.data;
    } catch (error) {
      console.error('Error loading invoice for edit:', error);
      this.data.error = error.response?.data?.message || error.message;
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  async handleSubmit() {
    if (!this.data.invoice) return;
    try {
      this.data.loading = true;
      const invoice = { ...this.data.invoice };
      invoice.lineItems = invoice.lineItems.map((item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const lineTotal = Number(item.lineTotal) || quantity * unitPrice;
        return {
          description: item.description,
          quantity,
          unitPrice,
          lineTotal,
          taxAmount: Number(item.taxAmount) || 0
        };
      });
      invoice.total = Number(this.calculateTotal());

      await axios.put(`/api/accounting/invoices/${invoice._id}`, invoice);
      alert('Invoice updated successfully!');
      window.location.hash = `#/invoices/${invoice._id}`;
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  renderLineItems() {
    return this.data.invoice.lineItems.map((item, index) => `
      <tr>
        <td><input type="text" value="${item.description || ''}" onchange="window.invoiceEditInstance.data.invoice.lineItems[${index}].description = this.value; window.invoiceEditInstance.updateView();" /></td>
        <td><input type="number" step="1" value="${item.quantity || 0}" onchange="window.invoiceEditInstance.data.invoice.lineItems[${index}].quantity = parseFloat(this.value); window.invoiceEditInstance.data.invoice.lineItems[${index}].lineTotal = (window.invoiceEditInstance.data.invoice.lineItems[${index}].quantity || 0) * (window.invoiceEditInstance.data.invoice.lineItems[${index}].unitPrice || 0); window.invoiceEditInstance.updateView();" /></td>
        <td><input type="number" step="0.01" value="${item.unitPrice || 0}" onchange="window.invoiceEditInstance.data.invoice.lineItems[${index}].unitPrice = parseFloat(this.value); window.invoiceEditInstance.data.invoice.lineItems[${index}].lineTotal = (window.invoiceEditInstance.data.invoice.lineItems[${index}].quantity || 0) * (window.invoiceEditInstance.data.invoice.lineItems[${index}].unitPrice || 0); window.invoiceEditInstance.updateView();" /></td>
        <td><input type="number" step="0.01" value="${item.taxAmount || 0}" onchange="window.invoiceEditInstance.data.invoice.lineItems[${index}].taxAmount = parseFloat(this.value) || 0; window.invoiceEditInstance.updateView();" /></td>
        <td class="amount">$${Number(item.lineTotal || 0).toFixed(2)}</td>
        <td>${this.data.invoice.lineItems.length > 1 ? `<button onclick="window.invoiceEditInstance.data.invoice.lineItems.splice(${index}, 1); window.invoiceEditInstance.updateView();" class="btn-remove">Remove</button>` : ''}</td>
      </tr>
    `).join('');
  },

  render() {
    if (this.data.loading) {
      return `<div class="invoice-container"><p>Loading invoice...</p></div>`;
    }

    if (this.data.error) {
      return `<div class="invoice-container"><p class="error">${this.data.error}</p></div>`;
    }

    if (!this.data.invoice) {
      return `<div class="invoice-container"><p>No invoice loaded.</p></div>`;
    }

    const invoice = this.data.invoice;
    const total = this.calculateTotal();
    return `
      <div class="invoice-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/budget" class="financial-nav-link">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>

        <h2>Edit Invoice</h2>
        <p class="subtitle">Update draft invoice details and line items.</p>

        <div class="invoice-form">
          <div class="form-group">
            <label>Customer ID</label>
            <input type="text" value="${invoice.customer?._id || invoice.customer || ''}" onchange="window.invoiceEditInstance.data.invoice.customer = this.value; window.invoiceEditInstance.updateView();" />
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
              <tbody>${this.renderLineItems()}</tbody>
            </table>
            <div class="line-totals"><p><strong>Total:</strong> $${total}</p></div>
            <button onclick="window.invoiceEditInstance.data.invoice.lineItems.push({ description: '', quantity: 1, unitPrice: 0, lineTotal: 0, taxAmount: 0 }); window.invoiceEditInstance.updateView();" class="btn-add">Add Line Item</button>
          </div>

          <div class="form-actions">
            <button onclick="window.invoiceEditInstance.handleSubmit();" class="btn-submit" ${invoice.status !== 'Draft' ? 'disabled' : ''}>${this.data.loading ? 'Saving...' : 'Save Invoice'}</button>
            <a href="/#/invoices/${invoice._id}" class="btn-cancel">Back to Details</a>
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
          @media (max-width: 768px) { .line-items table, .line-items th, .line-items td { display: block; width: 100%; } }
        </style>
      </div>
    `;
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
    }
  },

  async init(request) {
    window.invoiceEditInstance = this;
    if (request && request.id) {
      await this.fetchInvoice(request.id);
    } else {
      this.data.error = 'Invoice ID is required.';
      this.updateView();
    }
  },

  vignette(request) {
    return this.init(request);
  }
};

export default InvoiceEdit;
