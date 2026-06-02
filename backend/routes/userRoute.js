const express = require('express');
const expressAsync = require('express-async-handler');
const jsonWT = require('jsonwebtoken');
const User = require('../models/userModel');
const { generateToken, generateRefreshToken, isAuth } = require('../util');
const Profile = require('../models/profileModel');
const { ValidateData, ValidateCode, ValidateForgottenPassword, ValidateUpdateProfile } = require('../middleware/validateData');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 60 * 60 * 1000; // 1 hour
const { PassHash, PassCompare, HmacProcess } = require('../util/passHash');
const UserRoute = express.Router();
const config = require('../config/config');
const transporter = require('../middleware/sendmail');
const { authLimiter } = require('../middleware/rateLimiter');
const SessionAuth = require('../middleware/sessionsAuth');
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
        if (signinUser) {
            // clear expired lock if needed
            if (signinUser.lockUntil && signinUser.lockUntil <= Date.now()) {
                signinUser.loginAttempts = 0;
                signinUser.lockUntil = undefined;
            }

            // locked account handling
            if (signinUser.lockUntil && signinUser.lockUntil > Date.now()) {
                const waitMinutes = Math.ceil((signinUser.lockUntil - Date.now()) / 60000);
                return res.status(423).send({
                    message: `Account locked due to too many failed login attempts. Try again in ${waitMinutes} minute${waitMinutes === 1 ? '' : 's'}.`,
                });
            }
        }

        //check if user exist and password match
        if(!signinUser || !PassCompare(req.body.password, signinUser.password)){
            if(signinUser){
                signinUser.loginAttempts = (signinUser.loginAttempts || 0) + 1;
                if(signinUser.loginAttempts >= MAX_LOGIN_ATTEMPTS){
                    signinUser.lockUntil = Date.now() + LOCK_TIME;
                }             
                await signinUser.save();
            }
            const errorResponse = signinUser && signinUser.lockUntil && signinUser.lockUntil > Date.now()
                ? {
                    status: 423,
                    message: `Account locked due to too many failed login attempts. Try again in ${Math.ceil((signinUser.lockUntil - Date.now()) / 60000)} minute${Math.ceil((signinUser.lockUntil - Date.now()) / 60000) === 1 ? '' : 's'}.`,
                    lockedUntil: signinUser.lockUntil,
                }
                : { status: 401, message: 'Invalid Email or Password' };
            return res.status(errorResponse.status).send({ message: errorResponse.message, lockedUntil: errorResponse.lockedUntil });
        }

        if(!signinUser.verified){
            return res.status(403).send({
                message: 'Please verify your email before signing in.',
            });
        }

        if(signinUser.loginAttempts || signinUser.lockUntil){
            signinUser.loginAttempts = 0;
            signinUser.lockUntil = undefined;
        }

        const token = generateToken(signinUser);
        const refreshToken = generateRefreshToken(signinUser);
        //update last login
        signinUser.lastLogin = Date.now();
        //Add Login activity
        signinUser.activityLog.unshift({
            action: 'LOGIN',
            description: `User signed in from ${req.ip}`,
            createdAt: new Date()
        });
        //keep only latest 50 activities
        signinUser.activityLog = signinUser.activityLog.slice(0, 50);

        signinUser.refreshToken = HmacProcess(refreshToken, config.MAC_VERIFICATION_CODE_SECRET);
        await signinUser.save();
        //const profile = await Profile.findOne({ user: signinUser._id});
        //set tokens in httpOnly cookies
        res.cookie('Authorization', 'Bearer ' + token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        req.session.user = {
            _id: signinUser._id,
            email: signinUser.email,
            isAdmin: signinUser.isAdmin,
        }
        //send user info and token to client
        res.send({
            _id: signinUser._id,
            email: signinUser.email,
            isAdmin: signinUser.isAdmin,
            verified: signinUser.verified,
            token,
            //profileCompleted: profile.profileCompleted,
        });
    }catch{
        return res.status(500).send({
            message: 'Authentication Failed'
        });
    }
    console.log('SESSION AFTER LOGIN:', req.session);
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
        await Profile.create({
            user: user._id
        });
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
UserRoute.put('/:id', isAuth, SessionAuth, expressAsync(async(req, res) => {
    try{
        //validate user input
        const { error } = await ValidateUpdateProfile().validateAsync(req.body);
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
            //update password if provided
            if(req.body.password){
                const isMatch = await PassCompare(req.body.currentPassword, user.password);
                if(!isMatch){
                    return res.status(401).send({
                        message: 'Current password is incorrect'
                    });
                }
                user.password = PassHash(req.body.password, 8);
                user.activityLog.unshift({
                    action: 'PASSWORD_CHANGE',
                    description: 'Password updated successfully',
                    createdAt: new Date()
                });
            }
            //Add profile update activity
            user.activityLog.unshift({
                action: 'PROFILE_UPDATE',
                description: 'Updated profile information',
                createdAt: new Date()
            });
            //keep only latest 50 activities
            user.activityLog = user.activityLog.slice(0, 50);
            //user.password = req.body.password ? PassHash(req.body.password, 8) : user.password; //|| user.password;
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
                verified: updateUser.verified,
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
    if (req.session && req.session.user) {
        const user = await User.findById(req.session.user._id).select('+refreshToken');
        if (user) {
            user.refreshToken = undefined;
            await user.save();
        }
    }
    req.session.destroy((error)=>{
        if(error){
            return res.status(500).send({
                message: 'Failed to sign out'
            });
        }
        res.clearCookie('sessionId', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.clearCookie('Authorization', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.send({ 
            success: true, message: 'Sign out successful' 
        });
    }); 
}));

UserRoute.post('/refresh-token', authLimiter, expressAsync(async(req, res)=>{
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).send({ message: 'Refresh token not available' });
    }

    let payload;
    try{
        payload = jsonWT.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
    }catch(error){
        return res.status(401).send({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload._id).select('+refreshToken');
    if(!user || !user.refreshToken){
        return res.status(401).send({ message: 'Invalid refresh token' });
    }

    if(user.refreshToken !== HmacProcess(refreshToken, config.MAC_VERIFICATION_CODE_SECRET)){
        return res.status(401).send({ message: 'Invalid refresh token' });
    }

    const token = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = HmacProcess(newRefreshToken, config.MAC_VERIFICATION_CODE_SECRET);
    await user.save();

    res.cookie('Authorization', 'Bearer ' + token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 4 * 60 * 60 * 1000, // 4 hours
    });

    res.send({
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        verified: user.verified,
        token,
    });
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
UserRoute.patch('/sendForgetPasswordCode', authLimiter, expressAsync(async(req, res)=>{
    try{
        //check if email exist
        const existingUser = await User.findOne({
            email: req.body.email,
        });
        if(!existingUser){
                return res.status(404).send({ message: 'User does not exist' });
        }
        //generate a random 6-digit code
        const verificationCodeValue = Math.floor(100000 + Math.random() * 900000).toString();
        //send the code to user's email (for demonstration, we will just return the code in response)
        let info = await transporter.sendMail({
            from: config.NODE_CODE_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Forget Password Verification Code',
            text: `Your Reset code is: ${verificationCodeValue}`,
            html: `<p>Your Reset code is: <strong>${verificationCodeValue}</strong></p>`       
        });
        if(info.accepted[0] === existingUser.email){
            const hashedVerificationCodeValue = HmacProcess(verificationCodeValue, config.MAC_VERIFICATION_CODE_SECRET);
            existingUser.forgotPasswordToken = hashedVerificationCodeValue;
            existingUser.forgotPasswordTokenValidation = Date.now() + 10 * 60 * 1000; // token valid for 10 minutes
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
UserRoute.patch('/verifyForgottenPassword', authLimiter, expressAsync(async(req, res)=>{
    try{
        const { email, verificationCodeProvided, newPassword } = req.body;
        // validate user input
        const { error, value } = ValidateForgottenPassword().validate({ email, verificationCodeProvided, newPassword });
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }
        //const codeValue = req.body.verificationCodeprovided;
        const codeValue = verificationCodeProvided.toString();
        //check if email exist
        const existingUser = await User.findOne({
            email: req.body.email,
        }).select('+forgotPasswordToken +forgotPasswordTokenValidation');
        if(!existingUser){
            return res.status(404).send({ message: 'User does not exist' });
        }
        //check if verification token exist and valid
        if(!existingUser.forgotPasswordToken || !existingUser.forgotPasswordTokenValidation){
            return res.status(400).send({ message: 'No verification code found, please request a new one' });
        }
        if(Date.now() > existingUser.forgotPasswordTokenValidation){
            return res.status(400).send({ message: 'Verification code expired, please request a new one' });
        }

        const hashedCodeValue = HmacProcess(codeValue, config.MAC_VERIFICATION_CODE_SECRET);
        if(hashedCodeValue === existingUser.forgotPasswordToken){
            existingUser.password = PassHash(newPassword, 8);
            existingUser.forgotPasswordToken = undefined;
            existingUser.forgotPasswordTokenValidation = undefined;
            await existingUser.save();
            return res.status(200).send({ message: 'Password reset successfully' });
        }
        return res.status(400).send({ message: 'Invalid verification code!!' });
    }catch(error){
        console.log(error);
        return res.status(500).send({ message: 'Email verification failed' });
    }
}));
UserRoute.get('/session', expressAsync(async(req, res)=>{
    if(!req.session || !req.session.user){
        res.status(401).send({ 
            authenticated: false,
            message: 'Please Sign In' 
        });
    } else {
        res.send({ 
            authenticated: true,
            user: req.session.user 
        });
    }
}));
//profile summary route
UserRoute.get('/profile-summary', isAuth, expressAsync(async(req, res)=>{
    const user = await User.findById(req.user_id);
    if(!user){
        return res.status(404).send({ message: 'User not found' });
    }
    const profile = await Profile.findOne({ user: req.user_id });
    res.send({
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        verified: user.verified,
        memberSince: user.createdAt,
        lastLogin: user.lastLogin,
        activityLog: user.activetyLog.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10), // return latest 10 activities
        profile: profile || null,
        profileCompleted: profile ? profile.profileCompleted : false,
    });
}));

module.exports = UserRoute;