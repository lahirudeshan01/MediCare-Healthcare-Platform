const mongoose = require('mongoose');

const deliveryLogSchema = new mongoose.Schema(
  {
    recipientType: {
      type: String,
      enum: ['DOCTOR', 'PATIENT'],
      required: true
    },
    recipientId: { type: String, required: true },
    channel: {
      type: String,
      enum: ['APP_NOTIFICATION', 'EMAIL', 'SMS'],
      default: 'APP_NOTIFICATION'
    },
    status: {
      type: String,
      enum: ['SENT', 'FAILED'],
      default: 'SENT'
    },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now }
  },
  {
    _id: false
  }
);

const telemedicineSessionSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, required: true, unique: true },
    doctorId: { type: String, required: true },
    patientId: { type: String, required: true },
    provider: {
      type: String,
      enum: ['jitsi', 'agora', 'twilio'],
      default: 'jitsi'
    },
    roomName: { type: String, required: true, unique: true },
    meetingUrl: { type: String, required: true },
    deliveryLog: [deliveryLogSchema],
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
