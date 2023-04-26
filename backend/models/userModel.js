const mongoose =require('mongoose');

//define the user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
}, { timestamps: true });

//create the user model
const User = mongoose.model('User', userSchema);

//export the user model
module.exports = User;