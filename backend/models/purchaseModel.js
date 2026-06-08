const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    sku: String
});

const purchaseSchema = new mongoose.Schema({
    poNumber: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: true
    },
    purchaseItems: [purchaseItemSchema],
    draftCompletion: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    estimatedTotal: {
        type: Number,
        default: 0
    },
    actualTotal: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'received', 'cancelled'],
        default: 'draft'
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid'
    },
    paymentTerms: String,
    notes: String,
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

// Pre-save middleware to generate PO Number
purchaseSchema.pre('save', async function(next) {
    try {
        if (!this.poNumber) {
            const count = await mongoose.model('Purchase').countDocuments();
            const timestamp = Date.now().toString().slice(-6);
            this.poNumber = `PO-${timestamp}-${count + 1}`;
        }
        // Calculate estimated total
        if (this.purchaseItems && this.purchaseItems.length > 0) {
            this.estimatedTotal = this.purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0);
        }
    } catch (e) {
        /* ignore */
    }
    next();
});

const Purchase = mongoose.model('Purchase', purchaseSchema);
module.exports = Purchase;
