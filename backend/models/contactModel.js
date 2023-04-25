const mongoose = require('mongoose');

const contactScheme = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required:true},
    number: {type:String, required:true},
    subject: {type:String, required:true},
    message: {type:String, required:true}
}, {
    timestamps: true
});

const Contact = mongoose.model('Contact', contactScheme);

module.exports = Contact;