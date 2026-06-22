const express = require('express');
const asyncHandler = require('express-async-handler');
const EmployeePayroll = require('../models/employeePayrollModel');
const PayrollConfiguration = require('../models/payrollConfigurationModel');
const AuditLog = require('../models/auditLogModel');

const router = express.Router();

// Create Employee Payroll
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { employee, payPeriodStart, payPeriodEnd, payDate, earnings, deductions, taxes, paymentMethod } = req.body;

    if (!employee || !payPeriodStart || !payPeriodEnd || !payDate || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate totals
    let totalEarnings = 0;
    let totalDeductions = 0;
    let totalTaxes = 0;

    if (earnings && Array.isArray(earnings)) {
      totalEarnings = earnings.reduce((sum, item) => sum + (item.amount || 0), 0);
    }

    if (deductions && Array.isArray(deductions)) {
      totalDeductions = deductions.reduce((sum, item) => sum + (item.amount || 0), 0);
    }

    if (taxes && Array.isArray(taxes)) {
      totalTaxes = taxes.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    }

    const netPay = totalEarnings - totalDeductions - totalTaxes;

    const payrollNumber = `PAYROLL-${Date.now()}`;

    const payroll = await EmployeePayroll.create({
      payrollNumber,
      employee,
      payPeriodStart,
      payPeriodEnd,
      payDate,
      earnings,
      totalEarnings,
      deductions,
      totalDeductions,
      taxes,
      totalTaxes,
      netPay,
      paymentMethod,
      status: 'Draft',
      ...req.body,
      createdBy: req.session.user?.id
    });

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Create',
      module: 'Payroll',
      entityType: 'EmployeePayroll',
      entityId: payroll._id,
      entityName: payroll.payrollNumber,
      description: `Created payroll: ${payroll.payrollNumber}`
    });

    res.status(201).json({ message: 'Payroll created successfully', payroll });
  })
);

// Get all Payroll Records
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const { status, employee, startDate, endDate, skip = 0, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (employee) filter.employee = employee;
    if (startDate || endDate) {
      filter.payPeriodStart = {};
      if (startDate) filter.payPeriodStart.$gte = new Date(startDate);
      if (endDate) filter.payPeriodStart.$lte = new Date(endDate);
    }

    const payrolls = await EmployeePayroll.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('employee journalEntry approvedBy createdBy')
      .sort({ payDate: -1 });

    const total = await EmployeePayroll.countDocuments(filter);

    res.json({ payrolls, total, skip: parseInt(skip), limit: parseInt(limit) });
  })
);

// Get single Payroll Record
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const payroll = await EmployeePayroll.findById(req.params.id)
      .populate('employee journalEntry approvedBy createdBy updatedBy');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.json(payroll);
  })
);

// Update Payroll Record
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const payroll = await EmployeePayroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    if (payroll.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft payroll records can be edited' });
    }

    const updated = await EmployeePayroll.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.session.user?.id },
      { new: true }
    );

    res.json({ message: 'Payroll record updated successfully', payroll: updated });
  })
);

// Approve Payroll Record
router.post(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const payroll = await EmployeePayroll.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Processed',
        approvedBy: req.session.user?.id,
        approvalDate: new Date(),
        updatedBy: req.session.user?.id
      },
      { new: true }
    );

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Approve',
      module: 'Payroll',
      entityType: 'EmployeePayroll',
      entityId: payroll._id,
      entityName: payroll.payrollNumber,
      description: `Approved payroll: ${payroll.payrollNumber}`
    });

    res.json({ message: 'Payroll record approved successfully', payroll });
  })
);

// Mark Payroll as Paid
router.post(
  '/:id/pay',
  asyncHandler(async (req, res) => {
    const payroll = await EmployeePayroll.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Paid',
        updatedBy: req.session.user?.id
      },
      { new: true }
    );

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Update',
      module: 'Payroll',
      entityType: 'EmployeePayroll',
      entityId: payroll._id,
      entityName: payroll.payrollNumber,
      description: `Paid payroll: ${payroll.payrollNumber}`
    });

    res.json({ message: 'Payroll paid successfully', payroll });
  })
);

// Delete Payroll Record
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const payroll = await EmployeePayroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    if (payroll.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft payroll records can be deleted' });
    }

    await EmployeePayroll.findByIdAndDelete(req.params.id);

    // Log activity
    await AuditLog.create({
      logNumber: `LOG-${Date.now()}`,
      user: req.session.user?.id,
      action: 'Delete',
      module: 'Payroll',
      entityType: 'EmployeePayroll',
      entityId: payroll._id,
      entityName: payroll.payrollNumber,
      description: `Deleted payroll: ${payroll.payrollNumber}`
    });

    res.json({ message: 'Payroll record deleted successfully' });
  })
);

// Get payroll summary for employee
router.get(
  '/employee/:employeeId/summary',
  asyncHandler(async (req, res) => {
    const payrolls = await EmployeePayroll.find({
      employee: req.params.employeeId
    }).populate('employee');

    const summary = {
      employeeId: req.params.employeeId,
      totalPayrolls: payrolls.length,
      totalEarnings: 0,
      totalDeductions: 0,
      totalTaxes: 0,
      totalNetPay: 0,
      payrolls
    };

    payrolls.forEach(payroll => {
      summary.totalEarnings += payroll.totalEarnings || 0;
      summary.totalDeductions += payroll.totalDeductions || 0;
      summary.totalTaxes += payroll.totalTaxes || 0;
      summary.totalNetPay += payroll.netPay || 0;
    });

    res.json(summary);
  })
);

module.exports = router;
