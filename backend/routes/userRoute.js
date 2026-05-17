const express = require('express');
const expressAsync = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { generateToken, isAuth } = require('../util');
const { validateRegister, validateUpdate } = require('../middleware/validateUser');
const Profile = require('../models/profileModel');
const { ValidateData } = require('../middleware/validateData');
const UserRoute = express.Router();

UserRoute.post('/signin', expressAsync(async(req, res)=>{
    try{
        //validate user input
        const { error, value } = ValidateData.validate(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }
        //find user by email
        const signinUser = await User.findOne({
            email: req.body.email,
        });
        //check if user exist and password match
        if(!signinUser || !bcrypt.compareSync(req.body.password, signinUser.password)){
            return res.status(401).send({
                message: 'Invalid Email or Password',
            });
        }
        //const profile = await Profile.findOne({ user: signinUser._id});
        //send user info and token to client
        res.send({
            _id: signinUser._id,
            email: signinUser.email,
            isAdmin: signinUser.isAdmin,
            token: generateToken(signinUser),
            //profileCompleted: profile.profileCompleted,
        });
    }catch{
        return res.status(500).send({
            message: 'Authentication Failed'
        });
    }
}));
UserRoute.post('/register', validateRegister, expressAsync(async(req, res) => {
    try{    
        //validate user input
        const { error } = ValidateData.validate(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }
        //check if email exist
        const existingUser = await User.findOne({
            email: req.body.email,
        });
        if(existingUser){
            return res.status(400).send({ message: 'Email already exists' });
        }
        //create new user
        const user = new User({
            email: req.body.email,
            //Hash the password before saving to database
            password: bcrypt.hashSync(req.body.password, 8),
        });
        //save user to database
        const createdUser = await user.save();
        //create empty profile here
        //await Profile.create({
        //    user: user._id
        //});
        //check if user created successfully
        if (!createdUser) {
            return res.status(401).send({
                message: 'Invalid User Data',
            });
        }else {
            //send user info and token to client
            res.send({
                _id: createdUser._id,
                email: createdUser.email,
                isAdmin: createdUser.isAdmin,
                token: generateToken(createdUser),  //generate token for the user
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
        //validate user input
        const { error } = ValidateData.validate(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }
        //find user by id
        const user = await User.findById(req.params.id);
        //check if user exist
        if (!user) {
            res.status(401).send({
                message: 'User not found',
            });
        } else {
            //update user info
            user.email = req.body.email || user.email;
            user.password = req.body.password ? bcrypt.hashSync(req.body.password, 8) : user.password; //|| user.password;
            //save updated user to database
            const updateUser = await user.save();
            //check if user updated successfully
            if (!updateUser) {
                return res.status(401).send({
                    message: 'Invalid User Data',
                });
            }
            res.send({
                _id: updateUser._id,
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