const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  doctorId: String,
  patientId: String,
  notes: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Prescription", prescriptionSchema);