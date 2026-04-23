//Validation module for the user
const validateRegister = (req, res, next) =>{
    const { email, password } = req.body;
    //validate email
    if(!email){
        return res.status(400).send({ message: 'Email is required'});
    }
    //validate password
    if(!password){
        return res.status(400).send({ message: 'Password is required' });
    }
    next(); // move to next route
};
const validateUpdate = (req, res, next) =>{
    const { email, password } = req.body;
    //validate email
    if(!email && typeof email !== 'string'){
        return res.status(400).send({ message: 'Invalid email format'});
    }
    //validate password
    if(!password && password.length < 6){
        return res.status(400).send({ message: 'Password is must be at least 6' });
    }
    next(); // move to next route
};

module.exports = {
    validateRegister,
    validateUpdate,
};