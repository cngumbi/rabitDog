const express = require('express');
const expressAsync = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { generateToken, isAuth } = require('../util');
const { validateRegister, validateUpdate } = require('../middleware/validateUser');
const Profile = require('../models/profileModel');
const UserRoute = express.Router();

/*UserRoute.get('/createadmin', expressAsync(async(req, res) => {
    try {
        const user = new User({
            name: 'SuperAdmin',
            userName: 'admin',
            phoneNumber: '+254712719781',
            email: 'Mwandyaadmin@kyalo.store',
            password: 'adminMwandya@12',
            isAdmin: true
        });
        const createdUser = await user.save();
        res.send(createdUser);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}));*/
UserRoute.post('/signin', expressAsync(async(req, res)=>{
    try{
        const signinUser = await User.findOne({
            email: req.body.email,
            //password: req.body.password
        });
        if(!signinUser || !bcrypt.compareSync(req.body.password, signinUser.password)){
            return res.status(401).send({
                message: 'Invalid Email or Password',
            });
        }
        else{
            //const profile = await Profile.findOne({ user: signinUser._id});
            res.send({
                _id: signinUser._id,
                //name: signinUser.name,
                //userName: signinUser.userName,
                //phoneNumber: signinUser.phoneNumber,
                email: signinUser.email,
                isAdmin: signinUser.isAdmin,
                token: generateToken(signinUser),
                //profileCompleted: profile.profileCompleted,
            });
        }
    }catch{
        return res.status(500).send({
            message: 'Authentication Failed'
        });
    }
}));
UserRoute.post('/register', validateRegister, expressAsync(async(req, res) => {
    try{    
        //check if email exist
        const existingUser = await User.findOne({
            email: req.body.email,
        });
        if(existingUser){
            return res.status(400).send({ message: 'Email already exists' });
        }
        const user = new User({
            //name: req.body.name,
            //userName: req.body.userName,
            //phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
        });
        const createdUser = await user.save();
        //create empty profile here
        //await Profile.create({
        //    user: user._id
        //});
        if (!createdUser) {
            return res.status(401).send({
                message: 'Invalid User Data',
            });
        }else {
            res.send({
                _id: createdUser._id,
                //name: createdUser.name,
                //userName: createdUser.userName,
                //phoneNumber: createdUser.phoneNumber,
                email: createdUser.email,
                isAdmin: createdUser.isAdmin,
                token: generateToken(createdUser),
            });
        }
    }catch{
        return res.status(500).send({
            message: 'Registration Failed'
        });
    }
}));
UserRoute.put('/:id', isAuth, validateUpdate, expressAsync(async(req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(401).send({
                message: 'User not found',
            });
        } else {
            //user.name = req.body.name || user.name;
            //user.userName = req.body.userName || user.userName;
            //user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.email = req.body.email || user.email;
            user.password = req.body.password ? bcrypt.hashSync(req.body.password, 8) : user.password; //|| user.password;
            const updateUser = await user.save();
            res.send({
                _id: updateUser._id,
                //name: updateUser.name,
                //userName: updateUser.userName,
                //phoneNumber: updateUser.phoneNumber,
                email: updateUser.email,
                isAdmin: updateUser.isAdmin,
                token: generateToken(updateUser),
            });
        }
    }catch{
        return res.status(500).send({
            message: 'User Profile Update failed'
        });
    }
}));

module.exports = UserRoute;