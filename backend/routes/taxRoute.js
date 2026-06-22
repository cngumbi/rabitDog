const express = require('express');
const asyncHandler = require('express-async-handler');
const TaxConfiguration = require('../models/taxConfigurationModel');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Create Tax Configuration
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { taxCode, taxName, taxType, filingFrequency } = req.body;

    if (!taxCode || !taxName || !taxType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if tax code already exists
    const taxExists = await TaxConfiguration.findOne({ taxCode });
    if (taxExists) {
      return res.status(400).json({ message: 'Tax code already exists' });
    }

    const tax = await TaxConfiguration.create({
      taxCode,
      taxName,
      taxType,
      filingFrequency,
      isActive: true,
      ...req.body,
      createdBy: req.session.user?.id
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Create',
      module: 'Tax',
      entityType: 'TaxConfiguration',
      entityId: tax._id,
      entityName: tax.taxCode,
      description: `Created tax configuration: ${tax.taxCode}`
    });

    res.status(201).json({ message: 'Tax configuration created successfully', tax });
  })
);

// Get all Tax Configurations
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const { taxType, isActive, skip = 0, limit = 50 } = req.query;

    const filter = {};
    if (taxType) filter.taxType = taxType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const taxes = await TaxConfiguration.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('applicableAccounts taxPayableAccount taxExpenseAccount createdBy')
      .sort({ taxCode: 1 });

    const total = await TaxConfiguration.countDocuments(filter);

    res.json({ taxes, total, skip: parseInt(skip), limit: parseInt(limit) });
  })
);

// Get single Tax Configuration
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const tax = await TaxConfiguration.findById(req.params.id)
      .populate('applicableAccounts taxPayableAccount taxExpenseAccount createdBy updatedBy');

    if (!tax) {
      return res.status(404).json({ message: 'Tax configuration not found' });
    }

    res.json(tax);
  })
);

// Update Tax Configuration
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const tax = await TaxConfiguration.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.session.user?.id },
      { new: true }
    );

    if (!tax) {
      return res.status(404).json({ message: 'Tax configuration not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Update',
      module: 'Tax',
      entityType: 'TaxConfiguration',
      entityId: tax._id,
      entityName: tax.taxCode,
      description: `Updated tax configuration: ${tax.taxCode}`
    });

    res.json({ message: 'Tax configuration updated successfully', tax });
  })
);

// Add Tax Rate
router.post(
  '/:id/tax-rates',
  asyncHandler(async (req, res) => {
    const { taxName, taxRate, effectiveDate, expiryDate } = req.body;

    if (!taxName || taxRate === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const tax = await TaxConfiguration.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          taxRates: {
            taxName,
            taxRate,
            effectiveDate,
            expiryDate,
            isActive: true
          }
        },
        updatedBy: req.session.user?.id
      },
      { new: true }
    );

    if (!tax) {
      return res.status(404).json({ message: 'Tax configuration not found' });
    }

    res.json({ message: 'Tax rate added successfully', tax });
  })
);

// Update Tax Rate
router.put(
  '/:id/tax-rates/:rateIndex',
  asyncHandler(async (req, res) => {
    const tax = await TaxConfiguration.findById(req.params.id);

    if (!tax || !tax.taxRates[req.params.rateIndex]) {
      return res.status(404).json({ message: 'Tax rate not found' });
    }

    tax.taxRates[req.params.rateIndex] = {
      ...tax.taxRates[req.params.rateIndex].toObject(),
      ...req.body
    };

    await tax.save();

    res.json({ message: 'Tax rate updated successfully', tax });
  })
);

// Get applicable tax for account
router.get(
  '/applicable/:accountId',
  asyncHandler(async (req, res) => {
    const taxes = await TaxConfiguration.find({
      applicableAccounts: req.params.accountId,
      isActive: true
    });

    res.json(taxes);
  })
);

// Calculate tax amount
router.post(
  '/calculate',
  asyncHandler(async (req, res) => {
    const { taxCode, amount, effectiveDate = new Date() } = req.body;

    if (!taxCode || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const tax = await TaxConfiguration.findOne({ taxCode });

    if (!tax) {
      return res.status(404).json({ message: 'Tax configuration not found' });
    }

    // Find applicable rate for date
    const applicableRate = tax.taxRates.find(rate => {
      const effDate = new Date(rate.effectiveDate);
      const expDate = new Date(rate.expiryDate || '2099-12-31');
      const checkDate = new Date(effectiveDate);
      return checkDate >= effDate && checkDate <= expDate && rate.isActive;
    });

    if (!applicableRate) {
      return res.status(400).json({ message: 'No applicable tax rate found for the given date' });
    }

    const taxAmount = (amount * applicableRate.taxRate) / 100;

    res.json({
      taxCode: tax.taxCode,
      taxName: tax.taxName,
      baseAmount: amount,
      taxRate: applicableRate.taxRate,
      taxAmount: taxAmount,
      totalAmount: amount + taxAmount
    });
  })
);

// Delete Tax Configuration
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const tax = await TaxConfiguration.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.session.user?.id },
      { new: true }
    );

    if (!tax) {
      return res.status(404).json({ message: 'Tax configuration not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Delete',
      module: 'Tax',
      entityType: 'TaxConfiguration',
      entityId: tax._id,
      entityName: tax.taxCode,
      description: `Deactivated tax configuration: ${tax.taxCode}`
    });

    res.json({ message: 'Tax configuration deleted successfully' });
  })
);

module.exports = router;
