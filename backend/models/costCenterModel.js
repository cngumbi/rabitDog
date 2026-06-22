const mongoose = require('mongoose');

const CostCenterSchema = new mongoose.Schema(
  {
    costCenterCode: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true
    },
    costCenterName: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    department: String,
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    budget: {
      type: Number,
      default: 0
    },
    spent: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    costType: {
      type: String,
      enum: ['Revenue', 'Support', 'Administrative', 'Production', 'Distribution', 'Other']
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CostCenter'
    },
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

module.exports = mongoose.model('CostCenter', CostCenterSchema);
