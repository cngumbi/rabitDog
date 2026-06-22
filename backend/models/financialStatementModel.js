const mongoose = require('mongoose');

const FinancialStatementSchema = new mongoose.Schema(
  {
    reportCode: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true
    },
    reportName: {
      type: String,
      required: true,
      trim: true,
      enum: ['Income Statement', 'Balance Sheet', 'Cash Flow Statement', 'Trial Balance', 'Statement of Changes in Equity']
    },
    reportType: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Annual', 'Custom'],
      required: true
    },
    fiscalYear: Number,
    reportPeriodStart: {
      type: Date,
      required: true
    },
    reportPeriodEnd: {
      type: Date,
      required: true
    },
    reportData: {
      sections: [
        {
          sectionName: String,
          subsections: [
            {
              subsectionName: String,
              lineItems: [
                {
                  lineNumber: String,
                  description: String,
                  account: mongoose.Schema.Types.ObjectId,
                  amount: Number,
                  percentage: Number,
                  notes: String
                }
              ],
              subtotal: Number
            }
          ],
          total: Number
        }
      ]
    },
    comparativePeriod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinancialStatement'
    },
    variance: {
      amount: Number,
      percent: Number
    },
    notes: [
      {
        noteNumber: Number,
        description: String,
        content: String
      }
    ],
    status: {
      type: String,
      enum: ['Draft', 'Reviewed', 'Approved', 'Published'],
      default: 'Draft'
    },
    preparedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
    publishDate: Date,
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

FinancialStatementSchema.index({ reportName: 1, fiscalYear: 1 });
FinancialStatementSchema.index({ status: 1 });

module.exports = mongoose.model('FinancialStatement', FinancialStatementSchema);
