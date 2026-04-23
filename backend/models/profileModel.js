const mongoose = require('mongoose');

//define the Profile schema
const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    name: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true},
    nationalID: {
        type: String,
        required: true,
        unique: true
    },
    bio: { type: String, required: true },
    profileCompleted: { type: Boolean, required: true, default: false },
}, { timestamps: true });

//create the user model
const Profile = mongoose.model('Profile', profileSchema);
//export the user model
module.exports = Profile;