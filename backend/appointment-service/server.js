// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const http = require('http');

// // Load env vars
// dotenv.config();

// const app = express();
// const server = http.createServer(app);

// // Services
// const { connectRabbitMQ } = require('./src/services/rabbitmq.service');
// const { initSocket } = require('./src/services/socket.service');

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// const appointmentRoutes = require('./src/routes/appointment.routes');
// app.use('/appointments', appointmentRoutes);

// // Health check
// app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/appointments';

// // Connect to MongoDB
// mongoose.connect(MONGO_URI)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Initialize Socket.io
// initSocket(server);

// // Start server after RabbitMQ connects
// connectRabbitMQ().then(() => {
//     server.listen(PORT, () => {
//         console.log(`Appointments Service running on port ${PORT}`);
//     });
// });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const appointmentRoutes = require("./src/routes/appointment.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/appointments", appointmentRoutes);

// Health check (aligned with auth-service)
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "appointment-service" });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/appointments";

// Proper startup flow (same as auth-service)
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Appointment service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
