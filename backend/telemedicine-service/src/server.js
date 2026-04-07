require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = Number(process.env.PORT || 8087);
const jitsiBaseUrl = process.env.JITSI_BASE_URL || 'https://meet.jit.si';

app.use(cors());
app.use(express.json());

function makeRoomName(appointmentId, doctorId, patientId) {
  const random = crypto.randomBytes(3).toString('hex');
  return `medicare-${appointmentId}-${doctorId}-${patientId}-${random}`;
}

function logDelivery(sessionId, recipientType, recipientId, meetingUrl) {
  const message = `Telemedicine link: ${meetingUrl}`;
  db.prepare(`
    INSERT INTO delivery_log (session_id, channel, recipient_type, recipient_id, message)
    VALUES (?, 'in-app', ?, ?, ?)
  `).run(sessionId, recipientType, Number(recipientId), message);
}

app.get('/health', (_req, res) => {
  res.json({ service: 'telemedicine-service', status: 'ok' });
});

app.post('/telemedicine/sessions', (req, res) => {
  const { appointmentId, doctorId, patientId } = req.body;

  if (!appointmentId || !doctorId || !patientId) {
    return res.status(400).json({
      message: 'appointmentId, doctorId, and patientId are required'
    });
  }

  const existing = db.prepare('SELECT * FROM telemedicine_sessions WHERE appointment_id = ?').get(Number(appointmentId));
  if (existing) {
    return res.status(200).json({
      message: 'Session already exists for this appointment',
      data: existing
    });
  }

  const roomName = makeRoomName(Number(appointmentId), Number(doctorId), Number(patientId));
  const meetingUrl = `${jitsiBaseUrl}/${roomName}`;

  const result = db.prepare(`
    INSERT INTO telemedicine_sessions
      (appointment_id, doctor_id, patient_id, room_name, meeting_url)
    VALUES (?, ?, ?, ?, ?)
  `).run(Number(appointmentId), Number(doctorId), Number(patientId), roomName, meetingUrl);

  const session = db.prepare('SELECT * FROM telemedicine_sessions WHERE id = ?').get(result.lastInsertRowid);

  // For assignment scope this simulates sending the link to doctor and patient.
  logDelivery(session.id, 'doctor', Number(doctorId), meetingUrl);
  logDelivery(session.id, 'patient', Number(patientId), meetingUrl);

  return res.status(201).json({
    message: 'Telemedicine session created and links sent',
    data: {
      ...session,
      join: {
        doctor: meetingUrl,
        patient: meetingUrl
      }
    }
  });
});

app.get('/telemedicine/sessions/:appointmentId', (req, res) => {
  const appointmentId = Number(req.params.appointmentId);
  if (!appointmentId) {
    return res.status(400).json({ message: 'appointmentId must be a number' });
  }

  const session = db
    .prepare('SELECT * FROM telemedicine_sessions WHERE appointment_id = ?')
    .get(appointmentId);

  if (!session) {
    return res.status(404).json({ message: 'No session found for this appointment' });
  }

  return res.json({
    message: 'Session found',
    data: {
      ...session,
      join: {
        doctor: session.meeting_url,
        patient: session.meeting_url
      }
    }
  });
});

app.get('/telemedicine/sessions/:appointmentId/delivery-log', (req, res) => {
  const appointmentId = Number(req.params.appointmentId);
  if (!appointmentId) {
    return res.status(400).json({ message: 'appointmentId must be a number' });
  }

  const session = db
    .prepare('SELECT * FROM telemedicine_sessions WHERE appointment_id = ?')
    .get(appointmentId);

  if (!session) {
    return res.status(404).json({ message: 'No session found for this appointment' });
  }

  const logs = db
    .prepare('SELECT * FROM delivery_log WHERE session_id = ? ORDER BY sent_at DESC')
    .all(session.id);

  return res.json({ data: logs });
});

app.listen(port, () => {
  console.log(`telemedicine-service running on port ${port}`);
});
