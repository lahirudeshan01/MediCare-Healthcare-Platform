const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const patientRoutes = require("./routes/patientRoutes");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const mongoUri =
  process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded reports statically
const reportsDirectory = path.join(__dirname, "uploads/reports");
fs.mkdirSync(reportsDirectory, { recursive: true });
app.use("/uploads/reports", express.static(reportsDirectory));

// Routes
app.use("/", patientRoutes);

// Database Connection
if (!mongoUri) {
  console.error(
    "Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI in .env",
  );
} else {
  mongoose
    .connect(mongoUri)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Could not connect to MongoDB", err));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
