const mongoose = require('mongoose');
const config = require('./config');

class Database{
    constructor(){
        this.connect();
    }

    connect(){
        mongoose.set('useNewUrlParser', 'useUnifiedTopology', true);
        mongoose.set('strictQuery', false);
        mongoose.connect(config.MONGODB_URL);

        const database = mongoose.connection;
        database.on('error', console.error.bind(console, 'connection error'));
        database.once('open', function(){
            console.log('Success db Connection');
        });
    }
};

module.exports = new Database();