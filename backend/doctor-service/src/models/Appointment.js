const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  patientId: String,
  patientName: { type: String, required: true },
  reason: { type: String, required: true },
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  consultType: { type: String, enum: ["video", "in-person"], default: "video" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  fee: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("DoctorAppointment", appointmentSchema);
