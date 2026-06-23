const mongoose = require('mongoose');

const livestockTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String },
  category: { type: String, enum: ['Poultry', 'Apiary', 'Livestock', 'Aquaculture', 'Other'], required: true },
  avgGestation: { type: Number, default: 0 }, // days
  avgProductiveLife: { type: Number, default: 0 }, // years
  avgDailyFeed: { type: Number, default: 0 }, // kg per day
  avgWaterIntake: { type: Number, default: 0 }, // liters per day
  productionType: [{ type: String, enum: ['Eggs', 'Milk', 'Meat', 'Honey', 'Wool', 'Other'] }],
  temperatureRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 30 }
  },
  humidityRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 }
  },
  isActive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Create compound unique index on name and category
livestockTypeSchema.index({ name: 1, category: 1 }, { unique: true, sparse: true });

const LivestockType = mongoose.model('LivestockType', livestockTypeSchema);
module.exports = LivestockType;
