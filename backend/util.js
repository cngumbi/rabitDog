const jsonWT = require('jsonwebtoken');
const config = require('./config/config');

const generateToken =(user)=> {
    return jsonWT.sign(
        {
            _id: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
        },
        config.JWT_SECRET,
        {
            expiresIn: '15m',
        }
    );
};

const generateRefreshToken = (user)=> {
    return jsonWT.sign(
        {
            _id: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
        },
        config.REFRESH_TOKEN_SECRET,
        {
            expiresIn: '4h',
        }
    );
};

const isAuth = (req, res, next) => {
    const bearerToken = req.cookies.Authorization || req.headers.authorization;
    if (!bearerToken) {
        res.status(401).send({ message: 'Token not available: Access Denied' });
        return;
    }

    const token = bearerToken.startsWith('Bearer ') ? bearerToken.slice(7) : bearerToken;
    jsonWT.verify(token, config.JWT_SECRET, (err, data) => {
        if (err) {
           return res.status(401).send({ message: 'Invalid Token' });
        }
        req.user = data;
        next();
    })
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
    generateRefreshToken,
    isAuth,
    isAdmin
}