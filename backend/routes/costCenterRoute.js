const express = require('express');
const asyncHandler = require('express-async-handler');
const CostCenter = require('../models/costCenterModel');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Create Cost Center
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { costCenterCode, costCenterName, department, costType } = req.body;

    if (!costCenterCode || !costCenterName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if cost center code already exists
    const costCenterExists = await CostCenter.findOne({ costCenterCode });
    if (costCenterExists) {
      return res.status(400).json({ message: 'Cost center code already exists' });
    }

    const costCenter = await CostCenter.create({
      costCenterCode,
      costCenterName,
      department,
      costType,
      isActive: true,
      ...req.body,
      createdBy: req.session.user?.id
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Create',
      module: 'Cost Center',
      entityType: 'CostCenter',
      entityId: costCenter._id,
      entityName: costCenter.costCenterCode,
      description: `Created cost center: ${costCenter.costCenterCode}`
    });

    res.status(201).json({ message: 'Cost center created successfully', costCenter });
  })
);

// Get all Cost Centers
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const { isActive, costType, skip = 0, limit = 50 } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (costType) filter.costType = costType;

    const costCenters = await CostCenter.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('manager parent createdBy')
      .sort({ costCenterCode: 1 });

    const total = await CostCenter.countDocuments(filter);

    res.json({ costCenters, total, skip: parseInt(skip), limit: parseInt(limit) });
  })
);

// Get single Cost Center
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const costCenter = await CostCenter.findById(req.params.id)
      .populate('manager parent createdBy updatedBy');

    if (!costCenter) {
      return res.status(404).json({ message: 'Cost center not found' });
    }

    res.json(costCenter);
  })
);

// Update Cost Center
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const costCenter = await CostCenter.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.session.user?.id },
      { new: true }
    );

    if (!costCenter) {
      return res.status(404).json({ message: 'Cost center not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Update',
      module: 'Cost Center',
      entityType: 'CostCenter',
      entityId: costCenter._id,
      entityName: costCenter.costCenterCode,
      description: `Updated cost center: ${costCenter.costCenterCode}`
    });

    res.json({ message: 'Cost center updated successfully', costCenter });
  })
);

// Get Cost Center Budget Status
router.get(
  '/:id/budget-status',
  asyncHandler(async (req, res) => {
    const costCenter = await CostCenter.findById(req.params.id);

    if (!costCenter) {
      return res.status(404).json({ message: 'Cost center not found' });
    }

    const remaining = costCenter.budget - costCenter.spent;
    const utilizationPercent = costCenter.budget ? ((costCenter.spent / costCenter.budget) * 100).toFixed(2) : 0;

    res.json({
      costCenterCode: costCenter.costCenterCode,
      costCenterName: costCenter.costCenterName,
      budget: costCenter.budget,
      spent: costCenter.spent,
      remaining,
      utilizationPercent,
      status: remaining < 0 ? 'Over Budget' : remaining < costCenter.budget * 0.1 ? 'Critical' : 'Normal'
    });
  })
);

// Allocate Budget
router.post(
  '/:id/allocate-budget',
  asyncHandler(async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const costCenter = await CostCenter.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { budget: amount },
        updatedBy: req.session.user?.id
      },
      { new: true }
    );

    if (!costCenter) {
      return res.status(404).json({ message: 'Cost center not found' });
    }

    res.json({ message: 'Budget allocated successfully', costCenter });
  })
);

// Record Spending
router.post(
  '/:id/record-spending',
  asyncHandler(async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const costCenter = await CostCenter.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { spent: amount },
        updatedBy: req.session.user?.id
      },
      { new: true }
    );

    if (!costCenter) {
      return res.status(404).json({ message: 'Cost center not found' });
    }

    res.json({ message: 'Spending recorded successfully', costCenter });
  })
);

// Delete Cost Center
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const costCenter = await CostCenter.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.session.user?.id },
      { new: true }
    );

    if (!costCenter) {
      return res.status(404).json({ message: 'Cost center not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Delete',
      module: 'Cost Center',
      entityType: 'CostCenter',
      entityId: costCenter._id,
      entityName: costCenter.costCenterCode,
      description: `Deactivated cost center: ${costCenter.costCenterCode}`
    });

    res.json({ message: 'Cost center deleted successfully' });
  })
);

module.exports = router;
