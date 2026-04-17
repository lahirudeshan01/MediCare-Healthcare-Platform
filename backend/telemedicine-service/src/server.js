require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const TelemedicineSession = require('./models/TelemedicineSession');
const verifyToken = require('./middleware/verifyToken');
const { startConsumer } = require('./rabbitmq');

const app = express();
const port = Number(process.env.PORT || 8085);
const jitsiBaseUrl = process.env.JITSI_BASE_URL || 'https://meet.jit.si';
const agoraBaseUrl = process.env.AGORA_WEB_CLIENT_URL || 'https://webdemo.agora.io/basicVideoCall/index.html';
const twilioBaseUrl =
  process.env.TWILIO_ROOM_APP_BASE_URL || 'https://video.twilio.com';

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (_req, res) => {
  res.json({ service: 'telemedicine-service', status: 'ok' });
});

app.get('/health', (_req, res) => {
  res.json({ service: 'telemedicine-service', status: 'ok' });
});

const buildMeetingUrl = (provider, roomName) => {
  if (provider === 'agora') {
    return `${agoraBaseUrl}?channel=${encodeURIComponent(roomName)}`;
  }

  if (provider === 'twilio') {
    return `${twilioBaseUrl}?room=${encodeURIComponent(roomName)}`;
  }

  return `${jitsiBaseUrl}/${roomName}`;
};

const buildDeliveryLog = ({ appointmentId, doctorId, patientId, provider, meetingUrl }) => [
  {
    recipientType: 'DOCTOR',
    recipientId: String(doctorId),
    channel: 'APP_NOTIFICATION',
    status: 'SENT',
    message: `Telemedicine link for appointment ${appointmentId} (${provider.toUpperCase()}): ${meetingUrl}`
  },
  {
    recipientType: 'PATIENT',
    recipientId: String(patientId),
    channel: 'APP_NOTIFICATION',
    status: 'SENT',
    message: `Telemedicine link for appointment ${appointmentId} (${provider.toUpperCase()}): ${meetingUrl}`
  }
];

const createTelemedicineSession = async ({ appointmentId, doctorId, patientId, provider }) => {
  const normalizedProvider = String(provider || 'jitsi').toLowerCase();

  if (!appointmentId || !doctorId || !patientId) {
    return {
      status: 400,
      payload: {
        message: 'appointmentId, doctorId, and patientId are required'
      }
    };
  }

  if (!['jitsi', 'agora', 'twilio'].includes(normalizedProvider)) {
    return {
      status: 400,
      payload: {
        message: "provider must be one of 'jitsi', 'agora', or 'twilio'"
      }
    };
  }

  const normalizedAppointmentId = String(appointmentId);
  const existing = await TelemedicineSession.findOne({ appointmentId: normalizedAppointmentId });
  if (existing) {
    return {
      status: 200,
      payload: {
        message: 'Session already exists for this appointment',
        data: existing
      }
    };
  }

  const roomName = `medicare_${normalizedAppointmentId}_${Date.now()}`;
  const meetingUrl = buildMeetingUrl(normalizedProvider, roomName);
  const deliveryLog = buildDeliveryLog({
    appointmentId: normalizedAppointmentId,
    doctorId,
    patientId,
    provider: normalizedProvider,
    meetingUrl
  });

  const created = await TelemedicineSession.create({
    appointmentId: normalizedAppointmentId,
    doctorId: String(doctorId),
    patientId: String(patientId),
    provider: normalizedProvider,
    roomName,
    meetingUrl,
    deliveryLog
  });

  return {
    status: 201,
    payload: {
      message: 'Meeting room generated and link sent to doctor + patient',
      data: created
    }
  };
};

// ── RabbitMQ consumer — auto-create session when appointment is approved ──
startConsumer(async (data) => {
  const { appointmentId, doctorId, patientId, provider } = data;
  console.log('[Consumer] appointment.approved received:', appointmentId);
  const result = await createTelemedicineSession({ appointmentId, doctorId, patientId, provider });
  console.log(`[Consumer] Session result (${result.status}):`, result.payload.message);
});

// ── API routes (protected by JWT) ─────────────────────────────────────────

app.post('/telemedicine/sessions', verifyToken, async (req, res) => {
  try {
    const { appointmentId, doctorId, patientId, provider } = req.body || {};

    const result = await createTelemedicineSession({
      appointmentId,
      doctorId,
      patientId,
      provider
    });

    return res.status(result.status).json(result.payload);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create session', error: error.message });
  }
});

app.get('/telemedicine/sessions/:appointmentId', verifyToken, async (req, res) => {
  try {
    const appointmentId = String(req.params.appointmentId);
    const session = await TelemedicineSession.findOne({ appointmentId });

    if (!session) {
      return res.status(404).json({ message: 'Session not found for this appointment' });
    }

    return res.json({ data: session });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch session', error: error.message });
  }
});

app.get('/telemedicine/sessions/:appointmentId/delivery-log', verifyToken, async (req, res) => {
  try {
    const appointmentId = String(req.params.appointmentId);
    const session = await TelemedicineSession.findOne({ appointmentId });

    if (!session) {
      return res.status(404).json({ message: 'Session not found for this appointment' });
    }

    return res.json({
      appointmentId,
      deliveryLog: Array.isArray(session.deliveryLog) ? session.deliveryLog : []
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch delivery log', error: error.message });
  }
});

app.post('/telemedicine/sessions/:appointmentId/end', verifyToken, async (req, res) => {
  try {
    const appointmentId = String(req.params.appointmentId);
    const session = await TelemedicineSession.findOneAndUpdate(
      { appointmentId },
      { status: 'ENDED' },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session not found for this appointment' });
    }

    return res.json({ message: 'Session ended', data: session });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to end session', error: error.message });
  }
});

// Legacy alias kept for backwards compatibility
app.post('/create-meeting', verifyToken, async (req, res) => {
  try {
    const { appointmentId, doctorId, patientId, provider } = req.body || {};
    const result = await createTelemedicineSession({
      appointmentId,
      doctorId,
      patientId,
      provider: provider || 'jitsi'
    });
    return res.status(result.status).json(result.payload);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create meeting', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Telemedicine Service running on port ${port}`);
});