const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth } = require('../util');
const logActivity = require('../util/activityLogger');
const LivestockProductionRecord = require('../models/livestockProductionRecordModel');

const LivestockProductionRoute = express.Router();

// GET all production records
LivestockProductionRoute.get('/', isAuth, expressAsync(async (req, res) => {
  const { batch, productionType, status, startDate, endDate } = req.query;
  const filter = { owner: req.user._id };
  
  if (batch) filter.batch = batch;
  if (productionType) filter.productionType = productionType;
  if (status) filter.status = status;
  
  if (startDate || endDate) {
    filter.productionDate = {};
    if (startDate) filter.productionDate.$gte = new Date(startDate);
    if (endDate) filter.productionDate.$lte = new Date(endDate);
  }
  
  const records = await LivestockProductionRecord.find(filter)
    .populate('batch', 'batchName')
    .populate('animal')
    .populate('buyer', 'name')
    .populate('recordedBy', 'name')
    .sort({ productionDate: -1 });
  
  res.send(records);
}));

// GET production record by ID
LivestockProductionRoute.get('/:id', isAuth, expressAsync(async (req, res) => {
  const record = await LivestockProductionRecord.findById(req.params.id)
    .populate('batch')
    .populate('animal')
    .populate('buyer')
    .populate('recordedBy', 'name');
  
  if (!record) {
    return res.status(404).send({ message: 'Production record not found' });
  }
  
  res.send(record);
}));

// CREATE new production record
LivestockProductionRoute.post('/', isAuth, expressAsync(async (req, res) => {
  try {
    const record = new LivestockProductionRecord({
      batch: req.body.batch,
      animal: req.body.animal,
      productionDate: req.body.productionDate || new Date(),
      productionType: req.body.productionType,
      quantity: req.body.quantity,
      unit: req.body.unit,
      quality: req.body.quality || 'Grade A',
      pricePerUnit: req.body.pricePerUnit || 0,
      batchNumber: req.body.batchNumber,
      expiryDate: req.body.expiryDate,
      storageLocation: req.body.storageLocation,
      status: 'Produced',
      notes: req.body.notes,
      recordedBy: req.user._id,
      owner: req.user._id
    });
    
    const createdRecord = await record.save();
    await logActivity(req.user._id, 'LIVESTOCK_PRODUCTION_RECORD_CREATED', `Created production record: ${createdRecord.productionCode}`);
    
    res.status(201).send(createdRecord);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// UPDATE production record
LivestockProductionRoute.put('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const record = await LivestockProductionRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).send({ message: 'Production record not found' });
    }
    
    // Check authorization
    if (record.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Not authorized to update' });
    }
    
    Object.assign(record, req.body);
    const updatedRecord = await record.save();
    await logActivity(req.user._id, 'LIVESTOCK_PRODUCTION_RECORD_UPDATED', `Updated production record: ${updatedRecord.productionCode}`);
    
    res.send(updatedRecord);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// Mark production as sold
LivestockProductionRoute.patch('/:id/sell', isAuth, expressAsync(async (req, res) => {
  try {
    const record = await LivestockProductionRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).send({ message: 'Production record not found' });
    }
    
    record.status = 'Sold';
    record.solDate = new Date();
    record.buyer = req.body.buyer;
    record.salePrice = req.body.salePrice;
    
    // Calculate profit
    if (record.totalValue && record.salePrice) {
      record.profit = (record.quantity * record.salePrice) - record.totalValue;
    }
    
    const updatedRecord = await record.save();
    await logActivity(req.user._id, 'LIVESTOCK_PRODUCTION_SOLD', `Marked production as sold: ${updatedRecord.productionCode}`);
    
    res.send(updatedRecord);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// GET production summary for batch
LivestockProductionRoute.get('/batch/:batchId/summary', expressAsync(async (req, res) => {
  try {
    const records = await LivestockProductionRecord.find({ batch: req.params.batchId });
    
    const summary = {
      totalQuantityProduced: 0,
      totalValue: 0,
      totalRevenue: 0,
      totalProfit: 0,
      recordCount: records.length,
      productionByType: {}
    };
    
    records.forEach(record => {
      summary.totalQuantityProduced += record.quantity || 0;
      summary.totalValue += record.totalValue || 0;
      
      if (record.status === 'Sold') {
        summary.totalRevenue += (record.quantity * record.salePrice) || 0;
        summary.totalProfit += record.profit || 0;
      }
      
      // Group by production type
      if (!summary.productionByType[record.productionType]) {
        summary.productionByType[record.productionType] = {
          quantity: 0,
          value: 0,
          profit: 0
        };
      }
      
      summary.productionByType[record.productionType].quantity += record.quantity || 0;
      summary.productionByType[record.productionType].value += record.totalValue || 0;
      summary.productionByType[record.productionType].profit += record.profit || 0;
    });
    
    res.send(summary);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// DELETE production record
LivestockProductionRoute.delete('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const record = await LivestockProductionRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).send({ message: 'Production record not found' });
    }
    
    // Check authorization
    if (record.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Not authorized to delete' });
    }
    
    await LivestockProductionRecord.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'LIVESTOCK_PRODUCTION_RECORD_DELETED', `Deleted production record: ${record.productionCode}`);
    
    res.send({ message: 'Production record deleted successfully' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

module.exports = LivestockProductionRoute;
