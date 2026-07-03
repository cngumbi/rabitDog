import axios from 'axios';
import { getSettings } from '../../localStorage';

const Invoice = {
  data: {
    invoices: [],
    loading: false,
    filter: { status: '' },
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  },

  async fetchInvoices() {
    this.data.loading = true;
    try {
      const params = {
        skip: (this.data.currentPage - 1) * this.data.itemsPerPage,
        limit: this.data.itemsPerPage
      };

      const status = String(this.data.filter.status || '').trim();
      if (status) {
        params.status = status;
      }

      const response = await axios.get('/api/accounting/invoices/list', {
        params,
        withCredentials: true,
      });
      this.data.invoices = response.data.invoices || [];
      this.data.totalItems = response.data.total || 0;
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
      await axios.post(`/api/accounting/invoices/${invoiceId}/send`, {}, { withCredentials: true });
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

  getCurrencySymbol(currency) {
    const symbolMap = {
      'USD': '$',
      'EUR': '€',
      'Ksh': 'Ksh',
      'KES': 'Ksh',
      'GBP': '£'
    };
    return symbolMap[currency] || currency || '$';
  },

  formatCurrency(value, currency) {
    const amount = Number(value || 0);
    const symbol = this.getCurrencySymbol(currency);
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    if (currency === 'EUR') {
      return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);
    }
    if (currency === 'GBP') {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
    }
    return `${symbol}${amount.toFixed(2)}`;
  },

  async handleGenerateInvoice(invoiceId) {
    const printWindow = window.open('about:blank', '_blank');
    if (!printWindow) {
      alert('Unable to open print window. Please allow popups.');
      return;
    }

    printWindow.document.write('<html><head><title>Preparing invoice...</title></head><body><p>Loading invoice preview...</p></body></html>');
    printWindow.document.close();

    try {
      this.data.loading = true;
      const response = await axios.get(`/api/accounting/invoices/${invoiceId}`, { withCredentials: true });
      const invoice = response.data;
      const settings = getSettings();
      const businessName = settings.workspaceName || 'RabitDog Accounting';
      const businessAddress = settings.businessEmail ? `Email: ${settings.businessEmail}` : '123 Finance Lane, Suite 400, Cityville, CA 90210';
      const businessContact = settings.businessEmail ? `Email: ${settings.businessEmail}` : 'Phone: (555) 123-4567 | Email: billing@rabitdog.com';
      const currency = settings.currency || 'Ksh';
      const paymentTerms = invoice.paymentTerms || 'Payment due within 30 days of invoice date. Late payments may be subject to fees.';

      const invoiceHtml = `
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              @page { margin: 12mm; }
              body { font-family: Arial, sans-serif; margin: 0; padding: 16px; color: #1f2937; background: #f8fafc; font-size: 12px; }
              .brand-panel { background: #ffffff; border-radius: 12px; padding: 16px; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06); margin-bottom: 16px; }
              .brand-logo { font-size: 24px; font-weight: 700; color: #1d4ed8; margin-bottom: 4px; }
              .brand-details { color: #475569; line-height: 1.5; font-size: 11px; }
              .invoice-header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
              .invoice-meta, .invoice-summary, .payment-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 16px; }
              .invoice-summary div, .invoice-meta div, .payment-details div { background: #ffffff; border: 1px solid #e5e7eb; padding: 10px; border-radius: 10px; }
              table { width: 100%; border-collapse: collapse; background: #ffffff; margin-bottom: 16px; font-size: 11px; }
              th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
              th { background: #eef2ff; font-weight: 700; }
              td.amount, th.amount { text-align: right; }
              .section-title { margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #0f172a; }
              .payment-terms { padding: 12px; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 10px; color: #0c4a6e; line-height: 1.5; }
              .footer-note { font-size: 11px; color: #64748b; margin-top: 12px; }
              .invoice-table tr { page-break-inside: avoid; }
            </style>
          </head>
          <body>
            <div class="brand-panel">
              <div class="brand-logo">${businessName}</div>
              <div class="brand-details">${businessAddress}<br>${businessContact}</div>
            </div>

            <div class="invoice-header">
              <div>
                <div class="section-title">Bill To</div>
                <div><strong>${invoice.customer?.name || invoice.partyId?.name || invoice.customer || 'Unknown Customer'}</strong></div>
                <div>${invoice.customer?.email || invoice.partyId?.email || ''}</div>
                <div>${invoice.customer?.address || invoice.partyId?.address || ''}</div>
              </div>
              <div>
                <div class="section-title">Invoice Details</div>
                <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
                <div><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</div>
                <div><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Status:</strong> ${invoice.status}</div>
              </div>
            </div>

            <div class="invoice-summary">
              <div><strong>Subtotal</strong><br>${this.formatCurrency(invoice.subtotal, currency)}</div>
              <div><strong>Tax</strong><br>${this.formatCurrency(invoice.taxAmount, currency)}</div>
              <div><strong>Discount</strong><br>${this.formatCurrency(invoice.discountAmount, currency)}</div>
              <div><strong>Total</strong><br>${this.formatCurrency(invoice.total, currency)}</div>
              <div><strong>Amount Paid</strong><br>${this.formatCurrency(invoice.amountPaid, currency)}</div>
              <div><strong>Balance Due</strong><br>${this.formatCurrency(invoice.balanceDue, currency)}</div>
            </div>

            <div>
              <div class="section-title">Items</div>
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Tax</th>
                    <th class="amount">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${Array.isArray(invoice.lineItems) && invoice.lineItems.length ? invoice.lineItems.map(item => `
                    <tr>
                      <td>${item.description || '—'}</td>
                      <td>${item.quantity || 0}</td>
                      <td>${this.formatCurrency(item.unitPrice, currency)}</td>
                      <td>${this.formatCurrency(item.taxAmount, currency)}</td>
                      <td class="amount">${this.formatCurrency(item.lineTotal, currency)}</td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="5">No line items found.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>

            <div class="payment-details">
              <div>
                <div class="section-title">Payment Terms</div>
                <div class="payment-terms">${paymentTerms}</div>
              </div>
              <div>
                <div class="section-title">Payment Instructions</div>
                <div>Please make payment to:<br><strong>${businessName}</strong></div>
              </div>
            </div>

            <div class="footer-note">Thank you for your business. If you have questions about this invoice, please contact ${businessContact}.</div>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error('Error generating invoice:', error);
      printWindow.close();
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
        await axios.post(`/api/accounting/invoices/${invoiceId}/pay`, { amountPaid: parseFloat(amount) }, { withCredentials: true });
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

  getPaginatedInvoices() {
    return this.data.invoices || [];
  },

  async handlePageChange(page) {
    const totalPages = Math.max(1, Math.ceil(this.data.totalItems / this.data.itemsPerPage));
    if (page < 1 || page > totalPages || page === this.data.currentPage) return;
    this.data.currentPage = page;
    await this.fetchInvoices();
    this.updateView();
  },

  async handleFilterChange(status) {
    this.data.filter.status = status;
    this.data.currentPage = 1;
    await this.fetchInvoices();
    this.updateView();
  },

  render() {
    const settings = getSettings();
    const currency = settings.currency || 'Ksh';
    const { invoices, loading, filter, currentPage, itemsPerPage, totalItems } = this.data;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const visibleInvoices = this.getPaginatedInvoices();

    return `
      <div class="invoice-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/budget" class="financial-nav-link">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link active">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>

        <div class="invoice-header-row">
          <div>
            <h2 class="page-title">Invoice Management</h2>
            <p class="page-subtitle">Create and manage invoices for your business.</p>
          </div>
          <div class="invoice-actions-row">
            <a href="#/invoices/create" class="btn-create">+ Create Invoice</a>
            <a href="#/financial-reports/invoice-aging" class="btn-secondary">Invoice Aging Report</a>
            <div class="filters">
              <select data-status-filter>
                <option value="" ${filter.status === '' ? 'selected' : ''}>All Status</option>
                <option value="Draft" ${filter.status === 'Draft' ? 'selected' : ''}>Draft</option>
                <option value="Sent" ${filter.status === 'Sent' ? 'selected' : ''}>Sent</option>
                <option value="Paid" ${filter.status === 'Paid' ? 'selected' : ''}>Paid</option>
                <option value="Partially Paid" ${filter.status === 'Partially Paid' ? 'selected' : ''}>Partially Paid</option>
                <option value="Overdue" ${filter.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
              </select>
            </div>
          </div>
        </div>

        <div class="invoices-list">
          <h3>Invoices</h3>
          ${loading ? '<p>Loading...</p>' : `
            <table class="invoice-list-table">
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
                ${visibleInvoices.map(invoice => `
                  <tr>
                    <td>${invoice.invoiceNumber}</td>
                    <td>${invoice.customer?.name || invoice.partyId?.name || invoice.customer || 'Unknown'}</td>
                    <td>${new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                    <td class="amount">${this.formatCurrency(invoice.total, currency)}</td>
                    <td class="amount">${this.formatCurrency(invoice.amountPaid, currency)}</td>
                    <td>${invoice.status}</td>
                    <td class="actions-cell">
                      <a href="#/invoices/${invoice._id}" class="btn-action btn-view">View</a>
                      ${invoice.status === 'Draft' ? `
                        <a href="#/invoices/${invoice._id}/edit" class="btn-action btn-edit">Edit</a>
                        <button type="button" data-send-invoice="${invoice._id}" class="btn-action">Send</button>
                      ` : ''}
                      ${invoice.status !== 'Paid' ? `
                        <button type="button" data-generate-invoice="${invoice._id}" class="btn-action">Generate Invoice</button>
                      ` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="pagination-container">
              <button type="button" class="pagination-button" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
              ${Array.from({ length: totalPages }, (_, index) => `
                <button type="button" class="pagination-button ${currentPage === index + 1 ? 'active' : ''}" data-page="${index + 1}">${index + 1}</button>
              `).join('')}
              <button type="button" class="pagination-button" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
            </div>
          `}
        </div>

        <style>
          .invoice-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .page-header-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 18px; padding: 24px; box-shadow: 0 18px 38px rgba(15, 23, 42, 0.06); margin-bottom: 24px; }
          .invoice-header-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; align-items: flex-end; }
          .page-title { margin: 0 0 6px; font-size: 28px; }
          .page-subtitle { margin: 0; color: #475569; }
          .invoice-actions-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
          .btn-secondary { padding: 12px 22px; background-color: #10b981; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
          .pagination-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; align-items: center; }
          .pagination-button { padding: 8px 12px; background: #f3f4f6; color: #111827; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; }
          .pagination-button.active { background: #2563eb; color: white; border-color: #2563eb; }
          .pagination-button:disabled { background: #e5e7eb; color: #6b7280; cursor: not-allowed; }
          .invoices-list { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08); }
          .btn-create { padding: 12px 22px; background-color: #2563eb; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
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
          .btn-action { background-color: #007bff; color: white; font-size: 0.9em; padding: 6px 10px; margin: 2px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
          .btn-view { background-color: #17a2b8; }
          .btn-edit { background-color: #ffc107; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .financial-nav-link.active { background: #007bff; color: white; }
          .filters { margin: 0; }
          .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; background: #fff; min-width: 190px; }
          .invoice-list-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .invoice-list-table th, .invoice-list-table td { padding: 14px 12px; border-bottom: 1px solid #e5e7eb; }
          .invoice-list-table th { background: #f8fafc; color: #0f172a; font-weight: 700; }
          .invoice-list-table tr:hover { background: #f8fafc; }
          .actions-cell { white-space: nowrap; }
          .btn-action { min-width: 90px; }
          @media (max-width: 900px) {
            .invoice-header-row { flex-direction: column; align-items: stretch; }
          }
        </style>
      </div>
    `;
  },

  registerEvents() {
    const container = document.getElementById('main-content');
    if (!container) return;

    const statusFilter = container.querySelector('[data-status-filter]');
    if (statusFilter) {
      statusFilter.value = this.data.filter.status || '';
      statusFilter.addEventListener('change', (event) => {
        this.handleFilterChange(event.target.value);
      });
    }

    container.querySelectorAll('[data-generate-invoice]').forEach((button) => {
      const invoiceId = button.dataset.generateInvoice;
      button.addEventListener('click', () => this.handleGenerateInvoice(invoiceId));
    });

    container.querySelectorAll('[data-send-invoice]').forEach((button) => {
      const invoiceId = button.dataset.sendInvoice;
      button.addEventListener('click', () => this.handleSendInvoice(invoiceId));
    });

    container.querySelectorAll('[data-page]').forEach((button) => {
      const page = parseInt(button.dataset.page, 10);
      if (!Number.isNaN(page)) {
        button.addEventListener('click', () => this.handlePageChange(page));
      }
    });
  },

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
      this.registerEvents();
    }
  },

  async init() {
    window.invoiceInstance = this;
    await this.fetchInvoices();
    this.updateView();
  },

  vignette() {
    return this.init();
  }
};

export default Invoice;
