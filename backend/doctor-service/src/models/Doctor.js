const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: String,
  email: String,
  specialization: String,
  verified: { type: Boolean, default: false }
});

module.exports = mongoose.model("Doctor", doctorSchema);