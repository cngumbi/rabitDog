import axios from 'axios';

const InvoiceDetails = {
  data: {
    invoice: null,
    loading: false,
    error: null
  },

  async fetchInvoice(id) {
    this.data.loading = true;
    this.data.error = null;
    try {
      const response = await axios.get(`/api/accounting/invoices/${id}`);
      this.data.invoice = response.data;
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      this.data.error = error.response?.data?.message || error.message;
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  async handleSendInvoice(invoiceId) {
    try {
      this.data.loading = true;
      await axios.post(`/api/accounting/invoices/${invoiceId}/send`);
      alert('Invoice sent successfully!');
      await this.fetchInvoice(invoiceId);
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
        await this.fetchInvoice(invoiceId);
      } catch (error) {
        console.error('Error recording payment:', error);
        alert('Error: ' + (error.response?.data?.message || error.message));
      } finally {
        this.data.loading = false;
      }
    }
  },

  formatCurrency(value) {
    return `$${Number(value || 0).toFixed(2)}`;
  },

  render() {
    if (this.data.loading) {
      return `<div class="invoice-details-container"><p>Loading invoice details...</p></div>`;
    }

    if (this.data.error) {
      return `<div class="invoice-details-container"><p class="error">${this.data.error}</p></div>`;
    }

    const invoice = this.data.invoice;
    if (!invoice) {
      return `<div class="invoice-details-container"><p>No invoice found.</p></div>`;
    }

    return `
      <div class="invoice-details-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/budget" class="financial-nav-link">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>

        <h2>Invoice Details</h2>
        <p class="subtitle">Review the invoice line items, status, and customer payment details.</p>

        <div class="invoice-meta">
          <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
          <div><strong>Status:</strong> ${invoice.status}</div>
          <div><strong>Customer ID:</strong> ${invoice.customer?._id || invoice.customer || 'Unknown'}</div>
          <div><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</div>
          <div><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</div>
        </div>

        <div class="invoice-summary">
          <div><strong>Subtotal:</strong> ${this.formatCurrency(invoice.subtotal)}</div>
          <div><strong>Tax:</strong> ${this.formatCurrency(invoice.taxAmount)}</div>
          <div><strong>Discount:</strong> ${this.formatCurrency(invoice.discountAmount)}</div>
          <div><strong>Total:</strong> ${this.formatCurrency(invoice.total)}</div>
          <div><strong>Amount Paid:</strong> ${this.formatCurrency(invoice.amountPaid)}</div>
          <div><strong>Balance Due:</strong> ${this.formatCurrency(invoice.balanceDue)}</div>
        </div>

        <div class="line-items-details">
          <h3>Line Items</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Tax Amount</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems.map((item) => `
                <tr>
                  <td>${item.description || '—'}</td>
                  <td>${item.quantity || 0}</td>
                  <td>${this.formatCurrency(item.unitPrice)}</td>
                  <td>${this.formatCurrency(item.taxAmount)}</td>
                  <td>${this.formatCurrency(item.lineTotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="form-actions">
          <a href="/#/invoices" class="btn-secondary">Back to Invoices</a>
          ${invoice.status === 'Draft' ? `<a href="/#/invoices/${invoice._id}/edit" class="btn-action btn-edit">Edit</a>` : ''}
          ${invoice.status === 'Draft' ? `<button onclick="window.invoiceDetailsInstance.handleSendInvoice('${invoice._id}');" class="btn-action">Send</button>` : ''}
          ${invoice.status !== 'Paid' ? `<button onclick="window.invoiceDetailsInstance.handlePayInvoice('${invoice._id}');" class="btn-action">Record Payment</button>` : ''}
        </div>

        <style>
          .invoice-details-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .invoice-details-container .btn-action { background-color: #007bff; color: white; font-size: 0.9em; padding: 10px 14px; margin: 2px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
          .invoice-details-container .btn-edit { background-color: #ffc107; color: #0f172a; }
          .subtitle { color: #475569; margin-bottom: 20px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .invoice-meta, .invoice-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 20px; }
          .invoice-summary div, .invoice-meta div { background: #f8fafc; padding: 10px 14px; border-radius: 8px; }
          .line-items-details table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .line-items-details th, .line-items-details td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          .line-items-details th { background-color: #007bff; color: white; }
          .form-actions { display: flex; gap: 10px; }
          .btn-secondary { display: inline-flex; align-items: center; justify-content: center; padding: 10px 16px; background: #6c757d; color: white; border-radius: 4px; text-decoration: none; }
          .error { color: #dc3545; }
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
    window.invoiceDetailsInstance = this;
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

export default InvoiceDetails;
