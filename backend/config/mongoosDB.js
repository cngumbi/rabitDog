const mongoose = require('mongoose');
const config = require('./config');


//create a connection\
mongoose.set('strictQuery', true);
mongoose.connect(config.MONGODB_URL).then(()=>{
    console.log('Connected To mongodb.');
}).catch((error)=>{
    console.log(error.reason);
});

//class Database{
//    constructor(){
//        this.connected = false;
//        this.connect();
//    }
//
//    async connect(){
//        const rules = {
//            useNewUrlParser:  true,
//            useUnifiedTopology: true,
//        };
//            
//        try{
//            mongoose.set('strictQuery', false);
//            await mongoose.connect(config.MONGODB_URL, rules);
//            const database = mongoose.connection;
//            database.once('open', function(){
//                console.log('Success db Connection');
//            })         
//            this.connected = true;
//        } catch(err){
//            console.error('connection error', err);
//        }
//        //mongoose.set('useNewUrlParser', 'useUnifiedTopology', true);
//        //mongoose.set('strictQuery', false);
//        
//
//        //const database = mongoose.connection;
//        //database.on('error', console.error.bind(console, 'connection error'));
//        //database.once('open', ()=>{
//        //    
//        //});
//    }
//    isConnected(){
//        return this.connected;
//    }
//    async close(){
//        await mongoose.connection.close();
//        console.log('Database Connection Closed');
//        this.connected = false;
//    }
//};
//
//module.exports = Database;

