const express = require('express');
const expressAsync = require('express-async-handler');
const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const { isAuth } = require("../util");



const ProfileRoute = express.Router();

//get user profile
ProfileRoute.get("/", isAuth, expressAsync(async(req, res)=>{
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
        profile = await Profile.create({ user: req.user._id });
    }
    const user = await User.findById(req.user._id);
    res.send({
        profile,
        account: {
            email: user.email,
            verified: user.verified,
            lastLogin: user.lastLogin,
            memberSince: user.createdAt,
            activityLog: user.activityLog || [],
        }
    });
}));
//update profile
ProfileRoute.put("/", isAuth, expressAsync(async(req, res)=>{

    const data = {
        name: req.body.name,
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
        nationalID: req.body.nationalID,
        bio: req.body.bio,
    };

    const profile = await Profile.findOneAndUpdate(
        {
            user: req.user._id
        },
        {
            ...data,
            profileCompleted: true,
        },
        {
            new: true,
            upsert: true,
        }
    );

    const user = await User.findById(req.user._id);

    user.activityLog.unshift({
        action: 'PROFILE_COMPLETED',
        description: 'Updated profile information',
        createdAt: new Date(),
    });
    await user.save();
    res.send(profile);

}));
ProfileRoute.get('/activity-log', isAuth, expressAsync( async (req, res)=>{
    // ----------------------------------------
    // Read page and limit from query string
    // Example:
    // /api/profile/activity-log?page=1&limit=15
    // ----------------------------------------
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;

    const user = await User.findById(req.user._id);
    if(!user){
        return res.status(404).send({ message: "User not found "});
    }
    // ----------------------------------------
    // Sort newest first
    // ----------------------------------------
    const activityLog = Array.isArray(user.activityLog) ? user.activityLog : [];
    const sortedActivities = activityLog.sort((a, b)=> new Date(b.createdAt) - new Date(a.createdAt));
    // ----------------------------------------
    // Pagination calculations
    // ----------------------------------------
    const totalItems = sortedActivities.length;
    const totalPages = Math.ceil(totalItems / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedActivities = sortedActivities.slice(startIndex, endIndex);
    // ----------------------------------------
    // Send paginated result
    // ----------------------------------------
    res.send({
        currentPage: page, 
        limit, 
        totalItems, 
        totalPages, 
        activities: paginatedActivities
    });
}));


module.exports = ProfileRoute;