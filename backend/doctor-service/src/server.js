const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const doctorRoutes = require("./routes/doctorRoutes");
const { connectRabbitMQ } = require("./rabbitmq");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();
connectRabbitMQ();

app.get("/", (_req, res) => {
  res.json({ service: "doctor-service", status: "ok" });
});

app.get("/health", (_req, res) => {
  res.json({ service: "doctor-service", status: "ok" });
});

// Routes mounted at root — gateway prefixes are preserved
app.use("/", doctorRoutes);

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Doctor Service running on port ${PORT}`);
});