const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth } = require('../util');
const logActivity = require('../util/activityLogger');
const LivestockRecord = require('../models/livestockRecordModel');
const LivestockBatch = require('../models/livestockBatchModel');

const LivestockRecordRoute = express.Router();

// GET all animals
LivestockRecordRoute.get('/', expressAsync(async (req, res) => {
  const { batch, status, health } = req.query;
  const filter = { owner: req.user?._id };
  
  if (batch) filter.batch = batch;
  if (status) filter.status = status;
  if (health) filter.health = health;
  
  const records = await LivestockRecord.find(filter)
    .populate('batch', 'batchName')
    .populate('livestockType', 'name')
    .sort({ createdAt: -1 });
  
  res.send(records);
}));

// GET animal by ID
LivestockRecordRoute.get('/:id', expressAsync(async (req, res) => {
  const record = await LivestockRecord.findById(req.params.id)
    .populate('batch')
    .populate('livestockType')
    .populate('createdBy', 'name');
  
  if (!record) {
    return res.status(404).send({ message: 'Animal record not found' });
  }
  
  res.send(record);
}));

// CREATE new animal record
LivestockRecordRoute.post('/', isAuth, expressAsync(async (req, res) => {
  try {
    // Verify batch exists
    const batch = await LivestockBatch.findById(req.body.batch);
    if (!batch) {
      return res.status(400).send({ message: 'Batch not found' });
    }
    
    const record = new LivestockRecord({
      batch: req.body.batch,
      livestockType: req.body.livestockType,
      identificationNumber: req.body.identificationNumber,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      weight: req.body.weight,
      health: req.body.health || 'Healthy',
      productionMetrics: {
        dailyProduction: req.body.dailyProduction || 0,
        productivityPercentage: req.body.productivityPercentage || 0
      },
      feedingSchedule: {
        dailyAllowance: req.body.dailyAllowance || 0,
        feedType: req.body.feedType
      },
      status: 'Active',
      notes: req.body.notes,
      createdBy: req.user._id,
      owner: req.user._id
    });
    
    const createdRecord = await record.save();
    await logActivity(req.user._id, 'LIVESTOCK_RECORD_CREATED', `Created animal record: ${createdRecord.animalCode}`);
    
    res.status(201).send(createdRecord);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// UPDATE animal record
LivestockRecordRoute.put('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const record = await LivestockRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).send({ message: 'Animal record not found' });
    }
    
    // Check authorization
    if (record.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Not authorized to update' });
    }
    
    Object.assign(record, req.body);
    const updatedRecord = await record.save();
    await logActivity(req.user._id, 'LIVESTOCK_RECORD_UPDATED', `Updated animal record: ${updatedRecord.animalCode}`);
    
    res.send(updatedRecord);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// UPDATE animal health status
LivestockRecordRoute.patch('/:id/health', isAuth, expressAsync(async (req, res) => {
  try {
    const record = await LivestockRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).send({ message: 'Animal record not found' });
    }
    
    const oldHealth = record.health;
    record.health = req.body.health;
    
    const updatedRecord = await record.save();
    await logActivity(req.user._id, 'LIVESTOCK_HEALTH_UPDATED', `Updated health status from ${oldHealth} to ${req.body.health}`);
    
    res.send(updatedRecord);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// UPDATE production metrics
LivestockRecordRoute.patch('/:id/production', isAuth, expressAsync(async (req, res) => {
  try {
    const record = await LivestockRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).send({ message: 'Animal record not found' });
    }
    
    record.productionMetrics.dailyProduction = req.body.dailyProduction;
    record.productionMetrics.lastProductionDate = new Date();
    record.productionMetrics.cumulativeProduction = 
      (record.productionMetrics.cumulativeProduction || 0) + req.body.dailyProduction;
    
    const updatedRecord = await record.save();
    await logActivity(req.user._id, 'LIVESTOCK_PRODUCTION_UPDATED', `Recorded production for animal: ${updatedRecord.animalCode}`);
    
    res.send(updatedRecord);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// DELETE animal record
LivestockRecordRoute.delete('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const record = await LivestockRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).send({ message: 'Animal record not found' });
    }
    
    // Check authorization
    if (record.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Not authorized to delete' });
    }
    
    await LivestockRecord.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'LIVESTOCK_RECORD_DELETED', `Deleted animal record: ${record.animalCode}`);
    
    res.send({ message: 'Animal record deleted successfully' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

module.exports = LivestockRecordRoute;
