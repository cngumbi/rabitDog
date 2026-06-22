const mongoose = require('mongoose');

const livestockFeedingRecordSchema = new mongoose.Schema({
  feedingCode: { type: String, unique: true, index: true, sparse: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'LivestockBatch', required: true },
  feedingDate: { type: Date, required: true, default: Date.now },
  feedingTime: { type: String }, // HH:MM format
  feedType: { type: String, required: true },
  quantityFed: { type: Number, required: true }, // kg
  quantityAllocated: { type: Number, required: true }, // kg
  quantityRemaining: { type: Number }, // kg
  costPerKg: { type: Number, required: true, default: 0 },
  totalCost: { type: Number },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Party' },
  feedQuality: { 
    type: String, 
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  animalCondition: { 
    type: String,
    enum: ['Eagerly consumed', 'Normal consumption', 'Low consumption', 'Refused'],
    default: 'Normal consumption'
  },
  wastage: { type: Number, default: 0 }, // kg
  notes: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate feeding code automatically
livestockFeedingRecordSchema.pre('save', function(next) {
  try {
    if (!this.feedingCode && this._id) {
      const idStr = this._id.toString();
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      this.feedingCode = `LF-${date}-${idStr.slice(-6).toUpperCase()}`;
    }
    // Calculate total cost
    if (this.quantityFed && this.costPerKg) {
      this.totalCost = this.quantityFed * this.costPerKg;
    }
    // Calculate remaining
    if (this.quantityAllocated && this.quantityFed) {
      this.quantityRemaining = this.quantityAllocated - this.quantityFed;
    }
  } catch (e) { /* ignore */ }
  next();
});

const LivestockFeedingRecord = mongoose.model('LivestockFeedingRecord', livestockFeedingRecordSchema);
module.exports = LivestockFeedingRecord;
