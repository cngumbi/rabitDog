const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth, isAdmin } = require('../util');
const logActivity = require('../util/activityLogger');
const Party = require('../models/partyModel');

const PartyRoute = express.Router();

// Calculate profile readiness based on completed fields
const calculateProfileReadiness = (partyData) => {
    let completedFields = 0;
    const totalFields = 8; // Total number of tracked fields
    
    // Required identity fields
    if (partyData.name && partyData.name.trim()) completedFields++;
    if (partyData.type) completedFields++;
    if (partyData.phone && partyData.phone.trim()) completedFields++;
    if (partyData.email && partyData.email.trim()) completedFields++;
    
    // Business profile fields
    if (partyData.address && partyData.address.trim()) completedFields++;
    if (partyData.paymentTerms) completedFields++;
    
    // Optional but valuable fields
    if (partyData.notes && partyData.notes.trim()) completedFields++;
    if (partyData.contactPerson && partyData.contactPerson.trim()) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
};

// Get all parties
PartyRoute.get('/', isAuth, isAdmin, expressAsync(async(req, res) => {
    const parties = await Party.find({}).populate('createdBy', '_id email');
    res.send(parties);
}));

// Get parties by type (buyers, suppliers)
PartyRoute.get('/type/:type', isAuth, isAdmin, expressAsync(async(req, res) => {
    const { type } = req.params;
    const parties = await Party.find({ type: { $in: [type, 'both'] } }).populate('createdBy', '_id email');
    res.send(parties);
}));

// Get party summary stats
PartyRoute.get('/summary/stats', isAuth, isAdmin, expressAsync(async(req, res) => {
    const buyers = await Party.countDocuments({ type: { $in: ['buyer', 'both'] }, status: 'active' });
    const suppliers = await Party.countDocuments({ type: { $in: ['supplier', 'both'] }, status: 'active' });
    const newThisMonth = await Party.countDocuments({
        createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
    });
    const pendingReviews = await Party.countDocuments({ status: 'inactive' });
    
    const totalBalance = await Party.aggregate([
        {
            $group: {
                _id: null,
                totalBalance: { $sum: '$currentBalance' },
                averageProfileReadiness: { $avg: '$profileReadiness' }
            }
        }
    ]);

    res.send({
        buyers,
        suppliers,
        newThisMonth,
        pendingReviews,
        totalBalance: totalBalance.length > 0 ? totalBalance[0].totalBalance : 0,
        averageProfileReadiness: totalBalance.length > 0 ? Math.round(totalBalance[0].averageProfileReadiness * 10) / 10 : 0
    });
}));

// Get parties for export
PartyRoute.get('/export/ledger', isAuth, isAdmin, expressAsync(async(req, res) => {
    const parties = await Party.find({}).select('name email phone type status currentBalance').populate('createdBy', 'email');
    res.send(parties);
}));

// Get single party
PartyRoute.get('/:id', isAuth, expressAsync(async(req, res) => {
    const party = await Party.findById(req.params.id).populate('createdBy', '_id email');
    if (party) {
        res.send(party);
    } else {
        res.status(404).send({ message: 'Party Not Found' });
    }
}));

// Create party
PartyRoute.post('/', isAuth, isAdmin, expressAsync(async(req, res) => {
    const party = new Party({
        name: req.body.name,
        type: req.body.type,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        businessName: req.body.businessName,
        businessRegistration: req.body.businessRegistration,
        contactPerson: req.body.contactPerson,
        bankAccount: req.body.bankAccount,
        taxId: req.body.taxId,
        paymentTerms: req.body.paymentTerms,
        creditLimit: req.body.creditLimit || 0,
        currentBalance: req.body.currentBalance || 0,
        notes: req.body.notes,
        status: req.body.status || 'active',
        profileReadiness: calculateProfileReadiness(req.body),
        createdBy: req.user._id
    });

    const createdParty = await party.save();
    if (createdParty) {
        await logActivity(req.user._id, 'PARTY_CREATED', `Created party ${createdParty.name}`);
        res.status(201).send({
            message: 'Party Created Successfully',
            party: createdParty
        });
    } else {
        res.status(500).send({ message: 'Party Creation Failed' });
    }
}));

// Update party
PartyRoute.put('/:id', isAuth, isAdmin, expressAsync(async(req, res) => {
    const party = await Party.findById(req.params.id);
    if (party) {
        party.name = req.body.name || party.name;
        party.type = req.body.type || party.type;
        party.email = req.body.email || party.email;
        party.phone = req.body.phone || party.phone;
        party.address = req.body.address || party.address;
        party.businessName = req.body.businessName || party.businessName;
        party.businessRegistration = req.body.businessRegistration || party.businessRegistration;
        party.contactPerson = req.body.contactPerson || party.contactPerson;
        party.bankAccount = req.body.bankAccount || party.bankAccount;
        party.taxId = req.body.taxId || party.taxId;
        party.paymentTerms = req.body.paymentTerms || party.paymentTerms;
        party.creditLimit = req.body.creditLimit !== undefined ? req.body.creditLimit : party.creditLimit;
        party.currentBalance = req.body.currentBalance !== undefined ? req.body.currentBalance : party.currentBalance;
        party.status = req.body.status || party.status;
        party.notes = req.body.notes || party.notes;
        
        // Recalculate profileReadiness based on updated data
        party.profileReadiness = calculateProfileReadiness(party);

        const updatedParty = await party.save();
        await logActivity(req.user._id, 'PARTY_UPDATED', `Updated party ${updatedParty.name}`);
        res.send({
            message: 'Party Updated Successfully',
            party: updatedParty
        });
    } else {
        res.status(404).send({ message: 'Party Not Found' });
    }
}));

// Delete party
PartyRoute.delete('/:id', isAuth, isAdmin, expressAsync(async(req, res) => {
    const party = await Party.findById(req.params.id);
    if (party) {
        await Party.deleteOne({ _id: req.params.id });
        await logActivity(req.user._id, 'PARTY_DELETED', `Deleted party ${party.name}`);
        res.send({ message: 'Party Deleted' });
    } else {
        res.status(404).send({ message: 'Party Not Found' });
    }
}));

module.exports = PartyRoute;
