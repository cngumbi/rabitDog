const express = require('express');
const expressAsync = require('express-async-handler');
const HealthRecord = require('../models/healthRecordModel');
const { isAuth } = require('../util');

const HealthRecordRoute = express.Router();

HealthRecordRoute.get('/', isAuth, expressAsync(async (req, res) => {
    const { searchKeyword, severity, action } = req.query;
    const query = { user: req.user._id };

    if (searchKeyword) {
        const keyword = new RegExp(searchKeyword, 'i');
        query.$or = [
            { batch: keyword },
            { issue: keyword },
            { notes: keyword },
        ];
    }
    if (severity) query.severity = severity;
    if (action) query.action = action;

    const records = await HealthRecord.find(query)
        .sort({ date: -1, createdAt: -1 })
        .limit(200);

    res.send(records);
}));

HealthRecordRoute.get('/summary', isAuth, expressAsync(async (req, res) => {
    const records = await HealthRecord.find({ user: req.user._id });

    const activeBatches = [...new Set(
        records
            .filter((record) => ['Open', 'Monitoring', 'Scheduled'].includes(record.status))
            .map((record) => record.batch)
    )].length;

    const vaccinationDue = records.filter((record) =>
        record.vaccinationDue || record.action === 'Vaccinate' || /vaccination due/i.test(record.issue)
    ).length;

    const healthAlerts = records.filter((record) =>
        record.severity === 'Critical' || record.severity === 'Watch'
    ).length;

    res.send({
        activeBatches,
        vaccinationDue,
        healthAlerts,
        totalRecords: records.length,
    });
}));

HealthRecordRoute.post('/', isAuth, expressAsync(async (req, res) => {
    const { batch, batchName, date, severity, issue, action, notes } = req.body;
    if (!batch || !date || !issue) {
        return res.status(400).send({ message: 'Batch, date, and issue are required.' });
    }

    const normalizedIssue = String(issue).trim();
    const normalizedAction = String(action || 'Monitor').trim();
    const vaccinationDue = /vaccination due/i.test(normalizedIssue) || normalizedAction === 'Vaccinate';
    let status = 'Open';

    if (vaccinationDue) {
        status = 'Scheduled';
    } else if (severity === 'Critical' || severity === 'Watch') {
        status = 'Monitoring';
    }

    const healthRecord = new HealthRecord({
        user: req.user._id,
        batch: String(batch).trim(),
        batchName: String(batchName || '').trim(),
        date: new Date(date),
        severity: severity || 'Normal',
        issue: normalizedIssue,
        action: normalizedAction,
        notes: String(notes || '').trim(),
        status,
        vaccinationDue,
    });

    const createdRecord = await healthRecord.save();
    res.status(201).send(createdRecord);
}));

HealthRecordRoute.put('/:id', isAuth, expressAsync(async (req, res) => {
    const { batch, batchName, date, severity, issue, action, notes, status } = req.body;
    const record = await HealthRecord.findById(req.params.id);

    if (!record) {
        return res.status(404).send({ message: 'Health record not found.' });
    }

    if (record.user.toString() !== req.user._id.toString()) {
        return res.status(403).send({ message: 'Not authorized to update this record.' });
    }

    if (batch) record.batch = String(batch).trim();
    if (batchName !== undefined) record.batchName = String(batchName || '').trim();
    if (date) record.date = new Date(date);
    if (severity) record.severity = severity;
    if (issue) record.issue = String(issue).trim();
    if (action) record.action = String(action).trim();
    if (notes !== undefined) record.notes = String(notes || '').trim();
    if (status) record.status = status;

    const normalizedIssue = record.issue;
    const normalizedAction = record.action;
    record.vaccinationDue = /vaccination due/i.test(normalizedIssue) || normalizedAction === 'Vaccinate';

    const updatedRecord = await record.save();
    res.send(updatedRecord);
}));

HealthRecordRoute.delete('/:id', isAuth, expressAsync(async (req, res) => {
    const record = await HealthRecord.findById(req.params.id);

    if (!record) {
        return res.status(404).send({ message: 'Health record not found.' });
    }

    if (record.user.toString() !== req.user._id.toString()) {
        return res.status(403).send({ message: 'Not authorized to delete this record.' });
    }

    await HealthRecord.findByIdAndDelete(req.params.id);
    res.send({ message: 'Health record deleted successfully.' });
}));

module.exports = HealthRecordRoute;
