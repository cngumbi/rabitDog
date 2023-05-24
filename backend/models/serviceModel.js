const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({

    serviceTitle: { type:String, require: true },
    serviceDescription: { type:String, require: true }

}, { timestamps:true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;