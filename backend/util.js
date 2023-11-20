const jsonWT = require('jsonwebtoken');
const config = require('./config/config');

const generateToken =(user)=> {
    return jsonWT.sign(
        {
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        },
        config.JWT_SECRET
    );
};
const isAuth = (req, res, next) => {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
        res.status(401).send({ message: 'Token not available' });

    } else {
        const token = bearerToken.slice(7, bearerToken.length);
        jsonWT.verify(token, config.JWT_SECRET, (err, data) => {
            if (err) {
                res.status(401).send({ message: 'Invalid Token' });
            } else {
                req.user = data;
                next();
            }
        })
    }
};
const isAdmin = (req, res, next) => {
    if(req.user && req.user.isAdmin){
        next();
    }else{
        res.status(401).send({ message: 'Token not valid for admin user' });
    }
 };
module.exports = {
    generateToken,
    isAuth,
    isAdmin
}