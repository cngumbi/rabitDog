const bcrypt = require("bcryptjs");

const PassHash = (value, saltValue)=>{
    const result = bcrypt.hashSync(value, saltValue);
    return result; 
};

const PassCompare = (value, hash)=>{
    const result = bcrypt.compareSync(value, hash);
    return result;
};

module.exports = { PassHash, PassCompare };

