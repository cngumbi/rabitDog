import axios from 'axios';

const Invoice = {
  data: {
    invoices: [],
    loading: false,
    showForm: false,
    filter: { status: '' },
    formData: {
      customer: '',
      lineItems: [{ description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }],
      total: 0,
      status: 'Draft'
    }
  },

  async fetchInvoices() {
    this.data.loading = true;
    try {
      const response = await axios.get('/api/accounting/invoices/list', { params: this.data.filter });
      this.data.invoices = response.data.invoices || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  async handleSendInvoice(invoiceId) {
    try {
      this.data.loading = true;
      await axios.post(`/api/accounting/invoices/${invoiceId}/send`);
      alert('Invoice sent successfully!');
      await this.fetchInvoices();
      this.updateView();
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  async handlePayInvoice(invoiceId) {
    const amount = prompt('Enter payment amount:');
    if (amount) {
      try {
        this.data.loading = true;
        await axios.post(`/api/accounting/invoices/${invoiceId}/pay`, { amountPaid: parseFloat(amount) });
        alert('Payment recorded successfully!');
        await this.fetchInvoices();
        this.updateView();
      } catch (error) {
        console.error('Error recording payment:', error);
        alert('Error: ' + (error.response?.data?.message || error.message));
      } finally {
        this.data.loading = false;
      }
    }
  },

  async handleSubmit() {
    try {
      this.data.loading = true;
      await axios.post('/api/accounting/invoices/create', this.data.formData);
      alert('Invoice created successfully!');
      this.data.formData = {
        customer: '',
        lineItems: [{ description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }],
        total: 0,
        status: 'Draft'
      };
      this.data.showForm = false;
      await this.fetchInvoices();
      this.updateView();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  calculateTotal() {
    const total = this.data.formData.lineItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
    return total.toFixed(2);
  },

  render() {
    const { invoices, loading, showForm, filter, formData } = this.data;
    const total = this.calculateTotal();

    return `
      <div class="invoice-container">
        <h2>Invoice Management</h2>

        ${!showForm ? `
          <button onclick="window.invoiceInstance.data.showForm = true; window.invoiceInstance.updateView();" class="btn-create">
            + Create Invoice
          </button>

          <div class="filters">
            <select onchange="window.invoiceInstance.data.filter.status = this.value; window.invoiceInstance.fetchInvoices().then(() => window.invoiceInstance.updateView());">
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        ` : `
          <div class="invoice-form">
            <h3>Create New Invoice</h3>
            <div class="form-group">
              <label>Customer ID</label>
              <input type="text" value="${formData.customer}" onchange="window.invoiceInstance.data.formData.customer = this.value;" required />
            </div>

            <div class="line-items">
              <h4>Line Items</h4>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${formData.lineItems.map((item, index) => `
                    <tr>
                      <td><input type="text" value="${item.description}" onchange="window.invoiceInstance.data.formData.lineItems[${index}].description = this.value;" required /></td>
                      <td><input type="number" step="1" value="${item.quantity}" onchange="window.invoiceInstance.data.formData.lineItems[${index}].quantity = parseFloat(this.value); window.invoiceInstance.updateView();" required /></td>
                      <td><input type="number" step="0.01" value="${item.unitPrice}" onchange="window.invoiceInstance.data.formData.lineItems[${index}].unitPrice = parseFloat(this.value); window.invoiceInstance.data.formData.lineItems[${index}].lineTotal = (this.value * window.invoiceInstance.data.formData.lineItems[${index}].quantity).toFixed(2); window.invoiceInstance.updateView();" required /></td>
                      <td class="amount">$${item.lineTotal.toFixed(2)}</td>
                      <td>${formData.lineItems.length > 1 ? `<button onclick="window.invoiceInstance.data.formData.lineItems.splice(${index}, 1); window.invoiceInstance.updateView();" class="btn-remove">Remove</button>` : ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="line-totals">
                <p>Total: $${total}</p>
              </div>

              <button onclick="window.invoiceInstance.data.formData.lineItems.push({ description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }); window.invoiceInstance.updateView();" class="btn-add">
                Add Line Item
              </button>
            </div>

            <div class="form-actions">
              <button onclick="window.invoiceInstance.handleSubmit();" ${loading ? 'disabled' : ''} class="btn-submit">
                ${loading ? 'Creating...' : 'Create Invoice'}
              </button>
              <button onclick="window.invoiceInstance.data.showForm = false; window.invoiceInstance.updateView();" class="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        `}

        <div class="invoices-list">
          <h3>Invoices</h3>
          ${loading ? '<p>Loading...</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${invoices.map(invoice => `
                  <tr>
                    <td>${invoice.invoiceNumber}</td>
                    <td>${invoice.customer?.name || 'Unknown'}</td>
                    <td>${new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                    <td class="amount">$${(invoice.total || 0).toFixed(2)}</td>
                    <td class="amount">$${(invoice.amountPaid || 0).toFixed(2)}</td>
                    <td>${invoice.status}</td>
                    <td>
                      ${invoice.status === 'Draft' ? `
                        <button onclick="window.invoiceInstance.handleSendInvoice('${invoice._id}');" class="btn-action">Send</button>
                      ` : ''}
                      ${invoice.status !== 'Paid' ? `
                        <button onclick="window.invoiceInstance.handlePayInvoice('${invoice._id}');" class="btn-action">Record Payment</button>
                      ` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>

        <style>
          .invoice-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .btn-create { margin-bottom: 20px; padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .invoice-form { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .form-group { margin-bottom: 15px; }
          .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
          .form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
          .line-items { margin-top: 20px; }
          .line-items table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .line-items th, .line-items td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          .line-items th { background-color: #007bff; color: white; }
          .line-items input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
          .line-totals { background: #e8f4f8; padding: 10px; border-radius: 4px; margin: 10px 0; }
          .amount { text-align: right; font-family: monospace; font-weight: bold; }
          .btn-remove, .btn-add, .btn-submit, .btn-cancel, .btn-action { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .btn-add { background-color: #17a2b8; color: white; margin-top: 10px; }
          .btn-remove { background-color: #dc3545; color: white; }
          .btn-submit { background-color: #28a745; color: white; }
          .btn-submit:disabled { background-color: #ccc; cursor: not-allowed; }
          .btn-cancel { background-color: #6c757d; color: white; }
          .btn-action { background-color: #007bff; color: white; font-size: 0.9em; padding: 6px 10px; margin: 2px; }
          .form-actions { display: flex; gap: 10px; margin-top: 20px; }
          .form-actions button { flex: 1; }
          .invoices-list { background: white; padding: 20px; border-radius: 8px; }
          .invoices-list table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .invoices-list th, .invoices-list td { padding: 12px; border: 1px solid #ddd; text-align: left; }
          .invoices-list th { background-color: #007bff; color: white; }
          .filters { margin-bottom: 15px; }
          .filters select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
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

  init() {
    window.invoiceInstance = this;
    this.fetchInvoices().then(() => this.updateView());
  }
};

export default Invoice;
