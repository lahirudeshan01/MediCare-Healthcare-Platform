const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true },
  slots: [
    {
      day: { type: String, required: true },
      block: { type: String, required: true },
      isAvailable: { type: Boolean, default: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Availability", availabilitySchema);
