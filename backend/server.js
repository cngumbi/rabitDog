const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "/../frontend")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/../frontend/index.html"));
});
//error handling
//code to handle all errors in express instance
app.use((err, req, res, next) => {
  const status = err.name && err.name === "Validation Error";
  res.status(status).send({ message: err.message });
});
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
