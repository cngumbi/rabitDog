const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
//const methodOverride = require("method-override");
const path = require("path");
const  db = require("./config/mongoosDB");
const config = require("./config/config");
const UserRoute = require("./routes/userRoute");
const OrderRoute = require("./routes/ordrerRoute");
const UploadRoute = require("./routes/uploadRoute");
const ProductRoute = require("./routes/productRoute");
const ProfileRoute = require("./routes/profileRoute");


const app = express();

//middleware
app.use(cors()); 
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//override with POST having ?_method=DELETE
//app.use(methodOverride('_method'));
//routes
app.use('/api/users', UserRoute);
app.use("/api/profile", ProfileRoute);
app.use('/api/uploads', UploadRoute);
app.use('/api/products', ProductRoute);
app.use('/api/orders', OrderRoute);
app.get('/api/paypal/clientId', (req, res)=>{
  res.send({ clientId: config.PAYPAL_CLIENT_ID });
});
//app.use('/api/contacts', ContactRoute);
//app.use('/api/services', ServiceRoute);
app.use('/uploads', express.static(path.join(__dirname, '/../uploads')));
app.use(express.static(path.join(__dirname, "/../frontend/dist")));
app.use('/api', (req, res) => {
  res.status(404).send({ 
    message: `API endpoint not found : ${req.method} ${req.originalUrl}`
  });
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/../frontend/dist/index.html"));
});
//app.use((req, res, next) => {
//  if (req.originalUrl.startsWith('/api')) {
//    return next();
//  }
//  res.sendFile(path.join(__dirname, "/../frontend/dist/index.html"));
//});
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
