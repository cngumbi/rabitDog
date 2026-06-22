const express = require('express');
const asyncHandler = require('express-async-handler');
const ChartOfAccounts = require('../models/chartOfAccountsModel');
const JournalEntry = require('../models/journalEntryModel');
const AuditLog = require('../models/auditLogModel');
const validateData = require('../middleware/validateData');

const router = express.Router();

// Create Chart of Accounts
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { accountCode, accountName, accountType, subType, normalBalance } = req.body;

    if (!accountCode || !accountName || !accountType || !normalBalance) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const accountExists = await ChartOfAccounts.findOne({ accountCode });
    if (accountExists) {
      return res.status(400).json({ message: 'Account code already exists' });
    }

    const account = await ChartOfAccounts.create({
      accountCode,
      accountName,
      accountType,
      subType,
      normalBalance,
      ...req.body,
      createdBy: req.session.user?.id
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Create',
      module: 'Chart of Accounts',
      entityType: 'ChartOfAccounts',
      entityId: account._id,
      entityName: account.accountName,
      description: `Created new account: ${account.accountCode}`
    });

    res.status(201).json({ message: 'Account created successfully', account });
  })
);

// Get all Chart of Accounts
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const { accountType, isActive, skip = 0, limit = 50 } = req.query;

    const filter = {};
    if (accountType) filter.accountType = accountType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const accounts = await ChartOfAccounts.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('parentAccount costCenter createdBy updatedBy')
      .sort({ accountCode: 1 });

    const total = await ChartOfAccounts.countDocuments(filter);

    res.json({ accounts, total, skip: parseInt(skip), limit: parseInt(limit) });
  })
);

// Get single Chart of Account
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const account = await ChartOfAccounts.findById(req.params.id)
      .populate('parentAccount costCenter createdBy updatedBy');

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  })
);

// Update Chart of Accounts
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const account = await ChartOfAccounts.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.session.user?.id },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Update',
      module: 'Chart of Accounts',
      entityType: 'ChartOfAccounts',
      entityId: account._id,
      entityName: account.accountName,
      description: `Updated account: ${account.accountCode}`
    });

    res.json({ message: 'Account updated successfully', account });
  })
);

// Delete Chart of Accounts (soft delete)
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const account = await ChartOfAccounts.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.session.user?.id },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Delete',
      module: 'Chart of Accounts',
      entityType: 'ChartOfAccounts',
      entityId: account._id,
      entityName: account.accountName,
      description: `Deactivated account: ${account.accountCode}`
    });

    res.json({ message: 'Account deleted successfully' });
  })
);

// Get account balance
router.get(
  '/:id/balance',
  asyncHandler(async (req, res) => {
    const account = await ChartOfAccounts.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({
      accountCode: account.accountCode,
      accountName: account.accountName,
      openingBalance: account.openingBalance,
      currentBalance: account.currentBalance,
      normalBalance: account.normalBalance
    });
  })
);

// Get accounts by type
router.get(
  '/type/:type',
  asyncHandler(async (req, res) => {
    const accounts = await ChartOfAccounts.find({
      accountType: req.params.type,
      isActive: true
    }).sort({ accountCode: 1 });

    res.json(accounts);
  })
);

module.exports = router;
