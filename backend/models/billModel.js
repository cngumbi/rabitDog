const mongoose = require('mongoose');

const BillLineItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  description: String,
  quantity: Number,
  unitCost: Number,
  lineTotal: Number,
  taxRate: {
    type: Number,
    default: 0
  },
  taxAmount: Number,
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts'
  }
});

const BillSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true,
      index: true,
      required: true
    },
    billDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    dueDate: Date,
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party',
      required: true
    },
    lineItems: [BillLineItemSchema],
    subtotal: Number,
    taxAmount: Number,
    taxRate: Number,
    discountAmount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    balanceDue: Number,
    status: {
      type: String,
      enum: ['Draft', 'Received', 'Reviewed', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Draft'
    },
    paymentTerms: {
      type: String,
      enum: ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Custom'],
      default: 'Net 30'
    },
    paymentMethod: String,
    notes: String,
    linkedPurchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase'
    },
    journalEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JournalEntry'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
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

BillSchema.index({ billDate: 1, status: 1 });
BillSchema.index({ vendor: 1 });
BillSchema.index({ status: 1 });
BillSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Bill', BillSchema);
