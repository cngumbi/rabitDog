const express = require('express');
const asyncHandler = require('express-async-handler');
const { isAuth } = require('../util');
const Invoice = require('../models/invoiceModel');
const JournalEntry = require('../models/journalEntryModel');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Generate unique invoice number
const generateInvoiceNumber = async () => {
  const lastInvoice = await Invoice.findOne().sort({ _id: -1 });
  const number = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[1]) + 1 : 1001;
  return `INV-${number}`;
};

// Create Invoice
router.post(
  '/create',
  isAuth,
  asyncHandler(async (req, res) => {
    const { customer, lineItems, total, partyId } = req.body;

    if (!customer || !lineItems || !total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const invoiceNumber = await generateInvoiceNumber();

    // Calculate amounts
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = req.body.discountAmount || 0;

    lineItems.forEach(item => {
      const lineTotal = Number(item.lineTotal) || 0;
      const tax = Number(item.taxAmount) || 0;
      subtotal += lineTotal - tax;
      taxAmount += tax;
    });

    const createdById = req.user?.id || req.user?._id || req.session.user?._id || req.session.user?.id;
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invoice = await Invoice.create({
      invoiceNumber,
      customer,
      lineItems,
      subtotal,
      taxAmount,
      discountAmount,
      total: subtotal + taxAmount - discountAmount,
      partyId,
      dueDate,
      ...req.body,
      createdBy: createdById
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: createdById,
      action: 'Create',
      module: 'Invoice',
      entityType: 'Invoice',
      entityId: invoice._id,
      entityName: invoice.invoiceNumber,
      description: `Created invoice: ${invoice.invoiceNumber}`
    });

    res.status(201).json({ message: 'Invoice created successfully', invoice });
  })
);

// Get all Invoices
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const { status, customer, startDate, endDate, skip = 0, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('customer partyId linkedOrder journalEntry')
      .sort({ invoiceDate: -1 });

    const total = await Invoice.countDocuments(filter);

    res.json({ invoices, total, skip: parseInt(skip), limit: parseInt(limit) });
  })
);

// Get single Invoice
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer partyId linkedOrder journalEntry createdBy updatedBy');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  })
);

// Update Invoice
router.put(
  '/:id',
  isAuth,
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft invoices can be edited' });
    }

    const currentUserId = req.user?.id || req.user?._id || req.session.user?.id || req.session.user?._id;

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: currentUserId },
      { new: true }
    );

    // Log activity
    if (currentUserId) {
      await AuditLog.create({
        logNumber: `LOG-${Date.now()}`,
        user: currentUserId,
        action: 'Update',
        module: 'Invoice',
        entityType: 'Invoice',
        entityId: updated._id,
        entityName: updated.invoiceNumber,
        description: `Updated invoice: ${updated.invoiceNumber}`
      });
    }

    res.json({ message: 'Invoice updated successfully', invoice: updated });
  })
);

// Send Invoice
router.post(
  '/:id/send',
  isAuth,
  asyncHandler(async (req, res) => {
    const currentUserId = req.user?.id || req.user?._id || req.session.user?.id || req.session.user?._id;

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'Sent', updatedBy: currentUserId },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Here you would send email to customer
    if (currentUserId) {
      await AuditLog.create({
        logNumber: `LOG-${Date.now()}`,
        user: currentUserId,
        action: 'Update',
        module: 'Invoice',
        entityType: 'Invoice',
        entityId: invoice._id,
        entityName: invoice.invoiceNumber,
        description: `Sent invoice: ${invoice.invoiceNumber}`
      });
    }

    res.json({ message: 'Invoice sent successfully', invoice });
  })
);

// Mark Invoice as Paid
router.post(
  '/:id/pay',
  isAuth,
  asyncHandler(async (req, res) => {
    const { amountPaid } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.amountPaid += amountPaid;
    invoice.balanceDue = invoice.total - invoice.amountPaid;

    if (invoice.balanceDue <= 0) {
      invoice.status = 'Paid';
      invoice.balanceDue = 0;
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'Partially Paid';
    }

    await invoice.save();

    const currentUserId = req.user?.id || req.user?._id || req.session.user?.id || req.session.user?._id;

    if (currentUserId) {
      await AuditLog.create({
        logNumber: `LOG-${Date.now()}`,
        user: currentUserId,
        action: 'Update',
        module: 'Invoice',
        entityType: 'Invoice',
        entityId: invoice._id,
        entityName: invoice.invoiceNumber,
        description: `Recorded payment for invoice: ${invoice.invoiceNumber}`
      });
    }

    res.json({ message: 'Payment recorded successfully', invoice });
  })
);

// Delete Invoice
router.delete(
  '/:id',
  isAuth,
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft invoices can be deleted' });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    const currentUserId = req.user?.id || req.user?._id || req.session.user?.id || req.session.user?._id;

    // Log activity
    if (currentUserId) {
      await AuditLog.create({
        logNumber: `LOG-${Date.now()}`,
        user: currentUserId,
        action: 'Delete',
        module: 'Invoice',
        entityType: 'Invoice',
        entityId: invoice._id,
        entityName: invoice.invoiceNumber,
        description: `Deleted invoice: ${invoice.invoiceNumber}`
      });
    }

    res.json({ message: 'Invoice deleted successfully' });
  })
);

// Get aging report
router.get(
  '/reports/aging',
  asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({
      status: { $in: ['Sent', 'Viewed', 'Partially Paid', 'Overdue'] }
    }).populate('customer');

    const now = new Date();
    const agingReport = {
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      invoices: {
        current: [],
        days30: [],
        days60: [],
        days90: [],
        over90: []
      }
    };

    invoices.forEach(invoice => {
      const daysDue = Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24));

      if (daysDue <= 0) {
        agingReport.current += invoice.balanceDue;
        agingReport.invoices.current.push(invoice);
      } else if (daysDue <= 30) {
        agingReport.days30 += invoice.balanceDue;
        agingReport.invoices.days30.push(invoice);
      } else if (daysDue <= 60) {
        agingReport.days60 += invoice.balanceDue;
        agingReport.invoices.days60.push(invoice);
      } else if (daysDue <= 90) {
        agingReport.days90 += invoice.balanceDue;
        agingReport.invoices.days90.push(invoice);
      } else {
        agingReport.over90 += invoice.balanceDue;
        agingReport.invoices.over90.push(invoice);
      }
    });

    res.json(agingReport);
  })
);

module.exports = router;
