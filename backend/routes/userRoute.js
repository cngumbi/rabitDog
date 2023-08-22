const express = require('express');
const expressAsync = require('express-async-handler');
const User = require('../models/userModel');
const { generateToken, isAuth } = require('../util');

const UserRoute = express.Router();

UserRoute.get('/createadmin', expressAsync(async(req, res) => {
    try {
        const user = new User({
            name: 'SuperAdmin',
            userName: 'admin',
            phoneNumber: '+254712719781',
            email: 'quickoneadmin@quickoneservice.com',
            password: 'adminQuickOne',
            isAdmin: true
        });
        const createdUser = await user.save();
        res.send(createdUser);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}));
UserRoute.post('/login', expressAsync(async(req, res)=>{
    const signinUser = await User.findOne({
        email: req.body.email,
        password: req.body.password
    });
    if(!signinUser){
        res.status(401).send({
            message: 'Invalid Email or Password',
        });
    }else{
        res.send({
            _id: signinUser._id,
            name: signinUser.name,
            userName: signinUser.userName,
            phoneNumber: signinUser.phoneNumber,
            email: signinUser.email,
            isAdmin: signinUser.isAdmin,
            token: generateToken(signinUser)
        });
    }
}));
UserRoute.post('/register', expressAsync(async(req, res) => {
    const user = new User({
        name: req.body.name,
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        password: req.body.password,
    });
    const createdUser = await user.save();
    if (!createdUser) {
        res.status(401).send({
            message: 'Invalid User Data',
        });
    } else {
        user.name = req.body.name || user.name;
        user.userName = req.body.userName || user.userName;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumbe;
        user.email = req.body.email || user.email;
        user.password = req.body.password || user.password;

        const updateUser = await user.save();

        res.send({
            _id: updateUser._id,
            name: updateUser.name,
            userName: updateUser.userName,
            phoneNumber: updateUser.phoneNumber,
            email: updateUser.email,
            isAdmin: updateUser.isAdmin,
            token: generateToken(updateUser),
        });
    }
}));
UserRoute.put('/:id', isAuth, expressAsync(async(req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(401).send({
            message: 'User not found',
        });
    } else {
        res.send({
            _id: createdUser._id,
            name: createdUser.name,
            userName: createdUser.userName,
            phoneNumber: createdUser.phoneNumber,
            email: createdUser.email,
            isAdmin: createdUser.isAdmin,
            token: generateToken(createdUser),
        });
    }
}));


module.exports = UserRoute;