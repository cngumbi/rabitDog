const express = require('express');
const expressAsync = require('express-async-handler');
const User = require('../models/userModel');

const UserRoute = express.Router();

UserRoute.get('/createadmin', expressAsync(async(req, res) => {
    try {
        const user = new User({
            name: 'admin',
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
            email: signinUser.email,
            isAdmin: signinUser.isAdmin,
            //token: generateToken(signinUser)
        });
    }
}));
UserRoute.post('/register', expressAsync(async(req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });
    const createdUser = await user.save();
    if (!createdUser) {
        res.status(401).send({
            message: 'Invalid User Data',
        });
    } else {
        res.send({
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            isAdmin: createdUser.isAdmin,
            //token: generateToken(createdUser),
        });
    }
}));

module.exports = UserRoute;