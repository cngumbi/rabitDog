const express = require('express');
const asyncHandler = require('express-async-handler');
const Payment = require('../models/paymentModel');
const Invoice = require('../models/invoiceModel');
const Bill = require('../models/billModel');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Generate unique payment number
const generatePaymentNumber = async () => {
  const lastPayment = await Payment.findOne().sort({ _id: -1 });
  const number = lastPayment ? parseInt(lastPayment.paymentNumber.split('-')[1]) + 1 : 1001;
  return `PAY-${number}`;
};

// Create Payment
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { paymentType, amount, paymentMethod, linkedDocuments } = req.body;

    if (!paymentType || !amount || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const paymentNumber = await generatePaymentNumber();

    const payment = await Payment.create({
      paymentNumber,
      paymentType,
      amount,
      paymentMethod,
      linkedDocuments,
      status: 'Draft',
      ...req.body,
      createdBy: req.session.user?.id
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Create',
      module: 'Payment',
      entityType: 'Payment',
      entityId: payment._id,
      entityName: payment.paymentNumber,
      description: `Created payment: ${payment.paymentNumber}`
    });

    res.status(201).json({ message: 'Payment created successfully', payment });
  })
);

// Get all Payments
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const { status, paymentType, startDate, endDate, skip = 0, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentType) filter.paymentType = paymentType;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('payee vendor bankAccount journalEntry approvedBy')
      .sort({ paymentDate: -1 });

    const total = await Payment.countDocuments(filter);

    res.json({ payments, total, skip: parseInt(skip), limit: parseInt(limit) });
  })
);

// Get single Payment
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id)
      .populate('payee vendor bankAccount journalEntry approvedBy createdBy updatedBy');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  })
);

// Update Payment (only if Draft)
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft payments can be edited' });
    }

    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.session.user?.id },
      { new: true }
    );

    res.json({ message: 'Payment updated successfully', payment: updated });
  })
);

// Approve Payment
router.post(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Pending',
        approvedBy: req.session.user?.id,
        approvalDate: new Date(),
        updatedBy: req.session.user?.id
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Approve',
      module: 'Payment',
      entityType: 'Payment',
      entityId: payment._id,
      entityName: payment.paymentNumber,
      description: `Approved payment: ${payment.paymentNumber}`
    });

    res.json({ message: 'Payment approved successfully', payment });
  })
);

// Complete Payment
router.post(
  '/:id/complete',
  asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update linked documents
    if (payment.linkedDocuments && Array.isArray(payment.linkedDocuments)) {
      for (const doc of payment.linkedDocuments) {
        if (doc.documentType === 'Invoice') {
          await Invoice.findByIdAndUpdate(doc.documentId, {
            amountPaid: { $inc: doc.amountApplied }
          });
        } else if (doc.documentType === 'Bill') {
          await Bill.findByIdAndUpdate(doc.documentId, {
            amountPaid: { $inc: doc.amountApplied }
          });
        }
      }
    }

    payment.status = 'Completed';
    await payment.save();

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Update',
      module: 'Payment',
      entityType: 'Payment',
      entityId: payment._id,
      entityName: payment.paymentNumber,
      description: `Completed payment: ${payment.paymentNumber}`
    });

    res.json({ message: 'Payment completed successfully', payment });
  })
);

// Void Payment
router.post(
  '/:id/void',
  asyncHandler(async (req, res) => {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Voided',
        updatedBy: req.session.user?.id
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Update',
      module: 'Payment',
      entityType: 'Payment',
      entityId: payment._id,
      entityName: payment.paymentNumber,
      description: `Voided payment: ${payment.paymentNumber}`
    });

    res.json({ message: 'Payment voided successfully', payment });
  })
);

// Delete Payment
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft payments can be deleted' });
    }

    await Payment.findByIdAndDelete(req.params.id);

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Delete',
      module: 'Payment',
      entityType: 'Payment',
      entityId: payment._id,
      entityName: payment.paymentNumber,
      description: `Deleted payment: ${payment.paymentNumber}`
    });

    res.json({ message: 'Payment deleted successfully' });
  })
);

module.exports = router;
