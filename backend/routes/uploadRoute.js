const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { isAuth, isAdmin } = require('../util');




// Ensure uploads directory exists (project-root/uploads)
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storageEngine = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb){
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
});

const upload = multer({ 
    storage: storageEngine,
    fileFilter: function(req, file, callback){
        const allowed = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
        if (allowed.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log('Only jpg, jpeg, png and gif files supported!');
            callback(null, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5 // allow up to 5MB
    }
 });
const UploadRoute = express.Router();

UploadRoute.post('/', isAuth, isAdmin, upload.single('image'), (req, res, next) => {
    // If multer rejected the file or no file was provided, respond with a clear error
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded or invalid file type' });
    }
    // return a URL path relative to the server root so clients can load it via /uploads/<filename>
    const imagePath = `/uploads/${req.file.filename}`;
    res.status(201).send({ image: imagePath });
});

module.exports = UploadRoute;