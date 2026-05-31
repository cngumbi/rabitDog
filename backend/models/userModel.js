const mongoose = require('mongoose');

//define the user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: true },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenValidation: { type: Number, select: false },
    forgotPasswordToken: { type: String, select: false },
    forgotPasswordTokenValidation: { type: Number, select: false },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Number, select: false },
    refreshToken: { type: String, select: false }

}, { timestamps: true });
//create the user model
const User = mongoose.model('User', userSchema);
//export the user model
module.exports = User;