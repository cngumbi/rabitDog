const Joi = require('joi');

exports.ValidateData = Joi.object({
    email: Joi.string().min(6).max(60).email({ tlds: { allow: ['com', 'net', 'org'] } }).required(),
    password: Joi.string().min(6).required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()-+]).{6,}$')),
});