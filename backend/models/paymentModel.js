const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      unique: true,
      index: true,
      required: true
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    paymentType: {
      type: String,
      enum: ['Invoice Payment', 'Bill Payment', 'Expense Reimbursement', 'Salary', 'Refund'],
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Check', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Digital Wallet'],
      required: true
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    reference: String,
    description: String,
    linkedDocuments: [
      {
        documentType: String, // 'Invoice', 'Bill', 'Expense'
        documentId: mongoose.Schema.Types.ObjectId,
        amountApplied: Number
      }
    ],
    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount'
    },
    journalEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JournalEntry'
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Completed', 'Voided', 'Reversed'],
      default: 'Draft'
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

PaymentSchema.index({ paymentDate: 1, status: 1 });
PaymentSchema.index({ paymentType: 1 });
PaymentSchema.index({ payee: 1 });
PaymentSchema.index({ vendor: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
