const mongoose = require('mongoose');

//define the Profile schema
const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    name: { type: String, default: '' },
    userName: { type: String, unique: true, sparse: true },
    phoneNumber: { type: String, default: '' },
    nationalID: {
        type: String,
        sparse: true
    },
    bio: { type: String, default: '' },
    settings: {
        currency: { type: String, default: 'Ksh' },
        dateformat: { type: String, default: 'DD/MM/YYYY' },
        workspaceName: { type: String, default: '' },
        businessEmail: { type: String, default: '' },
        emailAlerts: { type: Boolean, default: true },
        lowStockAlerts: { type: Boolean, default: true },
        digestTime: { type: String, default: '06:00' },
        sessionTimeout: { type: Number, default: 120 },
        admin2fa: { type: Boolean, default: false },
    },
    profileCompleted: { type: Boolean, default: false },
}, { timestamps: true });

//create the user model
const Profile = mongoose.model('Profile', profileSchema);
//export the user model
module.exports = Profile;