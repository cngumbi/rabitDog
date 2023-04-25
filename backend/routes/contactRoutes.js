const express = require('express');
const expressAsync = require('express-async-handler');

const Contact = require('../models/contactModel');

const ContactRoute = express.Router();

ContactRoute.post('/contact', expressAsync(async(req, res)=>{
    try{
        const message = new Contact({
            name: req.body.name,
            email: req.body.email,
            number: req.body.number,
            subject: req.body.subject,
            message: req.body.message
        });
        const sentMessage = await message.save();
        if(!sentMessage){
            res.status(401).send({
                message: 'Invalid Contact Data',
            });
        } else{
            res.send({
                _id: sentMessage._id,
                name: sentMessage.name,
                email: sentMessage.email,
                number: sentMessage.number,
                subject: sentMessage.subject,
                message: sentMessage.message
            });
        }
    }catch(err){
        res.status(500).send({ message: err.message });
    }
}));

module.exports = ContactRoute;