const Joi = require('joi');

const ValidateData = ()=>{
    return Joi.object({
    email: Joi.string().min(6).max(60).email({ tlds: { allow: ['com', 'net', 'org'] } }).required(),
    password: Joi.string().min(6).required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()\\-+]).{6,}$')).messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'string.min': 'Password must be at least 6 characters long'
    }),
});
};

module.exports = { ValidateData };