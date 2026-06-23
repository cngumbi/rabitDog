const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['buyer', 'supplier', 'both', 'wholesale'],
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ''
    },
    businessName: String,
    businessRegistration: String,
    contactPerson: String,
    bankAccount: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        swiftCode: String
    },
    taxId: String,
    paymentTerms: String,
    wholesales: {
        type: Boolean,
        default: false
    },
    creditLimit: {
        type: Number,
        default: 0
    },
    currentBalance: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    profileReadiness: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    documents: [
        {
            type: String,
            name: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Party = mongoose.model('Party', partySchema);
module.exports = Party;
