const express = require('express');
const asyncHandler = require('express-async-handler');
const Budget = require('../models/budgetModel');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Create Budget
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { budgetName, budgetCode, fiscalYear, lines, budgetType } = req.body;

    if (!budgetName || !budgetCode || !fiscalYear || !budgetType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if budget code already exists
    const budgetExists = await Budget.findOne({ budgetCode });
    if (budgetExists) {
      return res.status(400).json({ message: 'Budget code already exists' });
    }

    // Calculate total budget amount
    let totalBudgetAmount = 0;
    if (lines) {
      lines.forEach(line => {
        totalBudgetAmount += line.budgetAmount || 0;
      });
    }

    const budget = await Budget.create({
      budgetName,
      budgetCode,
      fiscalYear,
      lines,
      totalBudgetAmount,
      budgetType,
      status: 'Draft',
      ...req.body,
      createdBy: req.session.user?.id
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
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

    res.json({ budgets, total, skip: parseInt(skip), limit: parseInt(limit) });
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

    const updated = await Budget.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.session.user?.id },
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

    const analysis = {
      budgetCode: budget.budgetCode,
      budgetName: budget.budgetName,
      fiscalYear: budget.fiscalYear,
      totalBudget: budget.totalBudgetAmount,
      totalActual: budget.totalActualAmount,
      totalVariance: (budget.totalBudgetAmount - budget.totalActualAmount) || 0,
      variancePercent: budget.totalBudgetAmount ? 
        (((budget.totalBudgetAmount - budget.totalActualAmount) / budget.totalBudgetAmount) * 100).toFixed(2) : 0,
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
