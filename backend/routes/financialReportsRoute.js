const express = require('express');
const asyncHandler = require('express-async-handler');
const ChartOfAccounts = require('../models/chartOfAccountsModel');
const JournalEntry = require('../models/journalEntryModel');
const Invoice = require('../models/invoiceModel');
const Bill = require('../models/billModel');
const FinancialStatement = require('../models/financialStatementModel');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Generate Trial Balance Report
router.get(
  '/trial-balance',
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const filter = { isActive: true };
    let dateFilter = {};

    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    const accounts = await ChartOfAccounts.find(filter);
    
    const trialBalance = [];
    let totalDebits = 0;
    let totalCredits = 0;

    for (const account of accounts) {
      const debitBalance = account.normalBalance === 'Debit' ? account.currentBalance : 0;
      const creditBalance = account.normalBalance === 'Credit' ? account.currentBalance : 0;

      if (debitBalance !== 0 || creditBalance !== 0) {
        trialBalance.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          accountType: account.accountType,
          debit: debitBalance,
          credit: creditBalance
        });

        totalDebits += debitBalance;
        totalCredits += creditBalance;
      }
    }

    res.json({
      reportType: 'Trial Balance',
      period: { startDate, endDate },
      accounts: trialBalance,
      totals: {
        totalDebits: totalDebits.toFixed(2),
        totalCredits: totalCredits.toFixed(2),
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
      }
    });
  })
);

// Generate Income Statement
router.get(
  '/income-statement',
  asyncHandler(async (req, res) => {
    const { startDate, endDate, fiscalYear } = req.query;

    const accounts = await ChartOfAccounts.find({
      accountType: { $in: ['Income', 'Expense', 'Cost of Goods Sold'] },
      isActive: true
    });

    let revenues = 0;
    let cogs = 0;
    let expenses = 0;

    const incomeItems = [];
    const cogsItems = [];
    const expenseItems = [];

    for (const account of accounts) {
      if (account.accountType === 'Income') {
        revenues += account.currentBalance;
        incomeItems.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          amount: account.currentBalance
        });
      } else if (account.accountType === 'Cost of Goods Sold') {
        cogs += account.currentBalance;
        cogsItems.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          amount: account.currentBalance
        });
      } else if (account.accountType === 'Expense') {
        expenses += account.currentBalance;
        expenseItems.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          amount: account.currentBalance
        });
      }
    }

    const grossProfit = revenues - cogs;
    const operatingIncome = grossProfit - expenses;

    res.json({
      reportType: 'Income Statement',
      period: { startDate, endDate, fiscalYear },
      revenues: {
        total: revenues,
        items: incomeItems
      },
      costOfGoodsSold: {
        total: cogs,
        items: cogsItems
      },
      grossProfit,
      operatingExpenses: {
        total: expenses,
        items: expenseItems
      },
      operatingIncome,
      netIncome: operatingIncome
    });
  })
);

// Generate Balance Sheet
router.get(
  '/balance-sheet',
  asyncHandler(async (req, res) => {
    const { asOf, fiscalYear } = req.query;

    const accounts = await ChartOfAccounts.find({
      accountType: { $in: ['Asset', 'Liability', 'Equity'] },
      isActive: true
    });

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    const assets = [];
    const liabilities = [];
    const equities = [];

    for (const account of accounts) {
      if (account.accountType === 'Asset') {
        totalAssets += account.currentBalance;
        assets.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          amount: account.currentBalance
        });
      } else if (account.accountType === 'Liability') {
        totalLiabilities += account.currentBalance;
        liabilities.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          amount: account.currentBalance
        });
      } else if (account.accountType === 'Equity') {
        totalEquity += account.currentBalance;
        equities.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          amount: account.currentBalance
        });
      }
    }

    res.json({
      reportType: 'Balance Sheet',
      period: { asOf, fiscalYear },
      assets: {
        items: assets,
        total: totalAssets
      },
      liabilities: {
        items: liabilities,
        total: totalLiabilities
      },
      equity: {
        items: equities,
        total: totalEquity
      },
      validation: {
        assetsEqualsLiabilitiesPlusEquity: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
      }
    });
  })
);

// Generate Cash Flow Statement
router.get(
  '/cash-flow-statement',
  asyncHandler(async (req, res) => {
    const { startDate, endDate, fiscalYear } = req.query;

    // Get cash accounts
    const cashAccounts = await ChartOfAccounts.find({
      accountType: 'Asset',
      accountName: { $regex: /cash|bank/i },
      isActive: true
    });

    // Get operating cash flows from journal entries
    const operatingEntries = await JournalEntry.find({
      entryType: { $in: ['Sales', 'Expense', 'Purchase'] },
      status: 'Posted',
      ...(startDate || endDate ? { entryDate: {} } : {})
    });

    if (startDate) operatingEntries.filter(e => new Date(e.entryDate) >= new Date(startDate));
    if (endDate) operatingEntries.filter(e => new Date(e.entryDate) <= new Date(endDate));

    let operatingCashFlow = 0;
    let investingCashFlow = 0;
    let financingCashFlow = 0;

    operatingEntries.forEach(entry => {
      if (entry.entryType === 'Sales' || entry.entryType === 'Expense') {
        operatingCashFlow += entry.totalCredit;
      } else if (entry.entryType === 'Purchase') {
        operatingCashFlow -= entry.totalDebit;
      }
    });

    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

    res.json({
      reportType: 'Cash Flow Statement',
      period: { startDate, endDate, fiscalYear },
      operatingActivities: {
        cashInflow: operatingCashFlow,
        description: 'Net cash from operating activities'
      },
      investingActivities: {
        cashOutflow: investingCashFlow,
        description: 'Net cash from investing activities'
      },
      financingActivities: {
        cashOutflow: financingCashFlow,
        description: 'Net cash from financing activities'
      },
      netCashFlow,
      summary: {
        totalOperating: operatingCashFlow,
        totalInvesting: investingCashFlow,
        totalFinancing: financingCashFlow,
        netIncrease: netCashFlow
      }
    });
  })
);

