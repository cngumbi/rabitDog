const express = require('express');
const asyncHandler = require('express-async-handler');
const { isAuth } = require('../util');
const Invoice = require('../models/invoiceModel');
const Profile = require('../models/profileModel');
const JournalEntry = require('../models/journalEntryModel');
const AuditLog = require('../models/auditLogModel');
const transporter = require('../middleware/sendmail');
const config = require('../config/config');

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
    const totalAmount = subtotal + taxAmount - discountAmount;
    const invoice = await Invoice.create({
      invoiceNumber,
      customer,
      lineItems,
      subtotal,
      taxAmount,
      discountAmount,
      total: totalAmount,
      balanceDue: totalAmount,
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
    const normalizedStatus = String(status || '').trim();
    if (normalizedStatus) {
      const escapedStatus = normalizedStatus.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.status = new RegExp(`^${escapedStatus}$`, 'i');
    }
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

// Get aging report
router.get(
  '/reports/aging',
  asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({
      status: { $in: ['Sent', 'Viewed', 'Partially Paid', 'Overdue'] }
    }).populate('customer').populate('partyId');

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
      const daysDue = invoice.dueDate ? Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24)) : 0;
      const balance = Number(invoice.balanceDue ?? (invoice.total - invoice.amountPaid)) || 0;

      if (daysDue <= 0) {
        agingReport.current += balance;
        agingReport.invoices.current.push(invoice);
      } else if (daysDue <= 30) {
        agingReport.days30 += balance;
        agingReport.invoices.days30.push(invoice);
      } else if (daysDue <= 60) {
        agingReport.days60 += balance;
        agingReport.invoices.days60.push(invoice);
      } else if (daysDue <= 90) {
        agingReport.days90 += balance;
        agingReport.invoices.days90.push(invoice);
      } else {
        agingReport.over90 += balance;
        agingReport.invoices.over90.push(invoice);
      }
    });

    res.json(agingReport);
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

// Send Invoice (also attempt to email the invoice)
router.post(
  '/:id/send',
  isAuth,
  asyncHandler(async (req, res) => {
    const currentUserId = req.user?.id || req.user?._id || req.session.user?.id || req.session.user?._id;

    let invoice = await Invoice.findById(req.params.id).populate('customer partyId');
    const profile = await Profile.findOne({ user: req.user._id });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const settings = profile?.settings || {};
    const businessName = settings.workspaceName || 'RabitDog Accounting';
    const businessEmail = settings.businessEmail || 'billing@rabitdog.com';
    const currency = settings.currency || 'Ksh';
    const customerName = invoice.customer?.name || invoice.partyId?.name || 'Customer';
    const customerEmail = invoice.customer?.email || invoice.partyId?.email;

    const formatCurrency = (value) => {
      const amount = Number(value || 0);
      if (currency === 'USD') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
      if (currency === 'EUR') return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);
      if (currency === 'GBP') return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
      return `${currency}${amount.toFixed(2)}`;
    };

    const itemsHtml = Array.isArray(invoice.lineItems) && invoice.lineItems.length ? invoice.lineItems.map(item => `
      <tr>
        <td style="padding:8px; border:1px solid #e2e8f0;">${item.description || '—'}</td>
        <td style="padding:8px; border:1px solid #e2e8f0; text-align:center;">${item.quantity || 0}</td>
        <td style="padding:8px; border:1px solid #e2e8f0; text-align:right;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding:8px; border:1px solid #e2e8f0; text-align:right;">${formatCurrency(item.taxAmount)}</td>
        <td style="padding:8px; border:1px solid #e2e8f0; text-align:right;">${formatCurrency(item.lineTotal)}</td>
      </tr>
    `).join('') : `<tr><td colspan="5" style="padding:8px; border:1px solid #e2e8f0; text-align:center;">No line items found.</td></tr>`;

    const invoiceHtml = `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#111; padding:16px; max-width:800px; margin:auto;">
        <style>
          @page { margin: 12mm; }
          body { margin: 0; }
          .invoice-header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
          .company-name { font-size: 24px; margin: 0; }
          .company-details, .invoice-details { font-size: 12px; line-height: 1.4; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; }
          th { background: #f3f4f6; text-align: left; }
          .amount { text-align: right; }
          .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-bottom: 10px; }
          .summary div { background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; }
        </style>
        <div class="invoice-header">
          <div>
            <p class="company-name">${businessName}</p>
            <p class="company-details">${businessEmail}</p>
          </div>
          <div class="invoice-details">
            <p><strong>Invoice:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Status:</strong> ${invoice.status}</p>
          </div>
        </div>
        <div style="margin-bottom: 12px;">
          <p style="margin:0 0 4px;"><strong>Bill To:</strong></p>
          <p style="margin:0;">${customerName}</p>
          <p style="margin:0;">${customerEmail || ''}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th class="amount">Unit Price</th>
              <th class="amount">Tax</th>
              <th class="amount">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="summary">
          <div><strong>Total:</strong><br>${formatCurrency(invoice.total)}</div>
          <div><strong>Amount Paid:</strong><br>${formatCurrency(invoice.amountPaid)}</div>
          <div><strong>Balance Due:</strong><br>${formatCurrency(invoice.balanceDue)}</div>
        </div>
        <p style="font-size:11px;">Thank you for your business.</p>
      </div>
    `;

    // Attempt to send email if recipient exists and transporter configured
    let mailResult = null;
    if (customerEmail && transporter) {
      try {
        const mailOptions = {
          from: config.NODE_CODE_EMAIL_ADDRESS,
          to: customerEmail,
          subject: `Invoice ${invoice.invoiceNumber}`,
          html: invoiceHtml
        };

        mailResult = await transporter.sendMail(mailOptions);
      } catch (err) {
        console.error('Error sending invoice email:', err);
        mailResult = { error: err.message || 'Failed to send invoice email' };
      }
    } else {
      mailResult = { warning: 'No customer email configured or email transporter unavailable.' };
    }

    // Update invoice status and audit
    invoice.status = 'Sent';
    invoice.updatedBy = currentUserId;
    await invoice.save();

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

    res.json({
      message: 'Invoice sent successfully',
      invoice,
      mailResult,
      emailSent: !!(mailResult && mailResult.accepted && mailResult.accepted.length),
      emailInfo: mailResult
    });
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

module.exports = router;
