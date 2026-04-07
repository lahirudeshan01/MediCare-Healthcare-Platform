require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = Number(process.env.PORT || 8085);
const jitsiBaseUrl = process.env.JITSI_BASE_URL || 'https://meet.jit.si';

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'telemedicine-service', status: 'ok' });
});

// Generate and persist a Jitsi meeting link so it is traceable in DB.
app.post('/create-meeting', (req, res) => {
  const { appointmentId = null, doctorId = null, patientId = null } = req.body || {};

  const roomName = `healthcare_${Date.now()}`;
  const url = `${jitsiBaseUrl}/${roomName}`;

  const insert = db.prepare(`
    INSERT INTO telemedicine_sessions (appointment_id, doctor_id, patient_id, room_name, meeting_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  const safeAppointmentId = Number(appointmentId) || Math.floor(Date.now() / 1000);
  const safeDoctorId = Number(doctorId) || 0;
  const safePatientId = Number(patientId) || 0;

  insert.run(safeAppointmentId, safeDoctorId, safePatientId, roomName, url);

  res.json({
    meetingId: roomName,
    meetingUrl: url,
    appointmentId: safeAppointmentId
  });
});

app.listen(port, () => {
  db.prepare('SELECT 1 as ok').get();
  console.log(`Telemedicine Service running on port ${port}`);
  console.log('Telemedicine database initialized successfully');
});