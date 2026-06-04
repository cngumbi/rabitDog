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
    profileCompleted: { type: Boolean, default: false },
}, { timestamps: true });

//create the user model
const Profile = mongoose.model('Profile', profileSchema);
//export the user model
module.exports = Profile;