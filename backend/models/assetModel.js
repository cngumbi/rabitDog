const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true
    },
    assetName: {
      type: String,
      required: true,
      trim: true
    },
    assetType: {
      type: String,
      enum: ['Property', 'Equipment', 'Vehicle', 'Technology', 'Furniture', 'Intangible', 'Other'],
      required: true
    },
    description: String,
    location: String,
    purchaseDate: Date,
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party'
    },
    depreciationMethod: {
      type: String,
      enum: ['Straight-Line', 'Declining Balance', 'Units of Production', 'Sum-of-Years-Digits'],
      default: 'Straight-Line'
    },
    usefulLife: {
      type: Number,
      description: 'Useful life in years'
    },
    salvageValue: {
      type: Number,
      default: 0
    },
    depreciationRate: Number,
    accumulatedDepreciation: {
      type: Number,
      default: 0
    },
    bookValue: Number,
    assetAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccounts'
    },
    depreciationExpenseAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccounts'
    },
    accumulatedDepreciationAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccounts'
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Disposed', 'Under Maintenance'],
      default: 'Active'
    },
    disposalDate: Date,
    disposalPrice: Number,
    gainLoss: Number,
    serialNumber: String,
    warrantyExpiry: Date,
    maintenanceSchedule: [
      {
        date: Date,
        description: String,
        cost: Number,
        vendor: String
      }
    ],
    attachments: [String],
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

AssetSchema.index({ assetType: 1, status: 1 });
AssetSchema.index({ purchaseDate: 1 });

module.exports = mongoose.model('Asset', AssetSchema);
