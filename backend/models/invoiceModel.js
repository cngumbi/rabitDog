const mongoose = require('mongoose');

const InvoiceLineItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  description: String,
  quantity: Number,
  unitPrice: Number,
  lineTotal: Number,
  taxRate: {
    type: Number,
    default: 0
  },
  taxAmount: Number
});

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      index: true,
      required: true
    },
    invoiceDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    dueDate: Date,
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party'
    },
    lineItems: [InvoiceLineItemSchema],
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
      enum: ['Draft', 'Sent', 'Viewed', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Draft'
    },
    paymentTerms: {
      type: String,
      enum: ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Custom'],
      default: 'Net 30'
    },
    paymentMethod: String,
    notes: String,
    terms: String,
    linkedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    journalEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JournalEntry'
    },
    currency: {
      type: String,
      default: 'USD'
    },
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

InvoiceSchema.index({ invoiceDate: 1, status: 1 });
InvoiceSchema.index({ customer: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
