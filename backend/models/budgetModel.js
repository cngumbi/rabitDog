const mongoose = require('mongoose');

const BudgetLineSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true
  },
  costCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CostCenter'
  },
  budgetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  actualAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  variance: Number,
  variancePercent: Number
});

const BudgetSchema = new mongoose.Schema(
  {
    budgetName: {
      type: String,
      required: true,
      trim: true
    },
    budgetCode: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true
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
    description: String,
    lines: [BudgetLineSchema],
    totalBudgetAmount: Number,
    totalActualAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Draft', 'Approved', 'Active', 'Closed'],
      default: 'Draft'
    },
    budgetType: {
      type: String,
      enum: ['Operating', 'Capital', 'Cash', 'Project', 'Department'],
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
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

BudgetSchema.index({ fiscalYear: 1, status: 1 });
BudgetSchema.index({ budgetType: 1 });

module.exports = mongoose.model('Budget', BudgetSchema);
