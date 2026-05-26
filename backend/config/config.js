const dotenv = require('dotenv');

dotenv.config();
module.exports = {
    MONGODB_URL: process.env.MONGODB_URL,
    PORT: process.env.PORT || 5000,
    JWT_SECRET: process.env.JWT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV === 'production',
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    NODE_CODE_EMAIL_ADDRESS: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
    NODE_CODE_EMAIL_PASSWORD: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
    NODE_SMTP_SERVICE: process.env.NODE_EMAIL_SENDING_SERVICE,
    MAC_VERIFICATION_CODE_SECRET: process.env.MAC_VERIFICATION_CODE_SECRET,
}