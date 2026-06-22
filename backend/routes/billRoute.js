const express = require('express');
const asyncHandler = require('express-async-handler');
const Bill = require('../models/billModel');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Generate unique bill number
const generateBillNumber = async () => {
  const lastBill = await Bill.findOne().sort({ _id: -1 });
  const number = lastBill ? parseInt(lastBill.billNumber.split('-')[1]) + 1 : 1001;
  return `BILL-${number}`;
};

// Create Bill
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { vendor, lineItems, total } = req.body;

    if (!vendor || !lineItems || !total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const billNumber = await generateBillNumber();

    // Calculate amounts
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = req.body.discountAmount || 0;

    lineItems.forEach(item => {
      subtotal += item.lineTotal || 0;
      taxAmount += item.taxAmount || 0;
    });

    const bill = await Bill.create({
      billNumber,
      vendor,
      lineItems,
      subtotal,
      taxAmount,
      discountAmount,
      total: subtotal + taxAmount - discountAmount,
      ...req.body,
      createdBy: req.session.user?.id
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Create',
      module: 'Bill',
      entityType: 'Bill',
      entityId: bill._id,
      entityName: bill.billNumber,
      description: `Created bill: ${bill.billNumber}`
    });

    res.status(201).json({ message: 'Bill created successfully', bill });
  })
);

// Get all Bills
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const { status, vendor, startDate, endDate, skip = 0, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (vendor) filter.vendor = vendor;
    if (startDate || endDate) {
      filter.billDate = {};
      if (startDate) filter.billDate.$gte = new Date(startDate);
      if (endDate) filter.billDate.$lte = new Date(endDate);
    }

    const bills = await Bill.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('vendor linkedPurchase journalEntry approvedBy')
      .sort({ billDate: -1 });

    const total = await Bill.countDocuments(filter);

    res.json({ bills, total, skip: parseInt(skip), limit: parseInt(limit) });
  })
);

// Get single Bill
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const bill = await Bill.findById(req.params.id)
      .populate('vendor linkedPurchase journalEntry approvedBy createdBy updatedBy');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  })
);

// Update Bill
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft bills can be edited' });
    }

    const updated = await Bill.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.session.user?.id },
      { new: true }
    );

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Update',
      module: 'Bill',
      entityType: 'Bill',
      entityId: updated._id,
      entityName: updated.billNumber,
      description: `Updated bill: ${updated.billNumber}`
    });

    res.json({ message: 'Bill updated successfully', bill: updated });
  })
);

// Approve Bill
router.post(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Reviewed',
        approvedBy: req.session.user?.id,
        approvalDate: new Date(),
        updatedBy: req.session.user?.id
      },
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Approve',
      module: 'Bill',
      entityType: 'Bill',
      entityId: bill._id,
      entityName: bill.billNumber,
      description: `Approved bill: ${bill.billNumber}`
    });

    res.json({ message: 'Bill approved successfully', bill });
  })
);

// Record Payment
router.post(
  '/:id/pay',
  asyncHandler(async (req, res) => {
    const { amountPaid } = req.body;
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    bill.amountPaid += amountPaid;
    bill.balanceDue = bill.total - bill.amountPaid;

    if (bill.balanceDue <= 0) {
      bill.status = 'Paid';
      bill.balanceDue = 0;
    } else if (bill.amountPaid > 0) {
      bill.status = 'Partially Paid';
    }

    await bill.save();

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Update',
      module: 'Bill',
      entityType: 'Bill',
      entityId: bill._id,
      entityName: bill.billNumber,
      description: `Recorded payment for bill: ${bill.billNumber}`
    });

    res.json({ message: 'Payment recorded successfully', bill });
  })
);

// Delete Bill
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft bills can be deleted' });
    }

    await Bill.findByIdAndDelete(req.params.id);

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Delete',
      module: 'Bill',
      entityType: 'Bill',
      entityId: bill._id,
      entityName: bill.billNumber,
      description: `Deleted bill: ${bill.billNumber}`
    });

    res.json({ message: 'Bill deleted successfully' });
  })
);

// Get payable aging report
router.get(
  '/reports/aging',
  asyncHandler(async (req, res) => {
    const bills = await Bill.find({
      status: { $in: ['Received', 'Reviewed', 'Partially Paid', 'Overdue'] }
    }).populate('vendor');

    const now = new Date();
    const agingReport = {
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      bills: {
        current: [],
        days30: [],
        days60: [],
        days90: [],
        over90: []
      }
    };

    bills.forEach(bill => {
      const daysDue = Math.floor((now - bill.dueDate) / (1000 * 60 * 60 * 24));

      if (daysDue <= 0) {
        agingReport.current += bill.balanceDue;
        agingReport.bills.current.push(bill);
      } else if (daysDue <= 30) {
        agingReport.days30 += bill.balanceDue;
        agingReport.bills.days30.push(bill);
      } else if (daysDue <= 60) {
        agingReport.days60 += bill.balanceDue;
        agingReport.bills.days60.push(bill);
      } else if (daysDue <= 90) {
        agingReport.days90 += bill.balanceDue;
        agingReport.bills.days90.push(bill);
      } else {
        agingReport.over90 += bill.balanceDue;
        agingReport.bills.over90.push(bill);
      }
    });

    res.json(agingReport);
  })
);

module.exports = router;
