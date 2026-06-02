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


module.exports = ProfileRoute;