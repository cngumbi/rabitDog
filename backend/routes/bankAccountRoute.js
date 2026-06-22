const express = require('express');
const asyncHandler = require('express-async-handler');
const BankAccount = require('../models/bankAccountModel');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Create Bank Account
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { accountCode, accountName, bankName, accountNumber, accountType } = req.body;

    if (!accountCode || !accountName || !bankName || !accountNumber || !accountType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if account code already exists
    const accountExists = await BankAccount.findOne({ accountCode });
    if (accountExists) {
      return res.status(400).json({ message: 'Account code already exists' });
    }

    const bankAccount = await BankAccount.create({
      accountCode,
      accountName,
      bankName,
      accountNumber,
      accountType,
      currentBalance: req.body.openingBalance || 0,
      status: 'Active',
      ...req.body,
      createdBy: req.session.user?.id
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Create',
      module: 'Bank Account',
      entityType: 'BankAccount',
      entityId: bankAccount._id,
      entityName: bankAccount.accountCode,
      description: `Created bank account: ${bankAccount.accountCode}`
    });

    res.status(201).json({ message: 'Bank account created successfully', bankAccount });
  })
);

// Get all Bank Accounts
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const { status, accountType, skip = 0, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (accountType) filter.accountType = accountType;

    const bankAccounts = await BankAccount.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('glAccount createdBy')
      .sort({ accountCode: 1 });

    const total = await BankAccount.countDocuments(filter);

    res.json({ bankAccounts, total, skip: parseInt(skip), limit: parseInt(limit) });
  })
);

// Get single Bank Account
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const bankAccount = await BankAccount.findById(req.params.id)
      .populate('glAccount createdBy updatedBy');

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json(bankAccount);
  })
);

// Update Bank Account
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const bankAccount = await BankAccount.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.session.user?.id },
      { new: true }
    );

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json({ message: 'Bank account updated successfully', bankAccount });
  })
);

// Add Bank Statement Line
router.post(
  '/:id/statement-lines',
  asyncHandler(async (req, res) => {
    const { date, description, reference, debit, credit } = req.body;

    if (!date || (debit === undefined && credit === undefined)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const bankAccount = await BankAccount.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          bankStatementLines: {
            date,
            description,
            reference,
            debit: debit || 0,
            credit: credit || 0,
            balance: req.body.balance || 0
          }
        }
      },
      { new: true }
    );

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json({ message: 'Bank statement line added successfully', bankAccount });
  })
);

// Reconcile Bank Account
router.post(
  '/:id/reconcile',
  asyncHandler(async (req, res) => {
    const { reconciliationBalance, reconciledLines } = req.body;

    if (!reconciliationBalance) {
      return res.status(400).json({ message: 'Reconciliation balance is required' });
    }

    // Mark specified lines as reconciled
    const bankAccount = await BankAccount.findById(req.params.id);

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    // Update reconciled status for specified lines
    if (reconciledLines && Array.isArray(reconciledLines)) {
      bankAccount.bankStatementLines.forEach(line => {
        if (reconciledLines.includes(line._id.toString())) {
          line.isReconciled = true;
        }
      });
    }

    // Update reconciliation details
    bankAccount.lastReconciliationDate = new Date();
    bankAccount.lastReconciliationBalance = reconciliationBalance;
    bankAccount.currentBalance = reconciliationBalance;

    // Calculate unreconciledTransactions
    const unreconciledLines = bankAccount.bankStatementLines.filter(line => !line.isReconciled);
    bankAccount.unreconciledTransactions = unreconciledLines.map(line => ({
      transactionDate: line.date,
      amount: (line.debit || 0) + (line.credit || 0),
      type: line.debit ? 'Debit' : 'Credit',
      reference: line.reference,
      description: line.description
    }));

    await bankAccount.save();

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Reconcile',
      module: 'Bank Account',
      entityType: 'BankAccount',
      entityId: bankAccount._id,
      entityName: bankAccount.accountCode,
      description: `Reconciled bank account: ${bankAccount.accountCode}`
    });

    res.json({ message: 'Bank account reconciled successfully', bankAccount });
  })
);

// Get reconciliation status
router.get(
  '/:id/reconciliation-status',
  asyncHandler(async (req, res) => {
    const bankAccount = await BankAccount.findById(req.params.id);

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    const totalLines = bankAccount.bankStatementLines.length;
    const reconciledLines = bankAccount.bankStatementLines.filter(line => line.isReconciled).length;
    const unreconciledLines = totalLines - reconciledLines;

    res.json({
      accountCode: bankAccount.accountCode,
      currentBalance: bankAccount.currentBalance,
      lastReconciliationDate: bankAccount.lastReconciliationDate,
      lastReconciliationBalance: bankAccount.lastReconciliationBalance,
      totalStatementLines: totalLines,
      reconciledLines,
      unreconciledLines,
      reconciliationPercent: totalLines ? ((reconciledLines / totalLines) * 100).toFixed(2) : 0,
      unreconciledTransactions: bankAccount.unreconciledTransactions
    });
  })
);

// Get account balance
router.get(
  '/:id/balance',
  asyncHandler(async (req, res) => {
    const bankAccount = await BankAccount.findById(req.params.id);

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json({
      accountCode: bankAccount.accountCode,
      accountName: bankAccount.accountName,
      currentBalance: bankAccount.currentBalance,
      status: bankAccount.status
    });
  })
);

// Delete Bank Account
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const bankAccount = await BankAccount.findByIdAndUpdate(
      req.params.id,
      { status: 'Closed', updatedBy: req.session.user?.id },
      { new: true }
    );

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Delete',
      module: 'Bank Account',
      entityType: 'BankAccount',
      entityId: bankAccount._id,
      entityName: bankAccount.accountCode,
      description: `Closed bank account: ${bankAccount.accountCode}`
    });

    res.json({ message: 'Bank account deleted successfully' });
  })
);

module.exports = router;
