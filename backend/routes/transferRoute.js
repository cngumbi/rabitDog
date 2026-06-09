const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth, isAdmin } = require('../util');
const logActivity = require('../util/activityLogger');
const Transfer = require('../models/transferModel');

const TransferRoute = express.Router();

// Get all transfers
TransferRoute.get('/', isAuth, isAdmin, expressAsync(async(req, res) => {
    const transfers = await Transfer.find({})
        .populate('createdBy', '_id email')
        .populate('confirmedBy', '_id email');
    res.send(transfers);
}));

// Get transfer summary stats
TransferRoute.get('/summary/stats', isAuth, isAdmin, expressAsync(async(req, res) => {
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const activeMoves = await Transfer.countDocuments({ status: { $in: ['pending', 'in-transit'] } });
    const awaitingPickup = await Transfer.countDocuments({ status: 'pending' });
    
    const unitsMoved = await Transfer.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: '$unitsMoved' }
            }
        }
    ]);

    const completed = await Transfer.countDocuments({ status: 'received' });
    const completedThisMonth = await Transfer.countDocuments({
        status: 'received',
        actualReceiptDate: { $gte: currentMonth }
    });

    const averageLeadTime = await Transfer.aggregate([
        {
            $match: { status: 'received', actualReceiptDate: { $exists: true }, shipmentDate: { $exists: true } }
        },
        {
            $project: {
                leadTime: {
                    $divide: [
                        { $subtract: ['$actualReceiptDate', '$shipmentDate'] },
                        1000 * 60 * 60 * 24
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                avgLeadTime: { $avg: '$leadTime' }
            }
        }
    ]);

    const readyToDispatch = await Transfer.countDocuments({ status: 'pending', readyToDispatch: true });

    res.send({
        activeMoves,
        awaitingPickup,
        unitsMoved: unitsMoved.length > 0 ? unitsMoved[0].total : 0,
        completed,
        completedThisMonth,
        averageLeadTime: averageLeadTime.length > 0 ? Math.round(averageLeadTime[0].avgLeadTime * 10) / 10 : 0,
        readyToDispatch
    });
}));

// Get single transfer
TransferRoute.get('/:id', isAuth, expressAsync(async(req, res) => {
    const transfer = await Transfer.findById(req.params.id)
        .populate('createdBy', '_id email')
        .populate('confirmedBy', '_id email');
    if (transfer) {
        res.send(transfer);
    } else {
        res.status(404).send({ message: 'Transfer Not Found' });
    }
}));

// Create transfer
TransferRoute.post('/', isAuth, isAdmin, expressAsync(async(req, res) => {
    const transfer = new Transfer({
        fromLocation: req.body.fromLocation,
        toLocation: req.body.toLocation,
        items: req.body.items || [],
        status: req.body.status || 'pending',
        shipmentDate: req.body.shipmentDate,
        expectedReceiptDate: req.body.expectedReceiptDate,
        notes: req.body.notes,
        createdBy: req.user._id
    });

    const createdTransfer = await transfer.save();
    if (createdTransfer) {
        await logActivity(req.user._id, 'TRANSFER_CREATED', `Created transfer ${createdTransfer.transferNumber}`);
        res.status(201).send({
            message: 'Transfer Created Successfully',
            transfer: createdTransfer
        });
    } else {
        res.status(500).send({ message: 'Transfer Creation Failed' });
    }
}));

// Update transfer
TransferRoute.put('/:id', isAuth, isAdmin, expressAsync(async(req, res) => {
    const transfer = await Transfer.findById(req.params.id);
    if (transfer) {
        transfer.fromLocation = req.body.fromLocation || transfer.fromLocation;
        transfer.toLocation = req.body.toLocation || transfer.toLocation;
        transfer.items = req.body.items || transfer.items;
        transfer.status = req.body.status || transfer.status;
        transfer.readyToDispatch = req.body.readyToDispatch !== undefined ? req.body.readyToDispatch : transfer.readyToDispatch;
        transfer.shipmentDate = req.body.shipmentDate || transfer.shipmentDate;
        transfer.expectedReceiptDate = req.body.expectedReceiptDate || transfer.expectedReceiptDate;
        transfer.actualReceiptDate = req.body.actualReceiptDate || transfer.actualReceiptDate;
        transfer.notes = req.body.notes || transfer.notes;

        const updatedTransfer = await transfer.save();
        await logActivity(req.user._id, 'TRANSFER_UPDATED', `Updated transfer ${updatedTransfer.transferNumber}`);
        res.send({
            message: 'Transfer Updated Successfully',
            transfer: updatedTransfer
        });
    } else {
        res.status(404).send({ message: 'Transfer Not Found' });
    }
}));

// Mark transfer as in-transit
TransferRoute.post('/:id/dispatch', isAuth, isAdmin, expressAsync(async(req, res) => {
    const transfer = await Transfer.findById(req.params.id);
    if (transfer) {
        transfer.status = 'in-transit';
        transfer.shipmentDate = new Date();
        const updatedTransfer = await transfer.save();
        await logActivity(req.user._id, 'TRANSFER_DISPATCHED', `Dispatched transfer ${updatedTransfer.transferNumber}`);
        res.send({
            message: 'Transfer Dispatched',
            transfer: updatedTransfer
        });
    } else {
        res.status(404).send({ message: 'Transfer Not Found' });
    }
}));

// Mark transfer as received
TransferRoute.post('/:id/receive', isAuth, isAdmin, expressAsync(async(req, res) => {
    const transfer = await Transfer.findById(req.params.id);
    if (transfer) {
        transfer.status = 'received';
        transfer.actualReceiptDate = new Date();
        transfer.items = req.body.items || transfer.items; // Update received quantities
        const updatedTransfer = await transfer.save();
        await logActivity(req.user._id, 'TRANSFER_RECEIVED', `Transfer ${updatedTransfer.transferNumber} marked as received`);
        res.send({
            message: 'Transfer Marked as Received',
            transfer: updatedTransfer
        });
    } else {
        res.status(404).send({ message: 'Transfer Not Found' });
    }
}));

// Export log
TransferRoute.get('/export/log', isAuth, isAdmin, expressAsync(async(req, res) => {
    const transfers = await Transfer.find({})
        .select('transferNumber fromLocation toLocation unitsMoved status createdAt')
        .populate('createdBy', 'email');
    res.send(transfers);
}));

module.exports = TransferRoute;
