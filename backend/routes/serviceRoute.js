const express = require('express');
const expressAsync = require('express-async-handler');

const Service = require('../models/serviceModel');

const ServiceRoute = express.Router();

ServiceRoute.post('/service', expressAsync(async(req, res)=>{
    try{
        const service = new Service({
            serviceTitle: req.body.serviceTitle,
            serviceDescription: req.body.serviceDescription
        });
        const newService = await service.save();
        if(!newService){
            res.status(401).send({
                message: 'Invalid Service Data',
            });
        }else{
            res.send({
                _id: newService._id,
                serviceTitle: newService.serviceTitle,
                serviceDescription: newService.serviceDescription
            });
        }
    }catch(err){
        res.status(500).send({ message: err.message });
    }
}));

module.exports = ServiceRoute;