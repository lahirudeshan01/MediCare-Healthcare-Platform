require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const TelemedicineSession = require('./models/TelemedicineSession');

const app = express();
const port = Number(process.env.PORT || 8085);
const jitsiBaseUrl = process.env.JITSI_BASE_URL || 'https://meet.jit.si';

app.use(cors());
app.use(express.json());

connectDB();

app.get('/health', (_req, res) => {
  res.json({ service: 'telemedicine-service', status: 'ok' });
});

app.post('/create-meeting', async (req, res) => {
  try {
    const { appointmentId, doctorId, patientId } = req.body || {};

    if (!appointmentId || !doctorId || !patientId) {
      return res.status(400).json({
        message: 'appointmentId, doctorId, and patientId are required'
      });
    }

    const existing = await TelemedicineSession.findOne({ appointmentId: Number(appointmentId) });
    if (existing) {
      return res.status(200).json({
        message: 'Session already exists for this appointment',
        data: existing
      });
    }

    const roomName = `healthcare_${Date.now()}`;
    const meetingUrl = `${jitsiBaseUrl}/${roomName}`;

    const created = await TelemedicineSession.create({
      appointmentId: Number(appointmentId),
      doctorId: Number(doctorId),
      patientId: Number(patientId),
      roomName,
      meetingUrl
    });

    return res.status(201).json({
      message: 'Meeting created',
      data: created
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create meeting', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Telemedicine Service running on port ${port}`);
});