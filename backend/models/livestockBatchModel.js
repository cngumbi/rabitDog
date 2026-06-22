const mongoose = require('mongoose');

const livestockBatchSchema = new mongoose.Schema({
  batchCode: { type: String, unique: true, index: true, sparse: true },
  livestockType: { type: mongoose.Schema.Types.ObjectId, ref: 'LivestockType', required: true },
  batchName: { type: String, required: true },
  startDate: { type: Date, required: true, default: Date.now },
  expectedEndDate: { type: Date },
  actualEndDate: { type: Date },
  quantity: { type: Number, required: true, default: 0 },
  currentQuantity: { type: Number, required: true, default: 0 },
  unitCost: { type: Number, required: true, default: 0 },
  totalCost: { type: Number, default: 0 },
  location: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Active', 'Completed', 'Suspended', 'Archived'], 
    default: 'Active',
    index: true
  },
  purpose: { type: String, enum: ['Breeding', 'Fattening', 'Production', 'Sales', 'Other'], default: 'Production' },
  healthStatus: { 
    type: String, 
    enum: ['Healthy', 'Warning', 'Critical', 'Recovering'], 
    default: 'Healthy'
  },
  feedType: { type: String },
  feedQuantity: { type: Number, default: 0 }, // total kg allocated
  waterSource: { type: String },
  vaccinations: [{
    vaccineName: String,
    dateAdministered: Date,
    nextDueDate: Date,
    administeredBy: String,
    notes: String
  }],
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Generate batch code automatically
livestockBatchSchema.pre('save', function(next) {
  try {
    if (!this.batchCode && this._id) {
      const idStr = this._id.toString();
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      this.batchCode = `LB-${date}-${idStr.slice(-6).toUpperCase()}`;
    }
    // Calculate total cost
    if (this.quantity && this.unitCost) {
      this.totalCost = this.quantity * this.unitCost;
    }
  } catch (e) { /* ignore */ }
  next();
});

const LivestockBatch = mongoose.model('LivestockBatch', livestockBatchSchema);
module.exports = LivestockBatch;
