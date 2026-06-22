const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    logNumber: {
      type: String,
      unique: true,
      index: true,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'Create',
        'Update',
        'Delete',
        'View',
        'Approve',
        'Reject',
        'Post',
        'Reverse',
        'Reconcile',
        'Export',
        'Print',
        'Download',
        'Login',
        'Logout'
      ]
    },
    module: {
      type: String,
      required: true,
      enum: [
        'Journal Entry',
        'Invoice',
        'Bill',
        'Payment',
        'Chart of Accounts',
        'Budget',
        'Asset',
        'Tax',
        'Payroll',
        'Bank Account',
        'Inventory',
        'Cost Center',
        'Financial Report'
      ]
    },
    entityType: String,
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    },
    entityName: String,
    description: String,
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['Success', 'Failure', 'Pending'],
      default: 'Success'
    },
    errorMessage: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low'
    },
    attachments: [String],
    notes: String
  },
  {
    timestamps: true
  }
);

AuditLogSchema.index({ user: 1, timestamp: 1 });
AuditLogSchema.index({ module: 1, action: 1 });
AuditLogSchema.index({ entityId: 1 });
AuditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
