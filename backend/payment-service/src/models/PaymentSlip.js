const mongoose = require("mongoose");

const paymentSlipSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      index: true,
    },
    patientId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "LKR",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    slip: {
      fileName: { type: String, required: true },
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      storagePath: { type: String, required: true },
      publicUrl: { type: String, required: true },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PaymentSlip", paymentSlipSchema);
