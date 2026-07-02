import axios from 'axios';

const Invoice = {
  data: {
    invoices: [],
    loading: false,
    filter: { status: '' }
  },

  async fetchInvoices() {
    this.data.loading = true;
    try {
      const response = await axios.get('/api/accounting/invoices/list', {
        params: this.data.filter,
        withCredentials: true,
      });
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

  render() {
    const { invoices, loading, filter } = this.data;

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
                ${invoices.map(invoice => `
                  <tr>
                    <td>${invoice.invoiceNumber}</td>
                    <td>${invoice.customer?.name || invoice.partyId?.name || invoice.customer || 'Unknown'}</td>
                    <td>${new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                    <td class="amount">$${(invoice.total || 0).toFixed(2)}</td>
                    <td class="amount">$${(invoice.amountPaid || 0).toFixed(2)}</td>
                    <td>${invoice.status}</td>
                    <td class="actions-cell">
                      <a href="#/invoices/${invoice._id}" class="btn-action btn-view">View</a>
                      ${invoice.status === 'Draft' ? `
                        <a href="#/invoices/${invoice._id}/edit" class="btn-action btn-edit">Edit</a>
                        <button onclick="window.invoiceInstance.handleSendInvoice('${invoice._id}');" class="btn-action">Send</button>
                      ` : ''}
                      ${invoice.status !== 'Paid' ? `
                        <button onclick="window.invoiceInstance.handlePayInvoice('${invoice._id}');" class="btn-action">Generate PDF</button>
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
          .page-header-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 18px; padding: 24px; box-shadow: 0 18px 38px rgba(15, 23, 42, 0.06); margin-bottom: 24px; }
          .invoice-header-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; align-items: flex-end; }
          .page-title { margin: 0 0 6px; font-size: 28px; }
          .page-subtitle { margin: 0; color: #475569; }
          .invoice-actions-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
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

  updateView() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
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
