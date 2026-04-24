const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth } = require("../util");
const Profile = require('../models/profileModel');



const ProfileRoute = express.Router();

ProfileRoute.get("/", isAuth, expressAsync(async(req, res)=>{
    const profile = await Profile.findOne({ user: req.userId })
}));
ProfileRoute.put("/", isAuth, expressAsync(async(req, res)=>{
    const data = {
        name: req.body.name,
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
        nationalID: req.body.nationalID,
        bio: req.body.bio,
    };
    const profile = await Profile.findOneAndUpdate(
        { user: req.user._Id},
        { 
            data,
            profileCompleted: true,
         },
         { new: true }

    );
    res.send(profile);

    
}));


module.exports = ProfileRoute;