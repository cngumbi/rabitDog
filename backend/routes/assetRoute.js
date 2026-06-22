const express = require('express');
const asyncHandler = require('express-async-handler');
const Asset = require('../models/assetModel');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Create Asset
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { assetCode, assetName, assetType, purchasePrice, purchaseDate, usefulLife, depreciationMethod } = req.body;

    if (!assetCode || !assetName || !assetType || !purchasePrice || !purchaseDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if asset code already exists
    const assetExists = await Asset.findOne({ assetCode });
    if (assetExists) {
      return res.status(400).json({ message: 'Asset code already exists' });
    }

    // Calculate depreciation rate if using straight-line method
    let depreciationRate = 0;
    if (depreciationMethod === 'Straight-Line' && usefulLife) {
      depreciationRate = (purchasePrice - (req.body.salvageValue || 0)) / usefulLife;
    }

    const asset = await Asset.create({
      assetCode,
      assetName,
      assetType,
      purchasePrice,
      purchaseDate,
      usefulLife,
      depreciationMethod,
      depreciationRate,
      bookValue: purchasePrice,
      status: 'Active',
      ...req.body,
      createdBy: req.session.user?.id
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Create',
      module: 'Asset',
      entityType: 'Asset',
      entityId: asset._id,
      entityName: asset.assetCode,
      description: `Created asset: ${asset.assetCode}`
    });

    res.status(201).json({ message: 'Asset created successfully', asset });
  })
);

// Get all Assets
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const { status, assetType, skip = 0, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (assetType) filter.assetType = assetType;

    const assets = await Asset.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('vendor assetAccount depreciationExpenseAccount accumulatedDepreciationAccount createdBy')
      .sort({ purchaseDate: -1 });

    const total = await Asset.countDocuments(filter);

    res.json({ assets, total, skip: parseInt(skip), limit: parseInt(limit) });
  })
);

// Get single Asset
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const asset = await Asset.findById(req.params.id)
      .populate('vendor assetAccount depreciationExpenseAccount accumulatedDepreciationAccount createdBy updatedBy');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(asset);
  })
);

// Update Asset
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.session.user?.id },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Update',
      module: 'Asset',
      entityType: 'Asset',
      entityId: asset._id,
      entityName: asset.assetCode,
      description: `Updated asset: ${asset.assetCode}`
    });

    res.json({ message: 'Asset updated successfully', asset });
  })
);

// Record Depreciation
router.post(
  '/:id/depreciate',
  asyncHandler(async (req, res) => {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.status !== 'Active') {
      return res.status(400).json({ message: 'Only active assets can be depreciated' });
    }

    // Calculate depreciation
    const monthsSincePurchase = Math.floor(
      (new Date() - new Date(asset.purchaseDate)) / (1000 * 60 * 60 * 24 * 30)
    );
    const monthlyDepreciation = asset.depreciationRate / 12;
    const newAccumulatedDepreciation = monthlyDepreciation * monthsSincePurchase;

    asset.accumulatedDepreciation = Math.min(newAccumulatedDepreciation, asset.purchasePrice - (asset.salvageValue || 0));
    asset.bookValue = asset.purchasePrice - asset.accumulatedDepreciation;
    
    await asset.save();

    res.json({ message: 'Depreciation recorded successfully', asset });
  })
);

// Dispose of Asset
router.post(
  '/:id/dispose',
  asyncHandler(async (req, res) => {
    const { disposalDate, disposalPrice } = req.body;
    
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const gainLoss = disposalPrice - asset.bookValue;

    const updated = await Asset.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Disposed',
        disposalDate,
        disposalPrice,
        gainLoss,
        updatedBy: req.session.user?.id
      },
      { new: true }
    );

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Update',
      module: 'Asset',
      entityType: 'Asset',
      entityId: asset._id,
      entityName: asset.assetCode,
      description: `Disposed of asset: ${asset.assetCode}`
    });

    res.json({ message: 'Asset disposed successfully', asset: updated });
  })
);

// Get asset depreciation schedule
router.get(
  '/:id/depreciation-schedule',
  asyncHandler(async (req, res) => {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const schedule = [];
    const monthlyDepreciation = asset.depreciationRate / 12;
    let cumulativeDepreciation = 0;
    let currentDate = new Date(asset.purchaseDate);

    for (let i = 0; i < (asset.usefulLife * 12); i++) {
      cumulativeDepreciation += monthlyDepreciation;
      const bookValue = asset.purchasePrice - cumulativeDepreciation;

      if (bookValue >= asset.salvageValue) {
        schedule.push({
          period: currentDate.toISOString().split('T')[0],
          monthlyExpense: monthlyDepreciation,
          cumulativeDepreciation: cumulativeDepreciation,
          bookValue: Math.max(bookValue, asset.salvageValue)
        });
      }

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json(schedule);
  })
);

// Delete Asset
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.status !== 'Inactive') {
      return res.status(400).json({ message: 'Only inactive assets can be deleted' });
    }

    await Asset.findByIdAndDelete(req.params.id);

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Delete',
      module: 'Asset',
      entityType: 'Asset',
      entityId: asset._id,
      entityName: asset.assetCode,
      description: `Deleted asset: ${asset.assetCode}`
    });

    res.json({ message: 'Asset deleted successfully' });
  })
);

module.exports = router;
