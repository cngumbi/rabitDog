const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 10,//60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 1 hour' },
  standardHeaders: true, //  Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { authLimiter };