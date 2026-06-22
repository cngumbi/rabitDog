const mongoose = require('mongoose');

const EmployeePayrollSchema = new mongoose.Schema(
  {
    payrollNumber: {
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
    payPeriodStart: {
      type: Date,
      required: true
    },
    payPeriodEnd: {
      type: Date,
      required: true
    },
    payDate: {
      type: Date,
      required: true
    },
    earnings: [
      {
        itemCode: String,
        itemName: String,
        amount: Number
      }
    ],
    totalEarnings: {
      type: Number,
      default: 0
    },
    deductions: [
      {
        itemCode: String,
        itemName: String,
        amount: Number
      }
    ],
    totalDeductions: {
      type: Number,
      default: 0
    },
    taxes: [
      {
        taxType: String,
        taxAmount: Number,
        account: mongoose.Schema.Types.ObjectId
      }
    ],
    totalTaxes: {
      type: Number,
      default: 0
    },
    netPay: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'Check', 'Cash', 'Credit Card'],
      required: true
    },
    bankAccount: String,
    status: {
      type: String,
      enum: ['Draft', 'Processed', 'Paid', 'Reversed'],
      default: 'Draft'
    },
    journalEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JournalEntry'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
    notes: String,
    attachments: [String],
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

EmployeePayrollSchema.index({ employee: 1, payPeriodStart: 1 });
EmployeePayrollSchema.index({ status: 1 });

module.exports = mongoose.model('EmployeePayroll', EmployeePayrollSchema);
