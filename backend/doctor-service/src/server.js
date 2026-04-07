const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const doctorRoutes = require("./routes/doctorRoutes");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api", doctorRoutes);

app.listen(8082, () => {
  console.log("Doctor Service running on port 8082");
});