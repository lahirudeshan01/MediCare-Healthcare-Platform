const mongoose = require('mongoose');

const telemedicineSessionSchema = new mongoose.Schema(
  {
    appointmentId: { type: Number, required: true, unique: true },
    doctorId: { type: Number, required: true },
    patientId: { type: Number, required: true },
    roomName: { type: String, required: true, unique: true },
    meetingUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'ENDED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true,
    collection: 'telemedicine_sessions'
  }
);

module.exports = mongoose.model('TelemedicineSession', telemedicineSessionSchema);
