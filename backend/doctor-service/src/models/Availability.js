const mongoose = require("mongoose");

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    block: { type: String, required: true },
    isAvailable: { type: Boolean, default: false }
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true },
  slots: [availabilitySlotSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model("Availability", availabilitySchema);