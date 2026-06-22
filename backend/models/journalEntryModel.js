const mongoose = require('mongoose');

const JournalEntryLineSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  description: String,
  costCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CostCenter'
  },
  department: String
});

const JournalEntrySchema = new mongoose.Schema(
  {
    entryNumber: {
      type: String,
      unique: true,
      index: true,
      required: true
    },
    entryDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    referenceNumber: String,
    lines: [JournalEntryLineSchema],
    totalDebit: {
      type: Number,
      required: true,
      default: 0
    },
    totalCredit: {
      type: Number,
      required: true,
      default: 0
    },
    isBalanced: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Review', 'Approved', 'Posted', 'Reversed'],
      default: 'Draft'
    },
    entryType: {
      type: String,
      enum: [
        'Manual',
        'Sales',
        'Purchase',
        'Payment',
        'Receipt',
        'Adjustment',
        'Depreciation',
        'Accrual',
        'Reversal',
        'Transfer'
      ],
      required: true
    },
    linkedDocument: {
      documentType: String, // 'Order', 'Purchase', 'Invoice', 'Bill'
      documentId: mongoose.Schema.Types.ObjectId
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reversal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JournalEntry'
    },
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

JournalEntrySchema.index({ entryDate: 1, status: 1 });
JournalEntrySchema.index({ status: 1 });
JournalEntrySchema.index({ entryType: 1 });

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);
