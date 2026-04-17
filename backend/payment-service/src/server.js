const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const paymentRoutes = require("./routes/payment.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/payments/uploads",
  express.static(path.resolve(__dirname, "../uploads")),
);
app.use("/payments", paymentRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "payment-service" });
});

const PORT = process.env.PORT || 3004;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/medicare-payments";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Payment service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
