const nodemailer = require('nodemailer');
const config = require('../config/config');

//create transporter
const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth: {
        user: config.NODE_CODE_EMAIL_ADDRESS,
        pass: config.NODE_CODE_EMAIL_PASSWORD,
    }
});
transporter.verify((error, success)=>{
    if(error){
        console.log('Error with email transporter: ', error);
    }else{
        console.log('Email transporter is ready to send messages');
    }
});

module.exports = transporter;