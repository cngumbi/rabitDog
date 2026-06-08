const mongoose = require('mongoose');

const transferItemSchema = new mongoose.Schema({
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
    sku: String,
    receivedQuantity: {
        type: Number,
        default: 0
    }
});

const transferSchema = new mongoose.Schema({
    transferNumber: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    fromLocation: {
        type: String,
        required: true
    },
    toLocation: {
        type: String,
        required: true
    },
    items: [transferItemSchema],
    status: {
        type: String,
        enum: ['pending', 'in-transit', 'received', 'cancelled'],
        default: 'pending'
    },
    activeMoves: {
        type: Number,
        default: 0
    },
    unitsMoved: {
        type: Number,
        default: 0
    },
    unitsReceived: {
        type: Number,
        default: 0
    },
    averageLeadTime: {
        type: Number,
        default: 0
    },
    readyToDispatch: {
        type: Boolean,
        default: false
    },
    shipmentDate: Date,
    expectedReceiptDate: Date,
    actualReceiptDate: Date,
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Pre-save middleware to generate Transfer Number
transferSchema.pre('save', async function(next) {
    try {
        if (!this.transferNumber) {
            const count = await mongoose.model('Transfer').countDocuments();
            const timestamp = Date.now().toString().slice(-6);
            this.transferNumber = `TR-${timestamp}-${count + 1}`;
        }
        // Calculate units moved
        if (this.items && this.items.length > 0) {
            this.unitsMoved = this.items.reduce((sum, item) => sum + item.quantity, 0);
            this.unitsReceived = this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
        }
    } catch (e) {
        /* ignore */
    }
    next();
});

const Transfer = mongoose.model('Transfer', transferSchema);
module.exports = Transfer;