// Generate Accounts Receivable Aging Report
router.get(
  '/receivables-aging',
  asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({
      status: { $in: ['Sent', 'Partially Paid', 'Overdue'] }
    }).populate('customer');

    const now = new Date();
    const agingCategories = {
      current: { amount: 0, count: 0, invoices: [] },
      days30: { amount: 0, count: 0, invoices: [] },
      days60: { amount: 0, count: 0, invoices: [] },
      days90: { amount: 0, count: 0, invoices: [] },
      over90: { amount: 0, count: 0, invoices: [] }
    };

    invoices.forEach(invoice => {
      const daysOverdue = Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24));
      const balance = invoice.total - invoice.amountPaid;

      let category;
      if (daysOverdue <= 0) category = 'current';
      else if (daysOverdue <= 30) category = 'days30';
      else if (daysOverdue <= 60) category = 'days60';
      else if (daysOverdue <= 90) category = 'days90';
      else category = 'over90';

      agingCategories[category].amount += balance;
      agingCategories[category].count += 1;
      agingCategories[category].invoices.push({
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer?.name,
        amount: balance,
        daysOverdue
      });
    });

    const total = Object.values(agingCategories).reduce((sum, cat) => sum + cat.amount, 0);

    res.json({
      reportType: 'Accounts Receivable Aging',
      generatedDate: new Date(),
      totalOutstanding: total,
      categories: agingCategories
    });
  })
);

// Generate Accounts Payable Aging Report
router.get(
  '/payables-aging',
  asyncHandler(async (req, res) => {
    const bills = await Bill.find({
      status: { $in: ['Received', 'Partially Paid', 'Overdue'] }
    }).populate('vendor');

    const now = new Date();
    const agingCategories = {
      current: { amount: 0, count: 0, bills: [] },
      days30: { amount: 0, count: 0, bills: [] },
      days60: { amount: 0, count: 0, bills: [] },
      days90: { amount: 0, count: 0, bills: [] },
      over90: { amount: 0, count: 0, bills: [] }
    };

    bills.forEach(bill => {
      const daysOverdue = Math.floor((now - bill.dueDate) / (1000 * 60 * 60 * 24));
      const balance = bill.total - bill.amountPaid;

      let category;
      if (daysOverdue <= 0) category = 'current';
      else if (daysOverdue <= 30) category = 'days30';
      else if (daysOverdue <= 60) category = 'days60';
      else if (daysOverdue <= 90) category = 'days90';
      else category = 'over90';

      agingCategories[category].amount += balance;
      agingCategories[category].count += 1;
      agingCategories[category].bills.push({
        billNumber: bill.billNumber,
        vendor: bill.vendor?.name,
        amount: balance,
        daysOverdue
      });
    });

    const total = Object.values(agingCategories).reduce((sum, cat) => sum + cat.amount, 0);

    res.json({
      reportType: 'Accounts Payable Aging',
      generatedDate: new Date(),
      totalOutstanding: total,
      categories: agingCategories
    });
  })
);

// Get Financial Ratios
router.get(
  '/financial-ratios',
  asyncHandler(async (req, res) => {
    const accounts = await ChartOfAccounts.find({ isActive: true });

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let revenues = 0;
    let expenses = 0;
    let netIncome = 0;

    accounts.forEach(account => {
      if (account.accountType === 'Asset') totalAssets += account.currentBalance;
      else if (account.accountType === 'Liability') totalLiabilities += account.currentBalance;
      else if (account.accountType === 'Equity') totalEquity += account.currentBalance;
      else if (account.accountType === 'Income') revenues += account.currentBalance;
      else if (account.accountType === 'Expense') expenses += account.currentBalance;
    });

    netIncome = revenues - expenses;

    const ratios = {
      liquidity: {
        currentRatio: totalAssets / (totalLiabilities || 1),
        quickRatio: (totalAssets * 0.8) / (totalLiabilities || 1)
      },
      solvency: {
        debtToEquity: totalLiabilities / (totalEquity || 1),
        equityMultiplier: totalAssets / (totalEquity || 1)
      },
      profitability: {
        profitMargin: revenues ? ((netIncome / revenues) * 100).toFixed(2) : 0,
        returnOnAssets: totalAssets ? ((netIncome / totalAssets) * 100).toFixed(2) : 0,
        returnOnEquity: totalEquity ? ((netIncome / totalEquity) * 100).toFixed(2) : 0
      },
      efficiency: {
        assetTurnover: revenues / (totalAssets || 1),
        equityTurnover: revenues / (totalEquity || 1)
      }
    };

    res.json({
      reportType: 'Financial Ratios',
      generatedDate: new Date(),
      ratios
    });
  })
);

module.exports = router;
