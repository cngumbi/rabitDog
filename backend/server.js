const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./config/mongoosDB");
//const ContactRoute = require("./routes/contactRoutes");
const config = require("./config/config");
//const ServiceRoute = require("./routes/serviceRoute");
const UserRoute = require("./routes/userRoute");


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', UserRoute);
//app.use('/api/contacts', ContactRoute);
//app.use('/api/services', ServiceRoute);

app.use(express.static(path.join(__dirname, "/../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/../frontend/dist/index.html"));
});
//middleware
//error handling code to handle all errors in express instance
app.use((err, req, res, next) => {
  const status = err.name && err.name === "Validation Error";
  res.status(status).send({ message: err.message });
});
//-0000000000000000000000000000000000000000000000000000000000
//-0000000000000000000000000000000000000000000000000000000000
app.listen(config.PORT, () => {
  console.log(`server running on port ${config.PORT}`);
});
