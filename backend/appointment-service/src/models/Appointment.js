const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: true,
    },
    patientId: {
      type: String,
      required: true,
    },
    specialty: {
      type: String,
      required: true,
    },
    date: {
      type: String, // format YYYY-MM-DD
      required: true,
    },
    timeSlot: {
      type: String, // format HH:MM - HH:MM
      required: true,
    },
    consultType: {
      type: String,
      enum: ["video", "in-person"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PENDING", "PAID", "REJECTED"],
      default: "UNPAID",
    },
    paymentSlip: {
      paymentId: { type: String },
      fileName: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      publicUrl: { type: String },
      uploadedAt: { type: Date },
    },
    status: {
      type: String,
      enum: ["PENDING", "LOCKED", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
