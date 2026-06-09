import DashboardMenu from '../dashboard/dashboardMenu';
import { createExpense, getExpenseStats } from '../../connection/api';

const RecordExpenses = {
    vignette: async () => {
        attachExpenseListeners();
        updateExpenseSummary();
        await loadExpenseStats();
    },
    render: () => {
        return `
        <div class="wrap">
            ${DashboardMenu.render({ selected: "expenses" })}
            <div class="main">
                <section class="dashboard-hero">
                  <div class="dashboard-hero-copy">
                    <span class="dashboard-pill">Expense capture</span>
                    <h1>Record an expense</h1>
                    <p>Log vendor spend, categorize operating costs, and keep payment method and reference details aligned for audit and reconciliation.</p>
                    <div class="dashboard-hero-actions">
                      <a class="btn-primary text-white" href="#/expenses">Back to expenses</a>
                    </div>
                  </div>
                  <div class="dashboard-hero-meta">
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Pending bills</span>
                      <span id="pending-bills-value" class="dashboard-mini-stat-value">0</span>
                      <span class="dashboard-mini-stat-trend">Including utilities</span>
                    </div>
                    <div class="dashboard-mini-stat">
                      <span class="dashboard-mini-stat-label">Recent spend</span>
                      <span id="recent-spend-value" class="dashboard-mini-stat-value">Ksh 0</span>
                      <span class="dashboard-mini-stat-trend">Today’s entries</span>
                    </div>
                  </div>
                </section>

                <section class="dashboard-kpi-grid">
                  <article class="card-metric">
                    <div class="icon">🏷️</div>
                    <div>
                      <div class="metric-title">Expense categories</div>
                      <div id="expense-categories-value" class="metric-value">0</div>
                      <div class="metric-desc metric-desc--info">Categories currently in use</div>
                    </div>
                  </article>
                  <article class="card-metric">
                    <div class="icon">💳</div>
                    <div>
                      <div class="metric-title">Cash payments</div>
                      <div id="cash-payments-value" class="metric-value">0%</div>
                      <div class="metric-desc metric-desc--success">Paid invoices ratio</div>
                    </div>
                  </article>
                  <article class="card-metric">
                    <div class="icon">📅</div>
                    <div>
                      <div class="metric-title">Average approval</div>
                      <div id="average-approval-value" class="metric-value">0h</div>
                      <div class="metric-desc metric-desc--info">Hours to approve</div>
                    </div>
                  </article>
                  <article class="card-metric">
                    <div class="icon">✅</div>
                    <div>
                      <div class="metric-title">Reconciled</div>
                      <div id="reconciled-value" class="metric-value">0%</div>
                      <div class="metric-desc metric-desc--success">Expenses matched</div>
                    </div>
                  </article>
                </section>

                <div id="alert-container"></div>

                <section class="dashboard-enterprise-section">
                  <article class="panel">
                    <div class="card-title">Expense entry</div>

                    <div class="dashboard-form-grid">
                      <div>
                        <label class="form-label">Vendor</label>
                        <input id="expenseVendor" class="form-control" type="text" placeholder="Vendor or supplier name" value="Cleaning Services">
                      </div>
                      <div>
                        <label class="form-label">Category</label>
                        <select id="expenseCategory" class="form-select">
                          <option value="supplies">Feed / Supplies</option>
                          <option value="labor">Labor</option>
                          <option value="transportation">Transport</option>
                          <option value="utilities">Utilities</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label class="form-label">Amount</label>
                        <input id="expenseAmount" class="form-control" type="number" min="0" value="4800">
                      </div>
                      <div>
                        <label class="form-label">Date</label>
                        <input id="expenseInvoiceDate" class="form-control" type="date" value="2026-05-29">
                      </div>
                      <div>
                        <label class="form-label">Reference</label>
                        <input id="expenseInvoiceNumber" class="form-control" placeholder="Invoice or receipt number">
                      </div>
                      <div class="dashboard-form-span-2">
                        <label class="form-label">Description</label>
                        <textarea id="expenseDescription" class="form-control" rows="4" placeholder="Describe the expense">Cleaning and hygiene service for the retail unit.</textarea>
                      </div>
                    </div>

                    <div class="dashboard-action-row mt-3">
                      <button id="save-expense-btn" class="btn-primary text-white">Save expense</button>
                      <button id="reset-expense-btn" class="btn-secondary text-white" type="button">Reset</button>
                    </div>
                  </article>

                  <aside class="dashboard-side-stack">
                    <div class="panel">
                      <div class="card-title">Expense summary</div>
                      <div class="sales-report-summary-list">
                        <div class="sales-report-summary-item">
                          <div class="text-muted">Selected vendor</div>
                          <strong id="summary-vendor">Cleaning Services</strong>
                        </div>
                        <div class="sales-report-summary-item">
                          <div class="text-muted">Estimated total</div>
                          <strong id="summary-total">Ksh 4,800</strong>
                        </div>
                        <div class="sales-report-summary-item">
                          <div class="text-muted">Payment reference</div>
                          <strong id="summary-payment-method">Invoice</strong>
                        </div>
                        <div class="sales-report-summary-item">
                          <div class="text-muted">Reconciliation</div>
                          <strong>Pending</strong>
                        </div>
                      </div>
                    </div>

                    <div class="panel">
                      <div class="card-title">Quick guidance</div>
                      <p class="text-muted">Record expenses with a clear reference number, category, and purpose to make accounting and approval faster.</p>
                    </div>

                    <div class="panel">
                      <div class="card-title">Recent expense entries</div>
                      <div class="table-wrap">
                        <table class="table table-striped mt-2">
                          <thead>
                            <tr><th>Date</th><th>Vendor</th><th>Reference</th><th>Status</th><th>Amount</th></tr>
                          </thead>
                          <tbody id="recent-expense-body">
                            <tr><td colspan="5">Loading recent expenses...</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </aside>
                </section>
            </div>
        </div>
        `;
    }
};

