const mongoose = require('mongoose');

const ExpenseReportLineSchema = new mongoose.Schema({
  expenseDate: Date,
  description: String,
  category: {
    type: String,
    enum: [
      'Travel',
      'Meals',
      'Lodging',
      'Transportation',
      'Office Supplies',
      'Equipment',
      'Software',
      'Professional Services',
      'Utilities',
      'Other'
    ]
  },
  amount: Number,
  receipt: String,
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts'
  },
  costCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CostCenter'
  },
  vendor: String,
  paymentMethod: String
});

const ExpenseReportSchema = new mongoose.Schema(
  {
    reportNumber: {
      type: String,
      unique: true,
      index: true,
      required: true
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reportDate: {
      type: Date,
      default: Date.now
    },
    reportPeriodStart: Date,
    reportPeriodEnd: Date,
    lineItems: [ExpenseReportLineSchema],
    totalAmount: {
      type: Number,
      default: 0
    },
    currencyCode: {
      type: String,
      default: 'USD'
    },
    purpose: String,
    project: String,
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid', 'Reimbursed'],
      default: 'Draft'
    },
    submittedDate: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
    rejectionReason: String,
    advanceAmount: {
      type: Number,
      default: 0
    },
    reimbursementAmount: Number,
    journalEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JournalEntry'
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    attachments: [String],
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

ExpenseReportSchema.index({ employee: 1, reportDate: 1 });
ExpenseReportSchema.index({ status: 1 });

module.exports = mongoose.model('ExpenseReport', ExpenseReportSchema);
