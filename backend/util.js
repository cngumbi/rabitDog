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
        return res.status(401).send({ message: 'Token not available: Access Denied' });
    }

    const token = bearerToken.startsWith('Bearer ') ? bearerToken.slice(7) : bearerToken;
    jsonWT.verify(token, config.JWT_SECRET, (err, data) => {
        if (err) {
            return res.status(401).send({ message: 'Invalid Token' });
        }
        req.user = data;
        next();
    });
};

const hasRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).send({ message: 'Authentication required' });
    }

    const userRole = req.user.isAdmin ? 'admin' : 'user';
    if (!allowedRoles.includes(userRole)) {
        return res.status(403).send({ message: 'Access denied: insufficient permissions' });
    }

    next();
};

const isAdmin = hasRole('admin');

module.exports = {
    generateToken,
    generateRefreshToken,
    isAuth,
    hasRole,
    isAdmin,
};