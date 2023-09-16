const mongoose = require('mongoose');
const config = require('./config');


//create a connection\
mongoose.set('strictQuery', true);
mongoose.connect(config.MONGODB_URL).then(()=>{
    console.log('Connected To mongodb.');
}).catch((error)=>{
    console.log(error.reason);
});
