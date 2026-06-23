const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    batch: {
        type: String,
        required: true,
        trim: true,
    },
    batchName: {
        type: String,
        default: '',
        trim: true,
    },
    date: {
        type: Date,
        required: true,
    },
    severity: {
        type: String,
        enum: ['Normal', 'Watch', 'Critical'],
        default: 'Normal',
    },
    issue: {
        type: String,
        required: true,
        trim: true,
    },
    action: {
        type: String,
        enum: ['Monitor', 'Vaccinate', 'Treat', 'Isolate'],
        default: 'Monitor',
    },
    notes: {
        type: String,
        default: '',
        trim: true,
    },
    status: {
        type: String,
        enum: ['Open', 'Scheduled', 'Monitoring', 'Resolved', 'Recovered'],
        default: 'Open',
    },
    vaccinationDue: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
module.exports = HealthRecord;
