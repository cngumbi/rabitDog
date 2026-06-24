const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth } = require('../util');
const logActivity = require('../util/activityLogger');
const LivestockHealthRecord = require('../models/livestockHealthRecordModel');
const LivestockRecord = require('../models/livestockRecordModel');

const LivestockHealthRoute = express.Router();

// GET all health records
LivestockHealthRoute.get('/', isAuth, expressAsync(async (req, res) => {
  const { batch, recordType, severity } = req.query;
  const filter = { owner: req.user._id };
  
  if (batch) filter.batch = batch;
  if (recordType) filter.recordType = recordType;
  if (severity) filter.severity = severity;
  
  const records = await LivestockHealthRecord.find(filter)
    .populate('batch', 'batchName')
    .populate('animal')
    .populate('recordedBy', 'name')
    .sort({ recordDate: -1 });
  
  res.send(records);
}));

// GET health record by ID
LivestockHealthRoute.get('/:id', isAuth, expressAsync(async (req, res) => {
  const record = await LivestockHealthRecord.findById(req.params.id)
    .populate('batch')
    .populate('animal')
    .populate('recordedBy', 'name');
  
  if (!record) {
    return res.status(404).send({ message: 'Health record not found' });
  }
  
  res.send(record);
}));

// CREATE new health record
LivestockHealthRoute.post('/', isAuth, expressAsync(async (req, res) => {
  try {
    const record = new LivestockHealthRecord({
      batch: req.body.batch,
      animal: req.body.animal,
      recordDate: req.body.recordDate || new Date(),
      recordType: req.body.recordType,
      description: req.body.description,
      symptoms: req.body.symptoms,
      diagnosis: req.body.diagnosis,
      treatment: req.body.treatment,
      veterinarian: req.body.veterinarian,
      severity: req.body.severity || 'Mild',
      outcome: req.body.outcome || 'Ongoing',
      followUpRequired: req.body.followUpRequired || false,
      followUpDate: req.body.followUpDate,
      cost: req.body.cost || 0,
      notes: req.body.notes,
      recordedBy: req.user._id,
      owner: req.user._id
    });
    
    const createdRecord = await record.save();
    await logActivity(req.user._id, 'LIVESTOCK_HEALTH_RECORD_CREATED', `Created health record: ${createdRecord.recordCode}`);
    
    res.status(201).send(createdRecord);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// UPDATE health record
LivestockHealthRoute.put('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const record = await LivestockHealthRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).send({ message: 'Health record not found' });
    }
    
    // Check authorization
    if (record.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Not authorized to update' });
    }

    const { trackEntry, trackerNote, trackerSeverity: trackerSeverityInput, trackerMessage, severity, notes, ...rest } = req.body;

    if (severity) {
      record.severity = severity;
    }

    if (notes !== undefined) {
      record.notes = String(notes || '').trim();
    }

    const trackerNoteText = trackEntry?.note ?? trackerNote ?? '';
    const trackerSeverityValue = trackEntry?.severity ?? trackerSeverityInput ?? '';
    const trackerMessageText = trackEntry?.message ?? trackerMessage ?? 'Health tracker update';

    if (trackerNoteText || trackerSeverityValue) {
      const trackerEntry = {
        message: trackerMessageText,
        note: trackerNoteText,
        severity: trackerSeverityValue || undefined,
        createdAt: new Date(),
        createdBy: req.user._id
      };

      record.trackEntries = record.trackEntries || [];
      record.trackEntries.push(trackerEntry);

      if (record.animal) {
        const animal = await LivestockRecord.findById(record.animal);
        if (animal) {
          animal.trackerActivities = animal.trackerActivities || [];
          animal.trackerActivities.push({
            ...trackerEntry,
            recordId: record._id,
            recordCode: record.recordCode
          });
          await animal.save();
        }
      }
    }

    Object.assign(record, rest);
    const updatedRecord = await record.save();
    await logActivity(req.user._id, 'LIVESTOCK_HEALTH_RECORD_UPDATED', `Updated health record: ${updatedRecord.recordCode}`);
    
    res.send(updatedRecord);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// DELETE health record
LivestockHealthRoute.delete('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const record = await LivestockHealthRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).send({ message: 'Health record not found' });
    }
    
    // Check authorization
    if (record.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Not authorized to delete' });
    }
    
    await LivestockHealthRecord.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'LIVESTOCK_HEALTH_RECORD_DELETED', `Deleted health record: ${record.recordCode}`);
    
    res.send({ message: 'Health record deleted successfully' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

module.exports = LivestockHealthRoute;
