const mongoose = require('mongoose');

const BankStatementLineSchema = new mongoose.Schema({
  date: Date,
  description: String,
  reference: String,
  debit: Number,
  credit: Number,
  balance: Number,
  isReconciled: {
    type: Boolean,
    default: false
  },
  linkedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
});

const BankAccountSchema = new mongoose.Schema(
  {
    accountCode: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true
    },
    accountName: {
      type: String,
      required: true,
      trim: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true
    },
    accountType: {
      type: String,
      enum: ['Checking', 'Savings', 'Money Market', 'Credit Card', 'Line of Credit'],
      required: true
    },
    routingNumber: String,
    swiftCode: String,
    ibanNumber: String,
    currency: {
      type: String,
      default: 'USD'
    },
    openingBalance: Number,
    currentBalance: {
      type: Number,
      default: 0
    },
    lastReconciliationDate: Date,
    lastReconciliationBalance: Number,
    glAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccounts'
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Closed'],
      default: 'Active'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    bankStatementLines: [BankStatementLineSchema],
    unreconciledTransactions: [
      {
        transactionDate: Date,
        amount: Number,
        type: String,
        reference: String,
        description: String
      }
    ],
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

BankAccountSchema.index({ accountNumber: 1 });
BankAccountSchema.index({ status: 1 });

module.exports = mongoose.model('BankAccount', BankAccountSchema);
