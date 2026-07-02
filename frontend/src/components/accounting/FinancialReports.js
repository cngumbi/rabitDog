import axios from 'axios';

const FinancialReports = {
  data: {
    reportType: 'trial-balance',
    reportData: null,
    loading: false,
    params: {
      startDate: '',
      endDate: '',
      fiscalYear: new Date().getFullYear(),
      asOf: new Date().toISOString().split('T')[0]
    }
  },

  reportTypes: [
    { value: 'trial-balance', label: 'Trial Balance' },
    { value: 'income-statement', label: 'Income Statement' },
    { value: 'balance-sheet', label: 'Balance Sheet' },
    { value: 'cash-flow-statement', label: 'Cash Flow Statement' },
    { value: 'receivables-aging', label: 'Accounts Receivable Aging' },
    { value: 'payables-aging', label: 'Accounts Payable Aging' },
    { value: 'financial-ratios', label: 'Financial Ratios' }
  ],

  async generateReport() {
    try {
      this.data.loading = true;
      const endpoint = `/api/accounting/reports/${this.data.reportType}`;
      const response = await axios.get(endpoint, { params: this.data.params });
      this.data.reportData = response.data;
      this.updateView();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      this.data.loading = false;
    }
  },

  render() {
    const { reportType, reportData, loading, params } = this.data;
    let reportContent = '';

    if (loading) {
      reportContent = '<p>Loading...</p>';
    } else if (reportData) {
      if (reportType === 'trial-balance') {
        reportContent = `
          <div>
            <h3>Trial Balance Report</h3>
            <p>Period: ${reportData.period?.startDate || 'Beginning'} to ${reportData.period?.endDate || 'Now'}</p>
            <table class="report-table">
              <thead><tr><th>Account Code</th><th>Account Name</th><th>Debit</th><th>Credit</th></tr></thead>
              <tbody>
                ${reportData.accounts?.map(acc => `<tr><td>${acc.accountCode}</td><td>${acc.accountName}</td><td class="amount">$${(acc.debit||0).toFixed(2)}</td><td class="amount">$${(acc.credit||0).toFixed(2)}</td></tr>`).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row"><td colspan="2">TOTALS</td><td class="amount">$${(reportData.totals?.totalDebits||0).toFixed(2)}</td><td class="amount">$${(reportData.totals?.totalCredits||0).toFixed(2)}</td></tr>
                <tr class="${reportData.totals?.isBalanced ? 'balanced' : 'unbalanced'}"><td colspan="4">${reportData.totals?.isBalanced ? '✓ Balanced' : '✗ Not Balanced'}</td></tr>
              </tfoot>
            </table>
          </div>
        `;
      } else if (reportType === 'income-statement') {
        reportContent = `
          <div>
            <h3>Income Statement</h3>
            <p>Period: ${reportData.period?.startDate || 'Beginning'} to ${reportData.period?.endDate || 'Now'}</p>
            <div class="statement-section">
              <h4>Revenues</h4>
              <table class="report-table"><tbody>
                ${reportData.revenues?.items?.map(item => `<tr><td>${item.accountName}</td><td class="amount">$${item.amount.toFixed(2)}</td></tr>`).join('')}
                <tr class="subtotal-row"><td>Total Revenues</td><td class="amount">$${reportData.revenues?.total?.toFixed(2)}</td></tr>
              </tbody></table>
            </div>
            <div class="statement-section">
              <h4>Cost of Goods Sold</h4>
              <table class="report-table"><tbody>
                ${reportData.costOfGoodsSold?.items?.map(item => `<tr><td>${item.accountName}</td><td class="amount">$${item.amount.toFixed(2)}</td></tr>`).join('')}
                <tr class="subtotal-row"><td>Total COGS</td><td class="amount">$${reportData.costOfGoodsSold?.total?.toFixed(2)}</td></tr>
              </tbody></table>
            </div>
            <div class="statement-section highlight">
              <p>Gross Profit: <span class="amount">$${reportData.grossProfit?.toFixed(2)}</span></p>
            </div>
            <div class="statement-section">
              <h4>Operating Expenses</h4>
              <table class="report-table"><tbody>
                ${reportData.operatingExpenses?.items?.map(item => `<tr><td>${item.accountName}</td><td class="amount">$${item.amount.toFixed(2)}</td></tr>`).join('')}
                <tr class="subtotal-row"><td>Total Expenses</td><td class="amount">$${reportData.operatingExpenses?.total?.toFixed(2)}</td></tr>
              </tbody></table>
            </div>
            <div class="statement-section total-section">
              <p>Net Income: <span class="amount bold">$${reportData.netIncome?.toFixed(2)}</span></p>
            </div>
          </div>
        `;
      } else if (reportType === 'balance-sheet') {
        reportContent = `
          <div>
            <h3>Balance Sheet</h3>
            <p>As of: ${reportData.period?.asOf}</p>
            <div class="balance-sheet">
              <div class="column">
                <h4>ASSETS</h4>
                <table class="report-table"><tbody>
                  ${reportData.assets?.items?.map(item => `<tr><td>${item.accountName}</td><td class="amount">$${item.amount.toFixed(2)}</td></tr>`).join('')}
                  <tr class="total-row"><td>Total Assets</td><td class="amount bold">$${reportData.assets?.total?.toFixed(2)}</td></tr>
                </tbody></table>
              </div>
              <div class="column">
                <h4>LIABILITIES</h4>
                <table class="report-table"><tbody>
                  ${reportData.liabilities?.items?.map(item => `<tr><td>${item.accountName}</td><td class="amount">$${item.amount.toFixed(2)}</td></tr>`).join('')}
                  <tr class="subtotal-row"><td>Total Liabilities</td><td class="amount">$${reportData.liabilities?.total?.toFixed(2)}</td></tr>
                </tbody></table>
                <h4>EQUITY</h4>
                <table class="report-table"><tbody>
                  ${reportData.equity?.items?.map(item => `<tr><td>${item.accountName}</td><td class="amount">$${item.amount.toFixed(2)}</td></tr>`).join('')}
                  <tr class="subtotal-row"><td>Total Equity</td><td class="amount">$${reportData.equity?.total?.toFixed(2)}</td></tr>
                  <tr class="total-row"><td>Total Liabilities & Equity</td><td class="amount bold">$${((reportData.liabilities?.total||0) + (reportData.equity?.total||0)).toFixed(2)}</td></tr>
                </tbody></table>
              </div>
            </div>
          </div>
        `;
      } else if (reportType === 'financial-ratios') {
        reportContent = `
          <div>
            <h3>Financial Ratios</h3>
            <div class="ratio-section">
              <h4>Liquidity Ratios</h4>
              <p><span>Current Ratio</span><span>${reportData.ratios?.liquidity?.currentRatio?.toFixed(2)}</span></p>
              <p><span>Quick Ratio</span><span>${reportData.ratios?.liquidity?.quickRatio?.toFixed(2)}</span></p>
            </div>
            <div class="ratio-section">
              <h4>Solvency Ratios</h4>
              <p><span>Debt-to-Equity</span><span>${reportData.ratios?.solvency?.debtToEquity?.toFixed(2)}</span></p>
              <p><span>Equity Multiplier</span><span>${reportData.ratios?.solvency?.equityMultiplier?.toFixed(2)}</span></p>
              <p><span>Debt Ratio</span><span>${reportData.ratios?.solvency?.debtRatio?.toFixed(2)}</span></p>
            </div>
            <div class="ratio-section">
              <h4>Profitability Ratios</h4>
              <p><span>Gross Profit Margin</span><span>${reportData.ratios?.profitability?.grossProfitMargin?.toFixed(2)}%</span></p>
              <p><span>Net Profit Margin</span><span>${reportData.ratios?.profitability?.netProfitMargin?.toFixed(2)}%</span></p>
              <p><span>Return on Assets (ROA)</span><span>${reportData.ratios?.profitability?.returnOnAssets?.toFixed(2)}%</span></p>
              <p><span>Return on Equity (ROE)</span><span>${reportData.ratios?.profitability?.returnOnEquity?.toFixed(2)}%</span></p>
            </div>
            <div class="ratio-section">
              <h4>Efficiency Ratios</h4>
              <p><span>Asset Turnover</span><span>${reportData.ratios?.efficiency?.assetTurnover?.toFixed(2)}</span></p>
              <p><span>Equity Turnover</span><span>${reportData.ratios?.efficiency?.equityTurnover?.toFixed(2)}</span></p>
            </div>
          </div>
        `;
      }
    }

    return `
      <div class="financial-reports-container">
        <div class="financial-nav">
          <a href="/#/cashbank" class="financial-nav-link">Cashbook</a>
          <a href="/#/budget" class="financial-nav-link">Budgets</a>
          <a href="/#/financial-reports" class="financial-nav-link active">Financial Reports</a>
          <a href="/#/invoices" class="financial-nav-link">Invoices</a>
          <a href="/#/journal-entries" class="financial-nav-link">Journal Entries</a>
        </div>
        <h2>Financial Reports</h2>

        <div class="report-controls">
          <div class="control-group">
            <label>Report Type:</label>
            <select onchange="window.financialReportsInstance.data.reportType = this.value;">
              ${this.reportTypes.map(type => `<option value="${type.value}">${type.label}</option>`).join('')}
            </select>
          </div>

          <div class="control-group">
            <label>Fiscal Year:</label>
            <input type="number" value="${params.fiscalYear}" onchange="window.financialReportsInstance.data.params.fiscalYear = this.value;" />
          </div>

          <button onclick="window.financialReportsInstance.generateReport();" ${loading ? 'disabled' : ''} class="btn-generate">
            ${loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        <div class="report-content">
          ${reportContent}
        </div>

        <style>
          .financial-reports-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
          .report-controls { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap; }
          .control-group { flex: 1; min-width: 200px; }
          .control-group label { display: block; margin-bottom: 5px; font-weight: bold; }
          .control-group input, .control-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          .btn-generate { padding: 8px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .btn-generate:disabled { background-color: #ccc; cursor: not-allowed; }
          .report-content { background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
          .report-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .report-table th, .report-table td { padding: 12px; border: 1px solid #ddd; text-align: left; }
          .report-table th { background-color: #007bff; color: white; }
          .amount { text-align: right; font-family: monospace; }
          .total-row { background-color: #e8f4f8; font-weight: bold; }
          .subtotal-row { background-color: #f0f0f0; font-weight: bold; }
          .balanced { background-color: #d4edda; color: green; font-weight: bold; }
          .unbalanced { background-color: #f8d7da; color: red; font-weight: bold; }
          .statement-section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px; }
          .statement-section h4 { margin-top: 0; color: #333; }
          .statement-section.highlight { background: #e8f4f8; font-weight: bold; font-size: 1.1em; }
          .statement-section.total-section { background: #d4edda; font-weight: bold; font-size: 1.2em; color: green; }
          .balance-sheet { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
          .column h4 { background: #007bff; color: white; padding: 10px; border-radius: 4px; }
          .ratio-section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px; }
          .financial-nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .financial-nav-link { padding: 8px 12px; border-radius: 999px; background: #e2e8f0; color: #0f172a; text-decoration: none; font-weight: 600; }
          .financial-nav-link.active { background: #007bff; color: white; }
          .ratio-section h4 { margin-top: 0; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          .ratio-section p { margin: 8px 0; display: flex; justify-content: space-between; }
          .bold { font-weight: bold; }
          @media (max-width: 768px) { .balance-sheet { grid-template-columns: 1fr; } .report-controls { flex-direction: column; align-items: stretch; } .control-group { min-width: auto; } }
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
    window.financialReportsInstance = this;
    this.generateReport();
  }
};

export default FinancialReports;
