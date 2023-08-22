const express = require('express');
const multer = require('multer');
const { isAuth, isAdmin } = require('../util');

const storage = multer.diskStorage({
    destination(req, file, cb){
        cb(null, 'upload/');
    },
    filename(req, file, cb){
        cb(null, `${Data.now()}.jpg`);
    },
});

const upload = multer({ storage });
const uploadRoute = express.Router();

uploadRoute.post('/', isAuth, isAdmin, upload.single('image'), (req, res) => {
    res.status(201).send({ image: `/${req.file.path}`})
});

module.exports = uploadRoute;