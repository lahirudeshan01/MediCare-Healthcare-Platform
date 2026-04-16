const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const notificationRoutes = require("./routes/notification.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/notifications", notificationRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "notification-service" });
});

const PORT = process.env.PORT || 3005;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/notifications";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Notification service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
