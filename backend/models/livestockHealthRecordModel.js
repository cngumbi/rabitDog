const mongoose = require('mongoose');

const livestockHealthRecordSchema = new mongoose.Schema({
  recordCode: { type: String, unique: true, index: true, sparse: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'LivestockBatch' },
  animal: { type: mongoose.Schema.Types.ObjectId, ref: 'LivestockRecord' },
  recordDate: { type: Date, required: true, default: Date.now },
  recordType: { 
    type: String, 
    enum: ['Illness', 'Vaccination', 'Treatment', 'Routine Check', 'Injury', 'Mortality'], 
    required: true 
  },
  description: { type: String, required: true },
  symptoms: [String],
  diagnosis: { type: String },
  treatment: { 
    medicineName: String,
    dosage: String,
    frequency: String,
    duration: Number, // days
    cost: Number
  },
  veterinarian: { type: String },
  severity: { 
    type: String, 
    enum: ['Mild', 'Moderate', 'Severe', 'Critical', 'Healed'],
    default: 'Mild'
  },
  outcome: { 
    type: String, 
    enum: ['Recovered', 'Ongoing', 'Deceased', 'Culled', 'Transferred'],
    default: 'Ongoing'
  },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  cost: { type: Number, default: 0 },
  notes: { type: String },
  trackEntries: [{
    message: { type: String, default: 'Health tracker update' },
    note: { type: String },
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe', 'Critical']
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate record code automatically
livestockHealthRecordSchema.pre('save', function(next) {
  try {
    if (!this.recordCode && this._id) {
      const idStr = this._id.toString();
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      this.recordCode = `LH-${date}-${idStr.slice(-6).toUpperCase()}`;
    }
  } catch (e) { /* ignore */ }
  next();
});

const LivestockHealthRecord = mongoose.model('LivestockHealthRecord', livestockHealthRecordSchema);
module.exports = LivestockHealthRecord;
