const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    expenseNumber: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['supplies', 'labor', 'utilities', 'maintenance', 'transportation', 'other']
    },
    description: {
        type: String,
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party'
    },
    vendorName: String,
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'KES'
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'paid'],
        default: 'draft'
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid'
    },
    invoiceNumber: String,
    invoiceDate: Date,
    dueDate: Date,
    paidDate: Date,
    attachments: [
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
    monthlySpend: {
        type: Number,
        default: 0
    },
    pendingApprovals: {
        type: Number,
        default: 0
    },
    pendingBills: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Pre-save middleware to generate Expense Number
expenseSchema.pre('save', async function(next) {
    try {
        if (!this.expenseNumber) {
            const count = await mongoose.model('Expense').countDocuments();
            const timestamp = Date.now().toString().slice(-6);
            this.expenseNumber = `EXP-${timestamp}-${count + 1}`;
        }
    } catch (e) {
        /* ignore */
    }
    next();
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
