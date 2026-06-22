const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth } = require('../util');
const logActivity = require('../util/activityLogger');
const LivestockFeedingRecord = require('../models/livestockFeedingRecordModel');

const LivestockFeedingRoute = express.Router();

// GET all feeding records
LivestockFeedingRoute.get('/', expressAsync(async (req, res) => {
  const { batch, feedType, startDate, endDate } = req.query;
  const filter = { owner: req.user?._id };
  
  if (batch) filter.batch = batch;
  if (feedType) filter.feedType = feedType;
  
  if (startDate || endDate) {
    filter.feedingDate = {};
    if (startDate) filter.feedingDate.$gte = new Date(startDate);
    if (endDate) filter.feedingDate.$lte = new Date(endDate);
  }
  
  const records = await LivestockFeedingRecord.find(filter)
    .populate('batch', 'batchName')
    .populate('supplier', 'name')
    .populate('recordedBy', 'name')
    .sort({ feedingDate: -1 });
  
  res.send(records);
}));

// GET feeding record by ID
LivestockFeedingRoute.get('/:id', expressAsync(async (req, res) => {
  const record = await LivestockFeedingRecord.findById(req.params.id)
    .populate('batch')
    .populate('supplier')
    .populate('recordedBy', 'name');
  
  if (!record) {
    return res.status(404).send({ message: 'Feeding record not found' });
  }
  
  res.send(record);
}));

// CREATE new feeding record
LivestockFeedingRoute.post('/', isAuth, expressAsync(async (req, res) => {
  try {
    const record = new LivestockFeedingRecord({
      batch: req.body.batch,
      feedingDate: req.body.feedingDate || new Date(),
      feedingTime: req.body.feedingTime,
      feedType: req.body.feedType,
      quantityFed: req.body.quantityFed,
      quantityAllocated: req.body.quantityAllocated,
      costPerKg: req.body.costPerKg || 0,
      supplier: req.body.supplier,
      feedQuality: req.body.feedQuality || 'Good',
      animalCondition: req.body.animalCondition || 'Normal consumption',
      wastage: req.body.wastage || 0,
      notes: req.body.notes,
      recordedBy: req.user._id,
      owner: req.user._id
    });
    
    const createdRecord = await record.save();
    await logActivity(req.user._id, 'LIVESTOCK_FEEDING_RECORD_CREATED', `Created feeding record: ${createdRecord.feedingCode}`);
    
    res.status(201).send(createdRecord);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// UPDATE feeding record
LivestockFeedingRoute.put('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const record = await LivestockFeedingRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).send({ message: 'Feeding record not found' });
    }
    
    // Check authorization
    if (record.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Not authorized to update' });
    }
    
    Object.assign(record, req.body);
    const updatedRecord = await record.save();
    await logActivity(req.user._id, 'LIVESTOCK_FEEDING_RECORD_UPDATED', `Updated feeding record: ${updatedRecord.feedingCode}`);
    
    res.send(updatedRecord);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// GET feeding summary for batch
LivestockFeedingRoute.get('/batch/:batchId/summary', expressAsync(async (req, res) => {
  try {
    const records = await LivestockFeedingRecord.find({ batch: req.params.batchId });
    
    const summary = {
      totalQuantityFed: 0,
      totalQuantityAllocated: 0,
      totalCost: 0,
      averageFeedQuality: 'Good',
      recordCount: records.length,
      lastFeedingDate: null
    };
    
    records.forEach(record => {
      summary.totalQuantityFed += record.quantityFed || 0;
      summary.totalQuantityAllocated += record.quantityAllocated || 0;
      summary.totalCost += record.totalCost || 0;
    });
    
    if (records.length > 0) {
      summary.lastFeedingDate = records[0].feedingDate;
    }
    
    res.send(summary);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// DELETE feeding record
LivestockFeedingRoute.delete('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const record = await LivestockFeedingRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).send({ message: 'Feeding record not found' });
    }
    
    // Check authorization
    if (record.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Not authorized to delete' });
    }
    
    await LivestockFeedingRecord.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'LIVESTOCK_FEEDING_RECORD_DELETED', `Deleted feeding record: ${record.feedingCode}`);
    
    res.send({ message: 'Feeding record deleted successfully' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

module.exports = LivestockFeedingRoute;
