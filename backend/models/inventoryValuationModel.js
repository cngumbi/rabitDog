const mongoose = require('mongoose');

const InventoryValuationSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0
    },
    unitCost: {
      type: Number,
      required: true,
      default: 0
    },
    valuationMethod: {
      type: String,
      enum: ['FIFO', 'LIFO', 'Weighted Average', 'Standard Cost'],
      default: 'FIFO'
    },
    totalValue: {
      type: Number,
      default: 0
    },
    costOfGoodsSoldAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccounts'
    },
    inventoryAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccounts'
    },
    reorderPoint: {
      type: Number,
      default: 0
    },
    reorderQuantity: {
      type: Number,
      default: 0
    },
    lastCostUpdate: Date,
    lastInventoryCount: Date,
    discrepancies: [
      {
        date: Date,
        expectedQuantity: Number,
        actualQuantity: Number,
        variance: Number,
        reason: String,
        resolvedBy: mongoose.Schema.Types.ObjectId,
        resolvedDate: Date
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

InventoryValuationSchema.index({ product: 1 });
InventoryValuationSchema.index({ quantity: 1 });

module.exports = mongoose.model('InventoryValuation', InventoryValuationSchema);
