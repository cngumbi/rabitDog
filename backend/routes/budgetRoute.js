const express = require('express');
const asyncHandler = require('express-async-handler');
const Budget = require('../models/budgetModel');
const mongoose = require('mongoose');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Create Budget
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { budgetName, fiscalYear, lines, budgetType } = req.body;
    let { budgetCode, startDate, endDate } = req.body;

    if (!budgetName || !fiscalYear || !budgetType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!budgetCode) {
      const prefix = (budgetName || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0].toUpperCase())
        .join('')
        .slice(0, 3) || 'GEN';
      const suffix = Date.now().toString().slice(-6);
      budgetCode = `BUD-${prefix}-${suffix}`;
    }

    // Provide reasonable defaults for start/end dates when not provided
    if (!startDate) {
      startDate = new Date(`${fiscalYear}-01-01`);
    }
    if (!endDate) {
      endDate = new Date(`${fiscalYear}-12-31`);
    }

    // Check if budget code already exists
    const budgetExists = await Budget.findOne({ budgetCode });
    if (budgetExists) {
      return res.status(400).json({ message: 'Budget code already exists' });
    }

    // Calculate totals for budget and actual amounts
    let totalBudgetAmount = 0;
    let totalActualAmount = 0;
    if (lines) {
      lines.forEach(line => {
        totalBudgetAmount += Number(line.budgetAmount || 0);
        totalActualAmount += Number(line.actualAmount || 0);
      });
    }

    const budget = await Budget.create({
      ...req.body,
      budgetName,
      budgetCode,
      fiscalYear,
      lines,
      totalBudgetAmount,
      totalActualAmount,
      budgetType,
      status: 'Draft',
      startDate,
      endDate,
      createdBy: req.session.user?.id || mongoose.Types.ObjectId()
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id || mongoose.Types.ObjectId(),
      action: 'Create',
      module: 'Budget',
      entityType: 'Budget',
      entityId: budget._id,
      entityName: budget.budgetCode,
      description: `Created budget: ${budget.budgetCode}`
    });

    res.status(201).json({ message: 'Budget created successfully', budget });
  })
);

// Get all Budgets
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const { status, budgetType, fiscalYear, skip = 0, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (budgetType) filter.budgetType = budgetType;
    if (fiscalYear) filter.fiscalYear = parseInt(fiscalYear);

    const budgets = await Budget.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('lines.account lines.costCenter approvedBy createdBy')
      .sort({ fiscalYear: -1 });

    const total = await Budget.countDocuments(filter);

    const normalizedBudgets = budgets.map((budget) => {
      const totalBudgetAmount = budget.totalBudgetAmount != null
        ? budget.totalBudgetAmount
        : (budget.lines || []).reduce((sum, line) => sum + Number(line.budgetAmount || 0), 0);
      const totalActualAmount = budget.totalActualAmount != null
        ? budget.totalActualAmount
        : (budget.lines || []).reduce((sum, line) => sum + Number(line.actualAmount || 0), 0);
      return {
        ...budget.toObject(),
        totalBudgetAmount,
        totalActualAmount
      };
    });

    res.json({ budgets: normalizedBudgets, total, skip: parseInt(skip), limit: parseInt(limit) });
  })
);

// Get single Budget
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const budget = await Budget.findById(req.params.id)
      .populate('lines.account lines.costCenter approvedBy createdBy updatedBy');

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  })
);

// Update Budget
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft budgets can be edited' });
    }

    const updatedData = {
      ...req.body,
      updatedBy: req.session.user?.id,
      totalBudgetAmount: 0,
      totalActualAmount: 0
    };

    if (Array.isArray(req.body.lines)) {
      updatedData.totalBudgetAmount = req.body.lines.reduce((sum, line) => sum + Number(line.budgetAmount || 0), 0);
      updatedData.totalActualAmount = req.body.lines.reduce((sum, line) => sum + Number(line.actualAmount || 0), 0);
    }

    const updated = await Budget.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json({ message: 'Budget updated successfully', budget: updated });
  })
);

// Approve Budget
router.post(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        approvedBy: req.session.user?.id,
        approvalDate: new Date(),
        updatedBy: req.session.user?.id
      },
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Approve',
      module: 'Budget',
      entityType: 'Budget',
      entityId: budget._id,
      entityName: budget.budgetCode,
      description: `Approved budget: ${budget.budgetCode}`
    });

    res.json({ message: 'Budget approved successfully', budget });
  })
);

// Activate Budget
router.post(
  '/:id/activate',
  asyncHandler(async (req, res) => {
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Active',
        updatedBy: req.session.user?.id
      },
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget activated successfully', budget });
  })
);

// Get budget vs actual analysis
router.get(
  '/:id/analysis',
  asyncHandler(async (req, res) => {
    const budget = await Budget.findById(req.params.id)
      .populate('lines.account lines.costCenter');

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const computedTotalBudget = budget.totalBudgetAmount != null
      ? budget.totalBudgetAmount
      : (budget.lines || []).reduce((sum, line) => sum + Number(line.budgetAmount || 0), 0);
    const computedTotalActual = budget.totalActualAmount != null
      ? budget.totalActualAmount
      : (budget.lines || []).reduce((sum, line) => sum + Number(line.actualAmount || 0), 0);

    const analysis = {
      budgetCode: budget.budgetCode,
      budgetName: budget.budgetName,
      fiscalYear: budget.fiscalYear,
      totalBudget: computedTotalBudget,
      totalActual: computedTotalActual,
      totalVariance: (computedTotalBudget - computedTotalActual) || 0,
      variancePercent: computedTotalBudget ? 
        (((computedTotalBudget - computedTotalActual) / computedTotalBudget) * 100).toFixed(2) : 0,
      lines: budget.lines
    };

    res.json(analysis);
  })
);

// Delete Budget
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft budgets can be deleted' });
    }

    await Budget.findByIdAndDelete(req.params.id);

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Delete',
      module: 'Budget',
      entityType: 'Budget',
      entityId: budget._id,
      entityName: budget.budgetCode,
      description: `Deleted budget: ${budget.budgetCode}`
    });

    res.json({ message: 'Budget deleted successfully' });
  })
);

module.exports = router;
