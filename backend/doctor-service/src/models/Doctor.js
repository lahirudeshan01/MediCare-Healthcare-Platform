const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: String,
  email: String,
  specialization: String,
  verified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  consultationFee: { type: Number, default: 2000 },
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);