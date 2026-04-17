const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  patientId: { type: String, default: "" },
  patientName: { type: String, required: true },
  diagnosis: { type: String, required: true },
  medications: [
    {
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
    },
  ],
  notes: String,
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Prescription", prescriptionSchema);
