const express = require("express");
const cors = require("cors");
//const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
var passport = require("passport");
var crypto = require("crypto");
const  db = require("./config/mongoosDB");
//const ContactRoute = require("./routes/contactRoutes");
const config = require("./config/config");
//mongoStore middleware
const MongoStore = require("connect-mongo");
//const ServiceRoute = require("./routes/serviceRoute");
const UserRoute = require("./routes/userRoute");
const OrderRoute = require("./routes/ordrerRoute");
const UploadRoute = require("./routes/uploadRoute");
const ProductRoute = require("./routes/productRoute");


const app = express();

//middleware
app.use(cors()); 
//app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
/*------------------SESSION SETUP------------------------*/
const sessionStore = new MongoStore({
  mongoUrl:config.MONGODB_URL,
  ttl: 86400, // ttl set for a day
  autoRemove: 'interval',
  autoRemoveInterval: 10, // In minutes. Default
  //dbName: 'test', 
  collectionName: 'sessions',
  touchAfter: 1 * 3600, // time period in seconds set for one hour
});
app.use(session({
  store: sessionStore,
}));
app.use('/api/users', UserRoute);
app.use('/api/uploads', UploadRoute);
app.use('/api/products', ProductRoute);
app.use('/api/orders', OrderRoute);
//app.use('/api/contacts', ContactRoute);
//app.use('/api/services', ServiceRoute);
/*app.get('/api/paypal/clientId', (req, res)=>{
  res.send({ clientId: config.PAYPAL_CLIENT_ID});
})*/
app.use('/uploads', express.static(path.join(__dirname, '/../uploads')));
app.use(express.static(path.join(__dirname, "/../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/../frontend/dist/index.html"));
});
//middleware
//error handling code to handle all errors in express instance
app.use((err, req, res, next) => {
  const status = err.name && err.name === "Validation Error" ? 400 : 500;
  console.log(`Status Code ${status}`);
  res.status(status).send({ message: err.message });
});
//-0000000000000000000000000000000000000000000000000000000000
//-0000000000000000000000000000000000000000000000000000000000
app.listen(config.PORT, () => {
  console.log(`server running on port ${config.PORT}`);
});
