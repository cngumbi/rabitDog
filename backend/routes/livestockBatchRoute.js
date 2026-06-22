const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth } = require('../util');
const logActivity = require('../util/activityLogger');
const LivestockBatch = require('../models/livestockBatchModel');
const LivestockRecord = require('../models/livestockRecordModel');

const LivestockBatchRoute = express.Router();

// GET all batches
LivestockBatchRoute.get('/', expressAsync(async (req, res) => {
  const { status, livestockType, location } = req.query;
  const filter = { owner: req.user?._id };
  
  if (status) filter.status = status;
  if (livestockType) filter.livestockType = livestockType;
  if (location) filter.location = location;
  
  const batches = await LivestockBatch.find(filter)
    .populate('livestockType')
    .populate('createdBy', 'name')
    .sort({ startDate: -1 });
  res.send(batches);
}));

// GET batch by ID
LivestockBatchRoute.get('/:id', expressAsync(async (req, res) => {
  const batch = await LivestockBatch.findById(req.params.id)
    .populate('livestockType')
    .populate('createdBy', 'name')
    .populate('owner', 'name');
  
  if (!batch) {
    return res.status(404).send({ message: 'Batch not found' });
  }
  
  // Get livestock records for this batch
  const records = await LivestockRecord.find({ batch: req.params.id });
  
  res.send({ batch, records });
}));

// CREATE new batch
LivestockBatchRoute.post('/', isAuth, expressAsync(async (req, res) => {
  try {
    const batch = new LivestockBatch({
      livestockType: req.body.livestockType,
      batchName: req.body.batchName,
      startDate: req.body.startDate || new Date(),
      expectedEndDate: req.body.expectedEndDate,
      quantity: req.body.quantity,
      currentQuantity: req.body.quantity,
      unitCost: req.body.unitCost,
      location: req.body.location,
      status: 'Active',
      purpose: req.body.purpose,
      feedType: req.body.feedType,
      feedQuantity: req.body.feedQuantity,
      waterSource: req.body.waterSource,
      notes: req.body.notes,
      createdBy: req.user._id,
      owner: req.user._id
    });
    
    const createdBatch = await batch.save();
    await logActivity(req.user._id, 'LIVESTOCK_BATCH_CREATED', `Created batch: ${createdBatch.batchName} (${createdBatch.batchCode})`);
    
    res.status(201).send(createdBatch);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// UPDATE batch
LivestockBatchRoute.put('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const batch = await LivestockBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).send({ message: 'Batch not found' });
    }
    
    // Check authorization
    if (batch.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Not authorized to update' });
    }
    
    Object.assign(batch, req.body);
    const updatedBatch = await batch.save();
    await logActivity(req.user._id, 'LIVESTOCK_BATCH_UPDATED', `Updated batch: ${updatedBatch.batchName}`);
    
    res.send(updatedBatch);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// UPDATE batch status
LivestockBatchRoute.patch('/:id/status', isAuth, expressAsync(async (req, res) => {
  try {
    const batch = await LivestockBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).send({ message: 'Batch not found' });
    }
    
    const oldStatus = batch.status;
    batch.status = req.body.status;
    
    if (req.body.status === 'Completed') {
      batch.actualEndDate = new Date();
    }
    
    const updatedBatch = await batch.save();
    await logActivity(req.user._id, 'LIVESTOCK_BATCH_STATUS_CHANGED', `Changed batch status from ${oldStatus} to ${req.body.status}`);
    
    res.send(updatedBatch);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// Update current quantity
LivestockBatchRoute.patch('/:id/quantity', isAuth, expressAsync(async (req, res) => {
  try {
    const batch = await LivestockBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).send({ message: 'Batch not found' });
    }
    
    const oldQuantity = batch.currentQuantity;
    batch.currentQuantity = req.body.currentQuantity;
    
    const updatedBatch = await batch.save();
    await logActivity(req.user._id, 'LIVESTOCK_BATCH_QUANTITY_UPDATED', `Updated batch quantity from ${oldQuantity} to ${req.body.currentQuantity}`);
    
    res.send(updatedBatch);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// DELETE batch
LivestockBatchRoute.delete('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const batch = await LivestockBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).send({ message: 'Batch not found' });
    }
    
    // Check authorization
    if (batch.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Not authorized to delete' });
    }
    
    await LivestockBatch.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'LIVESTOCK_BATCH_DELETED', `Deleted batch: ${batch.batchName}`);
    
    res.send({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

module.exports = LivestockBatchRoute;
