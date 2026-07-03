import { apiClient } from '../../connection/api';
import { getUserInfo } from '../../localStorage';

const InvoiceDetails = {
  data: {
    invoice: null,
    loading: false,
    error: null,
    paymentAmount: '',
    paymentMethod: 'Cash',
    paymentNote: ''
  },

  async fetchInvoice(id) {
    this.data.loading = true;
    this.data.error = null;
    try {
      const response = await apiClient.get(`/api/accounting/invoices/${id}`);
      this.data.invoice = response.data;
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      this.data.error = error.response?.data?.message || error.message;
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  async handleGenerateInvoice(invoiceId) {
    try {
      const invoice = this.data.invoice;
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Unable to open print window. Please allow popups.');
        return;
      }

      const invoiceHtml = `
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; color: #1f2937; }
              .invoice-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
              .invoice-header h1 { margin: 0; font-size: 28px; }
              .invoice-meta, .invoice-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 24px; }
              .invoice-summary div, .invoice-meta div { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
              th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
              th { background: #f8fafc; }
              .amount { text-align: right; }
            </style>
          </head>
          <body>
            <div class="invoice-header">
              <div>
                <h1>Invoice ${invoice.invoiceNumber}</h1>
                <p>${invoice.customer?.name || invoice.partyId?.name || invoice.customer || 'Unknown'}</p>
              </div>
              <div>
                <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div class="invoice-summary">
              <div><strong>Subtotal:</strong> ${this.formatCurrency(invoice.subtotal)}</div>
              <div><strong>Tax:</strong> ${this.formatCurrency(invoice.taxAmount)}</div>
              <div><strong>Discount:</strong> ${this.formatCurrency(invoice.discountAmount)}</div>
              <div><strong>Total:</strong> ${this.formatCurrency(invoice.total)}</div>
              <div><strong>Amount Paid:</strong> ${this.formatCurrency(invoice.amountPaid)}</div>
              <div><strong>Balance Due:</strong> ${this.formatCurrency(invoice.balanceDue)}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Tax Amount</th>
                  <th class="amount">Line Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.lineItems.map((item) => `
                  <tr>
                    <td>${item.description || '—'}</td>
                    <td>${item.quantity || 0}</td>
                    <td>${this.formatCurrency(item.unitPrice)}</td>
                    <td>${this.formatCurrency(item.taxAmount)}</td>
                    <td class="amount">${this.formatCurrency(item.lineTotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <p><strong>Notes:</strong> ${invoice.notes || 'None'}</p>
          </body>
        </html>
      `;

      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error('Error generating invoice print view:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  },

  async handleSendInvoice(invoiceId) {
    try {
      this.data.loading = true;
      const response = await apiClient.post(`/api/accounting/invoices/${invoiceId}/send`);
      const message = response.data?.message || 'Invoice sent successfully!';
      alert(message);
      await this.fetchInvoice(invoiceId);
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  async handleRecordPayment(invoiceId) {
    const amount = Number(this.data.paymentAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    try {
      this.data.loading = true;
      await apiClient.post(
        `/api/accounting/invoices/${invoiceId}/pay`,
        {
          amountPaid: amount,
          paymentMethod: this.data.paymentMethod,
          paymentNote: this.data.paymentNote
        }
      );
      alert('Payment recorded successfully!');
      this.data.paymentAmount = '';
      this.data.paymentNote = '';
      await this.fetchInvoice(invoiceId);
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
      this.updateView();
    }
  },

  handlePaymentFieldChange(field, value) {
    this.data[field] = value;
  },

  registerEvents() {
    const container = document.getElementById('main-content');
    if (!container) return;

    container.querySelectorAll('[data-payment-input]').forEach((input) => {
      input.addEventListener('input', (event) => {
        const field = input.dataset.paymentInput;
        this.handlePaymentFieldChange(field, event.target.value);
      });
    });

    const generateInvoiceButton = container.querySelector('[data-generate-invoice]');
    if (generateInvoiceButton) {
      generateInvoiceButton.addEventListener('click', () => this.handleGenerateInvoice(this.data.invoice._id));
    }

    const recordPaymentButton = container.querySelector('[data-record-payment]');
    if (recordPaymentButton) {
      recordPaymentButton.addEventListener('click', () => this.handleRecordPayment(this.data.invoice._id));
    }

    const sendInvoiceButton = container.querySelector('[data-send-invoice]');
    if (sendInvoiceButton) {
      sendInvoiceButton.addEventListener('click', () => this.handleSendInvoice(this.data.invoice._id));
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
          <div><strong>Customer:</strong> ${invoice.customer?.name || invoice.partyId?.name || invoice.customer || 'Unknown'}</div>
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

        ${invoice.status !== 'Paid' ? `
        <div class="payment-section">
          <h3>Record Payment</h3>
          <div class="payment-form-row">
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              value="${this.data.paymentAmount}"
              data-payment-input="paymentAmount"
              placeholder="Enter payment amount"
            />
          </div>
          <div class="payment-form-row">
            <label>Payment Method</label>
            <select
              data-payment-input="paymentMethod"
            >
              <option value="Cash" ${this.data.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
              <option value="Bank Transfer" ${this.data.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
              <option value="Mobile Money" ${this.data.paymentMethod === 'Mobile Money' ? 'selected' : ''}>Mobile Money</option>
              <option value="Credit Card" ${this.data.paymentMethod === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
            </select>
          </div>
          <div class="payment-form-row">
            <label>Payment Note</label>
            <textarea
              rows="3"
              data-payment-input="paymentNote"
              placeholder="Optional note"
            >${this.data.paymentNote || ''}</textarea>
          </div>
          <button type="button" class="btn-action btn-pay" data-record-payment>Record Payment</button>
        </div>
        ` : ''}

        <div class="form-actions">
          <a href="/#/invoices" class="btn-secondary">Back to Invoices</a>
          ${invoice.status === 'Draft' ? `<a href="/#/invoices/${invoice._id}/edit" class="btn-action btn-edit">Edit</a>` : ''}
          ${invoice.status === 'Draft' ? `<button type="button" class="btn-action" data-send-invoice>Send</button>` : ''}
          <button type="button" class="btn-action btn-generate" data-generate-invoice>Generate Invoice</button>
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
          .form-actions { display: flex; gap: 10px; flex-wrap: wrap; }
          .payment-section { background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .payment-section h3 { margin-bottom: 16px; }
          .payment-form-row { display: grid; gap: 8px; margin-bottom: 12px; }
          .payment-form-row label { font-weight: 600; }
          .payment-form-row input,
          .payment-form-row select,
          .payment-form-row textarea { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; }
          .btn-pay { background-color: #10b981; color: white; }
          .btn-generate { background-color: #6366f1; color: white; }
          .btn-secondary { display: inline-flex; align-items: center; justify-content: center; padding: 10px 16px; background: #6c757d; color: white; border-radius: 4px; text-decoration: none; }
          .error { color: #dc3545; }
        </style>
      </div>
    `;
  },

  updateView() {
    window.invoiceDetailsInstance = this;
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
      this.registerEvents();
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