const resetForm = () => {
    const vendorInput = document.querySelector('#expenseVendor');
    const categorySelect = document.querySelector('#expenseCategory');
    const amountInput = document.querySelector('#expenseAmount');
    const invoiceDateInput = document.querySelector('#expenseInvoiceDate');
    const invoiceNumberInput = document.querySelector('#expenseInvoiceNumber');
    const descriptionInput = document.querySelector('#expenseDescription');

    if (vendorInput) vendorInput.value = '';
    if (categorySelect) categorySelect.value = 'supplies';
    if (amountInput) amountInput.value = '';
    if (invoiceDateInput) invoiceDateInput.value = '';
    if (invoiceNumberInput) invoiceNumberInput.value = '';
    if (descriptionInput) descriptionInput.value = '';

    updateExpenseSummary();
};

const updateExpenseSummary = () => {
    const vendor = document.querySelector('#expenseVendor')?.value.trim() || 'Not set';
    const amount = Number(document.querySelector('#expenseAmount')?.value) || 0;
    const reference = document.querySelector('#expenseInvoiceNumber')?.value.trim() || 'Unspecified';

    const summaryVendor = document.querySelector('#summary-vendor');
    const summaryTotal = document.querySelector('#summary-total');
    const summaryPayment = document.querySelector('#summary-payment-method');

    if (summaryVendor) summaryVendor.textContent = vendor;
    if (summaryTotal) summaryTotal.textContent = `Ksh ${amount.toLocaleString()}`;
    if (summaryPayment) summaryPayment.textContent = reference;
};

