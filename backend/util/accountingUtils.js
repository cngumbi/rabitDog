/**
 * Accounting Utilities Module
 * Provides functions for accounting calculations, conversions, and validations
 */

const ChartOfAccounts = require('../models/chartOfAccountsModel');
const JournalEntry = require('../models/journalEntryModel');

// Validate journal entry balance
const validateJournalEntry = (lines) => {
  let totalDebit = 0;
  let totalCredit = 0;

  lines.forEach(line => {
    totalDebit += line.debit || 0;
    totalCredit += line.credit || 0;
  });

  return {
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    totalDebit,
    totalCredit,
    difference: Math.abs(totalDebit - totalCredit)
  };
};

// Calculate account balance from journal entries
const calculateAccountBalance = async (accountId, startDate, endDate) => {
  const entries = await JournalEntry.find({
    'lines.account': accountId,
    status: 'Posted',
    ...(startDate || endDate ? { entryDate: {} } : {})
  });

  if (startDate) entries = entries.filter(e => new Date(e.entryDate) >= new Date(startDate));
  if (endDate) entries = entries.filter(e => new Date(e.entryDate) <= new Date(endDate));

  const account = await ChartOfAccounts.findById(accountId);

  let balance = account?.openingBalance || 0;

  entries.forEach(entry => {
    entry.lines.forEach(line => {
      if (line.account.toString() === accountId.toString()) {
        if (account.normalBalance === 'Debit') {
          balance += (line.debit || 0) - (line.credit || 0);
        } else {
          balance += (line.credit || 0) - (line.debit || 0);
        }
      }
    });
  });

  return balance;
};

// Format currency value
const formatCurrency = (amount, currencyCode = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

// Calculate tax amount
const calculateTax = (amount, taxRate) => {
  return (amount * taxRate) / 100;
};

// Calculate discount amount
const calculateDiscount = (amount, discountPercent) => {
  return (amount * discountPercent) / 100;
};

// Calculate depreciation
const calculateDepreciation = (cost, salvageValue, usefulLife, method = 'Straight-Line') => {
  const depreciableBase = cost - salvageValue;

  switch (method) {
    case 'Straight-Line':
      return {
        monthlyExpense: depreciableBase / (usefulLife * 12),
        annualExpense: depreciableBase / usefulLife,
        totalDepreciation: depreciableBase
      };

    case 'Declining Balance':
      const rate = 2 / usefulLife;
      return {
        monthlyRate: rate / 12,
        annualRate: rate,
        firstYearExpense: cost * rate
      };

    case 'Sum-of-Years-Digits':
      const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
      return {
        sumOfYears,
        firstYearRate: usefulLife / sumOfYears,
        firstYearExpense: depreciableBase * (usefulLife / sumOfYears)
      };

    default:
      return null;
  }
};

// Calculate aged receivables
const calculateAgedReceivables = (invoices) => {
  const now = new Date();
  const aged = {
    current: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    over90: 0
  };

  invoices.forEach(invoice => {
    const daysOverdue = Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24));
    const balance = invoice.total - invoice.amountPaid;

    if (daysOverdue <= 0) aged.current += balance;
    else if (daysOverdue <= 30) aged.days30 += balance;
    else if (daysOverdue <= 60) aged.days60 += balance;
    else if (daysOverdue <= 90) aged.days90 += balance;
    else aged.over90 += balance;
  });

  return aged;
};

// Calculate financial ratios
const calculateFinancialRatios = (assets, liabilities, equity, revenues, expenses, netIncome) => {
  return {
    liquidity: {
      currentRatio: assets / (liabilities || 1),
      quickRatio: (assets * 0.8) / (liabilities || 1)
    },
    solvency: {
      debtToEquity: liabilities / (equity || 1),
      equityMultiplier: assets / (equity || 1),
      debtRatio: liabilities / (assets || 1)
    },
    profitability: {
      grossProfitMargin: revenues ? ((revenues - expenses) / revenues) * 100 : 0,
      operatingProfitMargin: revenues ? (netIncome / revenues) * 100 : 0,
      netProfitMargin: revenues ? (netIncome / revenues) * 100 : 0,
      returnOnAssets: assets ? (netIncome / assets) * 100 : 0,
      returnOnEquity: equity ? (netIncome / equity) * 100 : 0
    },
    efficiency: {
      assetTurnover: revenues / (assets || 1),
      equityTurnover: revenues / (equity || 1)
    }
  };
};

// Validate invoice line items
const validateInvoiceLineItems = (lineItems) => {
  if (!lineItems || lineItems.length === 0) {
    return { valid: false, error: 'Invoice must have at least one line item' };
  }

  for (const item of lineItems) {
    if (!item.description || !item.quantity || !item.unitPrice) {
      return { valid: false, error: 'All line items must have description, quantity, and unit price' };
    }

    if (item.quantity <= 0 || item.unitPrice < 0) {
      return { valid: false, error: 'Quantity must be positive and unit price must be non-negative' };
    }
  }

  return { valid: true };
};

// Calculate invoice totals
const calculateInvoiceTotals = (lineItems, taxRate = 0, discountPercent = 0) => {
  let subtotal = 0;

  lineItems.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice;
    subtotal += lineTotal;
  });

  const taxAmount = calculateTax(subtotal, taxRate);
  const discountAmount = calculateDiscount(subtotal, discountPercent);
  const total = subtotal + taxAmount - discountAmount;

  return {
    subtotal,
    taxAmount,
    discountAmount,
    total
  };
};

// Budget variance analysis
const calculateBudgetVariance = (budgeted, actual) => {
  const variance = budgeted - actual;
  const variancePercent = budgeted ? (variance / budgeted) * 100 : 0;

  return {
    budgeted,
    actual,
    variance,
    variancePercent: variancePercent.toFixed(2),
    status: variance < 0 ? 'Over Budget' : variance === 0 ? 'On Budget' : 'Under Budget'
  };
};

// Convert between currencies (simplified - would use real exchange rates in production)
const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRate = 1) => {
  return amount * exchangeRate;
};

// Round to nearest cent
const roundToCent = (amount) => {
  return Math.round(amount * 100) / 100;
};

// Generate general ledger extract for account
const generateGLExtract = async (accountId, startDate, endDate) => {
  const entries = await JournalEntry.find({
    'lines.account': accountId,
    status: 'Posted',
    ...(startDate || endDate ? { entryDate: {} } : {})
  }).populate('lines.account');

  let entries_filtered = entries;
  if (startDate) entries_filtered = entries_filtered.filter(e => new Date(e.entryDate) >= new Date(startDate));
  if (endDate) entries_filtered = entries_filtered.filter(e => new Date(e.entryDate) <= new Date(endDate));

  const ledgerLines = [];
  let runningBalance = 0;

  entries_filtered.forEach(entry => {
    entry.lines.forEach(line => {
      if (line.account._id.toString() === accountId.toString()) {
        const debit = line.debit || 0;
        const credit = line.credit || 0;

        runningBalance += (debit - credit);

        ledgerLines.push({
          date: entry.entryDate,
          entryNumber: entry.entryNumber,
          description: entry.description,
          debit,
          credit,
          balance: runningBalance
        });
      }
    });
  });

  return ledgerLines;
};

module.exports = {
  validateJournalEntry,
  calculateAccountBalance,
  formatCurrency,
  calculateTax,
  calculateDiscount,
  calculateDepreciation,
  calculateAgedReceivables,
  calculateFinancialRatios,
  validateInvoiceLineItems,
  calculateInvoiceTotals,
  calculateBudgetVariance,
  convertCurrency,
  roundToCent,
  generateGLExtract
};
