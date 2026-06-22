const mongoose = require('mongoose');

const ForecastLineSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true
  },
  month: Number,
  year: Number,
  forecastAmount: Number,
  actualAmount: Number,
  variance: Number,
  variancePercent: Number
});

const ForecastSchema = new mongoose.Schema(
  {
    forecastCode: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true
    },
    forecastName: {
      type: String,
      required: true,
      trim: true
    },
    forecastType: {
      type: String,
      enum: ['Revenue', 'Expense', 'Cash Flow', 'Balance Sheet', 'Comprehensive'],
      required: true
    },
    fiscalYear: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    scenario: {
      type: String,
      enum: ['Conservative', 'Base Case', 'Optimistic', 'Custom'],
      default: 'Base Case'
    },
    lines: [ForecastLineSchema],
    totalForecast: Number,
    totalActual: Number,
    totalVariance: Number,
    accuracy: Number,
    status: {
      type: String,
      enum: ['Draft', 'Approved', 'Active', 'Archived'],
      default: 'Draft'
    },
    baselineForecast: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Forecast'
    },
    assumptions: [
      {
        key: String,
        value: String,
        justification: String
      }
    ],
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
    reviewComments: String,
    notes: String,
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

ForecastSchema.index({ fiscalYear: 1, forecastType: 1 });
ForecastSchema.index({ status: 1 });

module.exports = mongoose.model('Forecast', ForecastSchema);
