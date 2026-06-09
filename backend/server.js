const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const  db = require("./config/mongoosDB");
const config = require("./config/config");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const UserRoute = require("./routes/userRoute");
const OrderRoute = require("./routes/orderRoute");
const UploadRoute = require("./routes/uploadRoute");
const ProductRoute = require("./routes/productRoute");
const ProfileRoute = require("./routes/profileRoute");
const HealthRecordRoute = require("./routes/healthRecordRoute");
const PartyRoute = require("./routes/partyRoute");
const PurchaseRoute = require("./routes/purchaseRoute");
const TransferRoute = require("./routes/transferRoute");
const ExpenseRoute = require("./routes/expenseRoute");

const app = express();
//middleware
//for production
//app.use(
//  cors({
//    origin: [
//      "http://localhost:5000",
//      "https://domainName.com",
//    ],
//    credentials: true,
//  })
//);
app.use(cors({
  origin: true,
  credentials: true
})); 
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//-0000000000000000000000000000000000000000000000000000000000
//-0000000000000000000-SESSION-SETUP-000000000000000000000000
//-0000000000000000000000000000000000000000000000000000000000
//TRUST REVERSE PROXY (NGINX, RENDER, HEROKU, RAILWAY, VERCEL, ETC.)
app.set('trust proxy', 1);
const isProduction = process.env.NODE_ENV === "production";
app.use(
  session({
    name: "sessionId",
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.MONGODB_URL,
      collectionName: "sessions",
      ttl: 24 * 60 * 60 // one day
    }),
    cookie: {
      httpOnly: true,
      secure: false,//config.NODE_ENV,
      sameSite: "lax",
      //to use in production
      //required in production HTTps
      //-secure: isProduction,
      //-sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
  })
);
//Static file serving
app.use('/uploads', express.static(path.join(__dirname, '/../uploads')));
app.use(express.static(path.join(__dirname, "/../frontend/dist")));
//routes
app.use('/api/users', UserRoute);
app.use("/api/profile", ProfileRoute);
app.use('/api/health-records', HealthRecordRoute);
app.use('/api/uploads', UploadRoute);
app.use('/api/products', ProductRoute);
app.use('/api/orders', OrderRoute);
app.use('/api/parties', PartyRoute);
app.use('/api/purchases', PurchaseRoute);
app.use('/api/transfers', TransferRoute);
app.use('/api/expenses', ExpenseRoute);

app.get('/api/paypal/clientId', (req, res)=>{
  res.send({ clientId: config.PAYPAL_CLIENT_ID });
});
//app.use('/api/contacts', ContactRoute);
//app.use('/api/services', ServiceRoute);
app.use('/api/*', (req, res) => {
  res.status(404).send({ 
    message: `API endpoint not found : ${req.method} ${req.originalUrl}`
  });
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/../frontend/dist/index.html"));
});
//middleware
//error handling code to handle all errors in express instance
app.use((err, req, res, next) => {
  const status = err.name && err.name === "ValidationError" ? 400 : 500;
  console.log(`Status Code ${status}`);
  res.status(status).send({ message: err.message });
});
//-0000000000000000000000000000000000000000000000000000000000
//-0000000000000000000000000000000000000000000000000000000000
app.listen(config.PORT, () => {
  console.log(`server running on port ${config.PORT}`);
});