const loadExpenseStats = async () => {
    const stats = await getExpenseStats();
    if (!stats || stats.error) {
        return;
    }

    const pendingBillsValue = document.querySelector('#pending-bills-value');
    const recentSpendValue = document.querySelector('#recent-spend-value');
    const expenseCategoriesValue = document.querySelector('#expense-categories-value');
    const cashPaymentsValue = document.querySelector('#cash-payments-value');
    const averageApprovalValue = document.querySelector('#average-approval-value');
    const reconciledValue = document.querySelector('#reconciled-value');

    if (pendingBillsValue) pendingBillsValue.textContent = stats.pendingBills != null ? stats.pendingBills : 0;
    if (recentSpendValue) recentSpendValue.textContent = `Ksh ${(stats.recentSpend && Array.isArray(stats.recentSpend) ? stats.recentSpend.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) : 0).toLocaleString()}`;
    if (expenseCategoriesValue) expenseCategoriesValue.textContent = stats.expenseCategories != null ? stats.expenseCategories : 0;
    if (cashPaymentsValue) cashPaymentsValue.textContent = stats.cashPayments != null ? `${stats.cashPayments}%` : '0%';
    if (averageApprovalValue) averageApprovalValue.textContent = stats.averageApproval != null ? `${stats.averageApproval}h` : '0h';
    if (reconciledValue) reconciledValue.textContent = stats.reconciled != null ? `${stats.reconciled}%` : '0%';

    const recentExpenseBody = document.querySelector('#recent-expense-body');
    if (recentExpenseBody) {
        if (stats.recentSpend && Array.isArray(stats.recentSpend) && stats.recentSpend.length > 0) {
            recentExpenseBody.innerHTML = stats.recentSpend.map((expense) => {
                const expenseDate = expense.invoiceDate ? new Date(expense.invoiceDate).toLocaleDateString() : 'N/A';
                const vendor = expense.vendorName || expense.vendor?.name || 'Unknown vendor';
                const reference = expense.invoiceNumber || 'N/A';
                const status = (expense.status || 'draft').charAt(0).toUpperCase() + (expense.status || 'draft').slice(1);
                const amount = Number(expense.amount) || 0;
                return `<tr><td>${expenseDate}</td><td>${vendor}</td><td>${reference}</td><td>${status}</td><td>Ksh ${amount.toLocaleString()}</td></tr>`;
            }).join('');
        } else {
            recentExpenseBody.innerHTML = '<tr><td colspan="5">No recent expense entries available.</td></tr>';
        }
    }
};

const attachExpenseListeners = () => {
    const saveButton = document.querySelector('#save-expense-btn');
    const resetButton = document.querySelector('#reset-expense-btn');
    const vendorInput = document.querySelector('#expenseVendor');
    const amountInput = document.querySelector('#expenseAmount');
    const invoiceDateInput = document.querySelector('#expenseInvoiceDate');
    const invoiceNumberInput = document.querySelector('#expenseInvoiceNumber');
    const descriptionInput = document.querySelector('#expenseDescription');
    const categorySelect = document.querySelector('#expenseCategory');
    const alertContainer = document.querySelector('#alert-container');

    const handleSave = async (event) => {
        event.preventDefault();
        if (!alertContainer) return;

        const vendorName = vendorInput?.value.trim();
        const category = categorySelect?.value;
        const amount = Number(amountInput?.value);
        const invoiceDate = invoiceDateInput?.value;
        const invoiceNumber = invoiceNumberInput?.value.trim();
        const description = descriptionInput?.value.trim();

        if (!vendorName) {
            showAlert(alertContainer, 'error', 'Vendor is required.');
            return;
        }
        if (!category) {
            showAlert(alertContainer, 'error', 'Please select a category.');
            return;
        }
        if (!amount || amount <= 0) {
            showAlert(alertContainer, 'error', 'Amount must be greater than zero.');
            return;
        }
        if (!invoiceDate) {
            showAlert(alertContainer, 'error', 'Date is required.');
            return;
        }
        if (!description) {
            showAlert(alertContainer, 'error', 'Description is required.');
            return;
        }

        try {
            showAlert(alertContainer, 'info', 'Saving expense...');
            const result = await createExpense({
                vendorName,
                category,
                amount,
                invoiceDate,
                invoiceNumber,
                description,
                notes: description,
            });

            if (result.error) {
                showAlert(alertContainer, 'error', result.error);
                return;
            }

            showAlert(alertContainer, 'success', 'Expense created successfully! Redirecting...');
            setTimeout(() => {
                window.location.hash = '/expenses';
            }, 1200);
        } catch (error) {
            showAlert(alertContainer, 'error', `Error saving expense: ${error.message}`);
        }
    };

    if (saveButton) saveButton.addEventListener('click', handleSave);
    if (resetButton) resetButton.addEventListener('click', (event) => {
        event.preventDefault();
        resetForm();
        if (document.querySelector('#alert-container')) {
            document.querySelector('#alert-container').innerHTML = '';
        }
    });

    [vendorInput, amountInput, invoiceDateInput, invoiceNumberInput, descriptionInput, categorySelect].forEach((input) => {
        if (input) input.addEventListener('input', updateExpenseSummary);
    });
};

const showAlert = (container, type, message) => {
    if (!container) return;
    const alertClass = type === 'error' ? 'alert-danger' : type === 'success' ? 'alert-success' : 'alert-info';
    container.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;

    if (type === 'success') {
        setTimeout(() => {
            if (container.innerHTML.includes(message)) {
                container.innerHTML = '';
            }
        }, 3000);
    }
};

export default RecordExpenses;
