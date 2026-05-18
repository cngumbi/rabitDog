const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const PassHash = (value, saltValue)=>{
    const result = bcrypt.hashSync(value, saltValue);
    return result; 
};

const PassCompare = (value, hash)=>{
    const result = bcrypt.compareSync(value, hash);
    return result;
};

const HmacProcess = (value, secretKey)=>{
    const result = crypto.createHmac('sha256', secretKey).update(value).digest('hex');
    return result;
};

module.exports = { PassHash, PassCompare, HmacProcess };
