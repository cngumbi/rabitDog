const mongoose = require('mongoose');

const livestockRecordSchema = new mongoose.Schema({
  animalCode: { type: String, unique: true, index: true, sparse: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'LivestockBatch', required: true },
  livestockType: { type: mongoose.Schema.Types.ObjectId, ref: 'LivestockType', required: true },
  identificationNumber: { type: String }, // ear tag, wing band, etc.
  gender: { type: String, enum: ['Male', 'Female', 'Mixed', 'Unknown'], default: 'Unknown' },
  dateOfBirth: { type: Date },
  age: { type: Number }, // in days
  weight: { type: Number, default: 0 }, // kg
  health: { 
    type: String, 
    enum: ['Healthy', 'Sick', 'Treated', 'Injured', 'Pregnant', 'Lactating', 'Deceased'], 
    default: 'Healthy'
  },
  pregnancyStatus: {
    isPregnant: { type: Boolean, default: false },
    conceivedDate: { type: Date },
    expectedDeliveryDate: { type: Date },
    deliveryDate: { type: Date },
    numberOfOffsprings: { type: Number, default: 0 }
  },
  productionMetrics: {
    dailyProduction: { type: Number, default: 0 }, // eggs/liters/kg
    cumulativeProduction: { type: Number, default: 0 },
    lastProductionDate: { type: Date },
    productivityPercentage: { type: Number, default: 0 }
  },
  feedingSchedule: {
    dailyAllowance: { type: Number, default: 0 }, // kg
    feedType: String,
    specialDiet: { type: Boolean, default: false },
    dietNotes: String
  },
  status: { 
    type: String, 
    enum: ['Active', 'Sold', 'Transferred', 'Deceased', 'Culled'],
    default: 'Active'
  },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate animal code automatically
livestockRecordSchema.pre('save', function(next) {
  try {
    if (!this.animalCode && this._id) {
      const idStr = this._id.toString();
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      this.animalCode = `LA-${date}-${idStr.slice(-6).toUpperCase()}`;
    }
  } catch (e) { /* ignore */ }
  next();
});

const LivestockRecord = mongoose.model('LivestockRecord', livestockRecordSchema);
module.exports = LivestockRecord;
