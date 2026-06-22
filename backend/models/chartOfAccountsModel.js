const mongoose = require('mongoose');

const ChartOfAccountsSchema = new mongoose.Schema(
  {
    accountCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    accountName: {
      type: String,
      required: true,
      trim: true
    },
    accountType: {
      type: String,
      enum: [
        'Asset',
        'Liability',
        'Equity',
        'Income',
        'Expense',
        'Cost of Goods Sold',
        'Contra-Asset',
        'Contra-Liability',
        'Contra-Equity'
      ],
      required: true
    },
    subType: {
      type: String,
      enum: [
        // Asset subtypes
        'Current Asset',
        'Fixed Asset',
        'Intangible Asset',
        // Liability subtypes
        'Current Liability',
        'Long-term Liability',
        // Income subtypes
        'Operating Income',
        'Non-Operating Income',
        // Expense subtypes
        'Operating Expense',
        'Non-Operating Expense',
        'Interest Expense',
        'Tax Expense'
      ]
    },
    description: String,
    normalBalance: {
      type: String,
      enum: ['Debit', 'Credit'],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    openingBalance: {
      type: Number,
      default: 0
    },
    currentBalance: {
      type: Number,
      default: 0
    },
    parentAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccounts'
    },
    costCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CostCenter'
    },
    allowEdit: {
      type: Boolean,
      default: true
    },
    requiresApproval: {
      type: Boolean,
      default: false
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

ChartOfAccountsSchema.index({ accountCode: 1, accountType: 1 });
ChartOfAccountsSchema.index({ accountType: 1 });

module.exports = mongoose.model('ChartOfAccounts', ChartOfAccountsSchema);
