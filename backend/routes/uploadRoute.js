const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { isAuth, isAdmin } = require('../util');




const storageEngine = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb){
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
});

const upload = multer({ 
    storage: storageEngine,
    fileFilter: function(req, file, callback){
        if(
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg"
        ){
            callback(null, true)
        }else{
            console.log('Only jpg, png and gif file supported!');
            callback(null, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
 });
const UploadRoute = express.Router();

UploadRoute.post('/', isAuth, isAdmin, upload.single('image'), (req, res, next) => {
    //console.log(req.file);
    res.status(201).send({ image: `${req.file.path}`});
    
});

module.exports = UploadRoute;