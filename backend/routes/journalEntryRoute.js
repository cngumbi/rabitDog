const express = require('express');
const asyncHandler = require('express-async-handler');
const JournalEntry = require('../models/journalEntryModel');
const ChartOfAccounts = require('../models/chartOfAccountsModel');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Generate unique entry number
const generateEntryNumber = async () => {
  const lastEntry = await JournalEntry.findOne().sort({ _id: -1 });
  const number = lastEntry ? parseInt(lastEntry.entryNumber.split('-')[1]) + 1 : 1001;
  return `JE-${number}`;
};

// Create Journal Entry
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { description, lines, entryType, referenceNumber, linkedDocument } = req.body;

    if (!description || !lines || lines.length < 2) {
      return res.status(400).json({ message: 'Invalid entry. Minimum 2 line items required' });
    }

    // Calculate totals and validate balance
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      const account = await ChartOfAccounts.findById(line.account);
      if (!account) {
        return res.status(400).json({ message: `Account ${line.account} not found` });
      }

      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;
    }

    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01; // Allow for rounding

    const entryNumber = await generateEntryNumber();
    const entry = await JournalEntry.create({
      entryNumber,
      description,
      lines,
      totalDebit,
      totalCredit,
      isBalanced,
      entryType,
      referenceNumber,
      linkedDocument,
      status: 'Draft',
      createdBy: req.session.user?.id
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Create',
      module: 'Journal Entry',
      entityType: 'JournalEntry',
      entityId: entry._id,
      entityName: entry.entryNumber,
      description: `Created journal entry: ${entry.entryNumber}`
    });

    res.status(201).json({
      message: 'Journal entry created successfully',
      entry,
      isBalanced
    });
  })
);

// Get all Journal Entries
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const { status, entryType, startDate, endDate, skip = 0, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (entryType) filter.entryType = entryType;
    if (startDate || endDate) {
      filter.entryDate = {};
      if (startDate) filter.entryDate.$gte = new Date(startDate);
      if (endDate) filter.entryDate.$lte = new Date(endDate);
    }

    const entries = await JournalEntry.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('lines.account createdBy updatedBy')
      .sort({ entryDate: -1 });

    const total = await JournalEntry.countDocuments(filter);

    res.json({ entries, total, skip: parseInt(skip), limit: parseInt(limit) });
  })
);

// Get single Journal Entry
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const entry = await JournalEntry.findById(req.params.id)
      .populate('lines.account lines.costCenter createdBy updatedBy approvedBy reversal');

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json(entry);
  })
);

// Update Journal Entry (only if Draft)
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    if (entry.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft entries can be edited' });
    }

    const updated = await JournalEntry.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.session.user?.id },
      { new: true }
    );

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Update',
      module: 'Journal Entry',
      entityType: 'JournalEntry',
      entityId: updated._id,
      entityName: updated.entryNumber,
      description: `Updated journal entry: ${updated.entryNumber}`
    });

    res.json({ message: 'Journal entry updated successfully', entry: updated });
  })
);

// Post Journal Entry
router.post(
  '/:id/post',
  asyncHandler(async (req, res) => {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    if (entry.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft entries can be posted' });
    }

    if (!entry.isBalanced) {
      return res.status(400).json({ message: 'Entry is not balanced. Debit and credit must be equal' });
    }

    // Update account balances
    for (const line of entry.lines) {
      const account = await ChartOfAccounts.findById(line.account);
      if (account) {
        if (account.normalBalance === 'Debit') {
          account.currentBalance += (line.debit || 0) - (line.credit || 0);
        } else {
          account.currentBalance += (line.credit || 0) - (line.debit || 0);
        }
        await account.save();
      }
    }

    entry.status = 'Posted';
    await entry.save();

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Post',
      module: 'Journal Entry',
      entityType: 'JournalEntry',
      entityId: entry._id,
      entityName: entry.entryNumber,
      description: `Posted journal entry: ${entry.entryNumber}`
    });

    res.json({ message: 'Journal entry posted successfully', entry });
  })
);

// Approve Journal Entry
router.post(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const entry = await JournalEntry.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        approvedBy: req.session.user?.id,
        approvalDate: new Date()
      },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Approve',
      module: 'Journal Entry',
      entityType: 'JournalEntry',
      entityId: entry._id,
      entityName: entry.entryNumber,
      description: `Approved journal entry: ${entry.entryNumber}`
    });

    res.json({ message: 'Journal entry approved successfully', entry });
  })
);

// Reverse Journal Entry
router.post(
  '/:id/reverse',
  asyncHandler(async (req, res) => {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    if (entry.status !== 'Posted') {
      return res.status(400).json({ message: 'Only posted entries can be reversed' });
    }

    if (entry.entryType === 'Reversal') {
      return res.status(400).json({ message: 'Reversal entries cannot be reversed' });
    }

    if (entry.reversal) {
      return res.status(400).json({ message: 'This journal entry has already been reversed' });
    }

    // Create reversing entry
    const reversingLines = entry.lines.map(line => ({
      account: line.account,
      debit: line.credit,
      credit: line.debit,
      description: `Reversal of ${line.description || ''}`
    }));

    const entryNumber = await generateEntryNumber();
    const reversingEntry = await JournalEntry.create({
      entryNumber,
      entryDate: new Date(),
      description: `Reversal of ${entry.entryNumber}`,
      lines: reversingLines,
      totalDebit: entry.totalCredit,
      totalCredit: entry.totalDebit,
      isBalanced: true,
      entryType: 'Reversal',
      status: 'Posted',
      createdBy: req.session.user?.id
    });

    // Update account balances for the reversing entry so the reversal actually offsets the original posting
    for (const line of reversingEntry.lines) {
      const account = await ChartOfAccounts.findById(line.account);
      if (account) {
        if (account.normalBalance === 'Debit') {
          account.currentBalance += (line.debit || 0) - (line.credit || 0);
        } else {
          account.currentBalance += (line.credit || 0) - (line.debit || 0);
        }
        await account.save();
      }
    }

    // Update original entry
    entry.status = 'Reversed';
    entry.reversal = reversingEntry._id;
    entry.reversedBy = req.session.user?.id;
    await entry.save();

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Reverse',
      module: 'Journal Entry',
      entityType: 'JournalEntry',
      entityId: entry._id,
      entityName: entry.entryNumber,
      description: `Reversed journal entry: ${entry.entryNumber}`
    });

    res.json({
      message: 'Journal entry reversed successfully',
      originalEntry: entry,
      reversingEntry
    });
  })
);

// Delete Journal Entry (only if Draft)
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    if (entry.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft entries can be deleted' });
    }

    await JournalEntry.findByIdAndDelete(req.params.id);

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Delete',
      module: 'Journal Entry',
      entityType: 'JournalEntry',
      entityId: entry._id,
      entityName: entry.entryNumber,
      description: `Deleted journal entry: ${entry.entryNumber}`
    });

    res.json({ message: 'Journal entry deleted successfully' });
  })
);

module.exports = router;
