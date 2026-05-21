const express = require('express');
const expressAsync = require('express-async-handler');
const User = require('../models/userModel');
const { generateToken, isAuth } = require('../util');
const Profile = require('../models/profileModel');
const { ValidateData, ValidateCode } = require('../middleware/validateData');
const { PassHash, PassCompare, HmacProcess } = require('../util/passHash');
const UserRoute = express.Router();
const config = require('../config/config');
const transporter = require('../middleware/sendmail');
const { authLimiter } = require('../middleware/rateLimiter');
// User registration route
UserRoute.post('/signin', authLimiter, expressAsync(async(req, res)=>{
    try{
        //validate user input
        const { error } = await ValidateData().validateAsync(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }
        //find user by email
        const signinUser = await User.findOne({
            email: req.body.email,
        });
        //check if user exist and password match
        if(!signinUser || !PassCompare(req.body.password, signinUser.password)){
            return res.status(401).send({
                message: 'Invalid Email or Password',
            });
        }
        //const profile = await Profile.findOne({ user: signinUser._id});
        //set token in httpOnly cookie
        res.cookie('Authorization', 'Bearer ' + generateToken(signinUser), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000, // 2 hours  
        });
        //send user info and token to client
        res.send({
            _id: signinUser._id,
            email: signinUser.email,
            isAdmin: signinUser.isAdmin,
            verified: signinUser.verified,
            token: generateToken(signinUser),
            //profileCompleted: profile.profileCompleted,
        });
    }catch{
        return res.status(500).send({
            message: 'Authentication Failed'
        });
    }
}));
UserRoute.post('/register', authLimiter, expressAsync(async(req, res) => {
    try{
        // validate user input
        const { error } = await ValidateData().validateAsync(req.body);
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
            password: PassHash(req.body.password, 8),
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
                verified: createdUser.verified,
                token: generateToken(createdUser),  //generate token for the user
            });
        }
    }catch{
        return res.status(500).send({
            message: 'Registration Failed'
        });
    }
}));
UserRoute.put('/:id', isAuth, expressAsync(async(req, res) => {
    try{
        //validate user input
        const { error } = await ValidateData().validateAsync(req.body);
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
            user.password = req.body.password ? PassHash(req.body.password, 8) : user.password; //|| user.password;
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
UserRoute.post('/signout', expressAsync(async(req, res)=>{
    res.clearCookie('Authorization', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.send({ success: true, message: 'Sign out successful' });
}));
UserRoute.patch('/sendVerificationCode', authLimiter, expressAsync(async(req, res)=>{
    try{
        //check if email exist
        const existingUser = await User.findOne({
            email: req.body.email,
        });
        if(!existingUser){
                return res.status(404).send({ message: 'User does not exist' });
        }
        if(existingUser.verified) {
            return res.status(400).send({ message: 'User already verified' });
        }
        //generate a random 6-digit code
        const verificationCodeValue = Math.floor(100000 + Math.random() * 900000).toString();
        //send the code to user's email (for demonstration, we will just return the code in response)
        let info = await transporter.sendMail({
            from: config.NODE_CODE_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Email Verification Code',
            text: `Your verification code is: ${verificationCodeValue}`,
            html: `<p>Your verification code is: <strong>${verificationCodeValue}</strong></p>`       
        });
        if(info.accepted[0] === existingUser.email){
            const hashedVerificationCodeValue = HmacProcess(verificationCodeValue, config.MAC_VERIFICATION_CODE_SECRET);
            existingUser.verificationToken = hashedVerificationCodeValue;
            existingUser.verificationTokenValidation = Date.now() + 10 * 60 * 1000; // token valid for 10 minutes
            await existingUser.save();
            return res.status(200).send({ message: 'Verification code sent to email' });
        }
        return res.status(400).send({ message: 'Failed to send verification code' });
    }catch(error){
        console.log(error);
        return res.status(500).send({
            message: 'Failed to send verification code'
        });
    }
}));
UserRoute.patch('/verifyEmail', authLimiter, expressAsync(async(req, res)=>{
    try{
        const { email, verificationCodeProvided } = req.body;
        // validate user input
        const { error, value } = ValidateCode().validate({ email, verificationCodeProvided });
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }
        //const codeValue = req.body.verificationCodeprovided;
        const codeValue = verificationCodeProvided.toString();
        //check if email exist
        const existingUser = await User.findOne({
            email: req.body.email,
        }).select('+verificationToken +verificationTokenValidation');
        if(!existingUser){
            return res.status(404).send({ message: 'User does not exist' });
        }
        if(existingUser.verified) {
            return res.status(400).send({ message: 'User already verified' });
        }
        //check if verification token exist and valid
        if(!existingUser.verificationToken || !existingUser.verificationTokenValidation){
            return res.status(400).send({ message: 'No verification code found, please request a new one' });
        }
        if(Date.now() > existingUser.verificationTokenValidation){
            return res.status(400).send({ message: 'Verification code expired, please request a new one' });
        }

        const hashedCodeValue = HmacProcess(codeValue, config.MAC_VERIFICATION_CODE_SECRET);
        if(hashedCodeValue === existingUser.verificationToken){
            existingUser.verified = true;
            existingUser.verificationToken = undefined;
            existingUser.verificationTokenValidation = undefined;
            await existingUser.save();
            return res.status(200).send({ message: 'Email verified successfully' });
        }
        return res.status(400).send({ message: 'Invalid verification code!!' });
    }catch(error){
        console.log(error);
        return res.status(500).send({ message: 'Email verification failed' });
    }
}));
//TODO: add forgot password route
module.exports = UserRoute;