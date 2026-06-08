const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth, isAdmin } = require('../util');
const logActivity = require('../util/activityLogger');
const Purchase = require('../models/purchaseModel');
const Party = require('../models/partyModel');

const PurchaseRoute = express.Router();

// Get all purchases
PurchaseRoute.get('/', isAuth, isAdmin, expressAsync(async(req, res) => {
    const purchases = await Purchase.find({})
        .populate('supplier', 'name email')
        .populate('createdBy', '_id email')
        .populate('approvedBy', '_id email');
    res.send(purchases);
}));

// Get purchase summary stats
PurchaseRoute.get('/summary/stats', isAuth, isAdmin, expressAsync(async(req, res) => {
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const openPOs = await Purchase.countDocuments({ status: { $in: ['pending', 'approved'] } });
    const dueThisWeek = await Purchase.countDocuments({
        expectedDeliveryDate: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });
    const approved = await Purchase.countDocuments({ status: 'approved' });
    const pendingApprovals = await Purchase.countDocuments({ approvalStatus: 'pending' });

    const spendThisMonth = await Purchase.aggregate([
        {
            $match: {
                createdAt: { $gte: currentMonth },
                status: { $in: ['approved', 'received'] }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$estimatedTotal' }
            }
        }
    ]);

    const recentSpend = spendThisMonth.length > 0 ? spendThisMonth[0].total : 0;

    res.send({
        openPOs,
        dueThisWeek,
        approved,
        pendingApprovals,
        spendThisMonth: recentSpend,
        recentSpend
    });
}));

// Get single purchase
PurchaseRoute.get('/:id', isAuth, expressAsync(async(req, res) => {
    const purchase = await Purchase.findById(req.params.id)
        .populate('supplier', 'name email')
        .populate('createdBy', '_id email')
        .populate('approvedBy', '_id email');
    if (purchase) {
        res.send(purchase);
    } else {
        res.status(404).send({ message: 'Purchase Not Found' });
    }
}));

// Create purchase (draft)
PurchaseRoute.post('/', isAuth, isAdmin, expressAsync(async(req, res) => {
    const purchase = new Purchase({
        supplier: req.body.supplier,
        purchaseItems: req.body.purchaseItems || [],
        estimatedTotal: req.body.estimatedTotal || 0,
        status: 'draft',
        approvalStatus: 'pending',
        expectedDeliveryDate: req.body.expectedDeliveryDate,
        paymentTerms: req.body.paymentTerms,
        notes: req.body.notes,
        createdBy: req.user._id
    });

    const createdPurchase = await purchase.save();
    if (createdPurchase) {
        await logActivity(req.user._id, 'PURCHASE_CREATED', `Created purchase ${createdPurchase.poNumber}`);
        res.status(201).send({
            message: 'Purchase Created Successfully',
            purchase: createdPurchase
        });
    } else {
        res.status(500).send({ message: 'Purchase Creation Failed' });
    }
}));

// Update purchase
PurchaseRoute.put('/:id', isAuth, isAdmin, expressAsync(async(req, res) => {
    const purchase = await Purchase.findById(req.params.id);
    if (purchase) {
        purchase.supplier = req.body.supplier || purchase.supplier;
        purchase.purchaseItems = req.body.purchaseItems || purchase.purchaseItems;
        purchase.draftCompletion = req.body.draftCompletion !== undefined ? req.body.draftCompletion : purchase.draftCompletion;
        purchase.estimatedTotal = req.body.estimatedTotal !== undefined ? req.body.estimatedTotal : purchase.estimatedTotal;
        purchase.actualTotal = req.body.actualTotal !== undefined ? req.body.actualTotal : purchase.actualTotal;
        purchase.status = req.body.status || purchase.status;
        purchase.expectedDeliveryDate = req.body.expectedDeliveryDate || purchase.expectedDeliveryDate;
        purchase.actualDeliveryDate = req.body.actualDeliveryDate || purchase.actualDeliveryDate;
        purchase.paymentStatus = req.body.paymentStatus || purchase.paymentStatus;
        purchase.paymentTerms = req.body.paymentTerms || purchase.paymentTerms;
        purchase.notes = req.body.notes || purchase.notes;

        const updatedPurchase = await purchase.save();
        await logActivity(req.user._id, 'PURCHASE_UPDATED', `Updated purchase ${updatedPurchase.poNumber}`);
        res.send({
            message: 'Purchase Updated Successfully',
            purchase: updatedPurchase
        });
    } else {
        res.status(404).send({ message: 'Purchase Not Found' });
    }
}));

// Approve purchase
PurchaseRoute.post('/:id/approve', isAuth, isAdmin, expressAsync(async(req, res) => {
    const purchase = await Purchase.findById(req.params.id);
    if (purchase) {
        purchase.status = 'approved';
        purchase.approvalStatus = 'approved';
        purchase.approvedBy = req.user._id;
        const updatedPurchase = await purchase.save();
        await logActivity(req.user._id, 'PURCHASE_APPROVED', `Approved purchase ${updatedPurchase.poNumber}`);
        res.send({
            message: 'Purchase Approved',
            purchase: updatedPurchase
        });
    } else {
        res.status(404).send({ message: 'Purchase Not Found' });
    }
}));

// Reject purchase
PurchaseRoute.post('/:id/reject', isAuth, isAdmin, expressAsync(async(req, res) => {
    const purchase = await Purchase.findById(req.params.id);
    if (purchase) {
        purchase.status = 'rejected';
        purchase.approvalStatus = 'rejected';
        const updatedPurchase = await purchase.save();
        await logActivity(req.user._id, 'PURCHASE_REJECTED', `Rejected purchase ${updatedPurchase.poNumber}`);
        res.send({
            message: 'Purchase Rejected',
            purchase: updatedPurchase
        });
    } else {
        res.status(404).send({ message: 'Purchase Not Found' });
    }
}));

// Mark purchase as received
PurchaseRoute.post('/:id/receive', isAuth, isAdmin, expressAsync(async(req, res) => {
    const purchase = await Purchase.findById(req.params.id);
    if (purchase) {
        purchase.status = 'received';
        purchase.actualDeliveryDate = new Date();
        const updatedPurchase = await purchase.save();
        await logActivity(req.user._id, 'PURCHASE_RECEIVED', `Marked purchase ${updatedPurchase.poNumber} as received`);
        res.send({
            message: 'Purchase Marked as Received',
            purchase: updatedPurchase
        });
    } else {
        res.status(404).send({ message: 'Purchase Not Found' });
    }
}));

// Export ledger
PurchaseRoute.get('/export/ledger', isAuth, isAdmin, expressAsync(async(req, res) => {
    const purchases = await Purchase.find({})
        .select('poNumber supplier estimatedTotal actualTotal status paymentStatus createdAt')
        .populate('supplier', 'name');
    res.send(purchases);
}));

module.exports = PurchaseRoute;
