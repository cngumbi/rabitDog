const mongoose = require('mongoose');

const livestockProductionRecordSchema = new mongoose.Schema({
  productionCode: { type: String, unique: true, index: true, sparse: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'LivestockBatch', required: true },
  animal: { type: mongoose.Schema.Types.ObjectId, ref: 'LivestockRecord' },
  productionDate: { type: Date, required: true, default: Date.now },
  productionType: { 
    type: String, 
    enum: ['Eggs', 'Milk', 'Meat', 'Honey', 'Wool', 'Skin', 'Other'],
    required: true 
  },
  quantity: { type: Number, required: true }, // units depend on type
  unit: { type: String, enum: ['Kg', 'Liters', 'Units', 'Grams'], required: true },
  quality: { 
    type: String,
    enum: ['Grade A', 'Grade B', 'Grade C', 'Reject'],
    default: 'Grade A'
  },
  pricePerUnit: { type: Number, required: true, default: 0 },
  totalValue: { type: Number },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  storageLocation: { type: String },
  solDate: { type: Date },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Party' },
  salePrice: { type: Number },
  profit: { type: Number },
  status: { 
    type: String,
    enum: ['Produced', 'Stored', 'Sold', 'Discarded', 'Processed'],
    default: 'Produced'
  },
  notes: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate production code automatically
livestockProductionRecordSchema.pre('save', function(next) {
  try {
    if (!this.productionCode && this._id) {
      const idStr = this._id.toString();
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      this.productionCode = `LP-${date}-${idStr.slice(-6).toUpperCase()}`;
    }
    // Calculate total value
    if (this.quantity && this.pricePerUnit) {
      this.totalValue = this.quantity * this.pricePerUnit;
    }
    // Calculate profit
    if (this.salePrice && this.totalValue) {
      this.profit = (this.quantity * this.salePrice) - this.totalValue;
    }
  } catch (e) { /* ignore */ }
  next();
});

const LivestockProductionRecord = mongoose.model('LivestockProductionRecord', livestockProductionRecordSchema);
module.exports = LivestockProductionRecord;
