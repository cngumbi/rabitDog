const SessionAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).send({ message: 'Please Sign In' });
    }
    next();
    console.log('SESSION DURING PUT:', req.session);
};

module.exports = SessionAuth;