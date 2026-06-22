const mongoose = require('mongoose');

const PayrollItemSchema = new mongoose.Schema({
  itemCode: String,
  itemName: String,
  itemType: {
    type: String,
    enum: ['Earning', 'Deduction', 'Tax'],
    required: true
  },
  amount: Number,
  percentage: Number,
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts'
  }
});

const PayrollConfigurationSchema = new mongoose.Schema(
  {
    configCode: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    payrollPeriod: {
      type: String,
      enum: ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'],
      default: 'Monthly',
      required: true
    },
    payrollCycle: {
      startDate: Date,
      endDate: Date,
      payDate: Date
    },
    currency: {
      type: String,
      default: 'USD'
    },
    earnings: [PayrollItemSchema],
    deductions: [PayrollItemSchema],
    taxes: [PayrollItemSchema],
    payrollExpenseAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccounts'
    },
    payrollLiabilityAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccounts'
    },
    taxFilingFrequency: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
      default: 'Quarterly'
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

module.exports = mongoose.model('PayrollConfiguration', PayrollConfigurationSchema);
