const mongoose = require('mongoose');

const TaxRateSchema = new mongoose.Schema({
  taxName: {
    type: String,
    required: true
  },
  taxRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  effectiveDate: Date,
  expiryDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

const TaxConfigurationSchema = new mongoose.Schema(
  {
    taxCode: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true
    },
    taxName: {
      type: String,
      required: true,
      trim: true
    },
    taxType: {
      type: String,
      enum: ['Sales Tax', 'VAT', 'Service Tax', 'Excise Tax', 'Property Tax', 'Payroll Tax'],
      required: true
    },
    taxRates: [TaxRateSchema],
    applicableAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChartOfAccounts'
      }
    ],
    taxPayableAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccounts'
    },
    taxExpenseAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccounts'
    },
    taxAuthority: String,
    registrationNumber: String,
    filingFrequency: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
      default: 'Quarterly'
    },
    nextFilingDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    applicableRegions: [String],
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

module.exports = mongoose.model('TaxConfiguration', TaxConfigurationSchema);
