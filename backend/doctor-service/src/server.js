require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = Number(process.env.PORT || 8083);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'doctor-service', status: 'ok' });
});

app.post('/doctors', (req, res) => {
  const { fullName, email, specialty, qualifications = '', experienceYears = 0 } = req.body;

  if (!fullName || !email || !specialty) {
    return res.status(400).json({
      message: 'fullName, email, and specialty are required'
    });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO doctors (full_name, email, specialty, qualifications, experience_years)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(fullName, email, specialty, qualifications, Number(experienceYears) || 0);
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({ message: 'Doctor registered', data: doctor });
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ message: 'Doctor email already exists' });
    }

    return res.status(500).json({ message: 'Failed to create doctor', error: error.message });
  }
});

app.put('/doctors/:id/availability', (req, res) => {
  const doctorId = Number(req.params.id);
  const { slots } = req.body;

  if (!doctorId || !Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({
      message: 'doctor id and at least one slot are required'
    });
  }

  const doctor = db.prepare('SELECT id FROM doctors WHERE id = ?').get(doctorId);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const insertSlot = db.prepare(`
    INSERT INTO availability_slots (doctor_id, day_of_week, start_time, end_time, is_available)
    VALUES (?, ?, ?, ?, ?)
  `);

  const deleteSlots = db.prepare('DELETE FROM availability_slots WHERE doctor_id = ?');

  const tx = db.transaction((incomingSlots) => {
    deleteSlots.run(doctorId);

    for (const slot of incomingSlots) {
      if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
        throw new Error('Each slot needs dayOfWeek, startTime, endTime');
      }
      insertSlot.run(
        doctorId,
        slot.dayOfWeek,
        slot.startTime,
        slot.endTime,
        slot.isAvailable === false ? 0 : 1
      );
    }
  });

  try {
    tx(slots);
    const updatedSlots = db
      .prepare('SELECT * FROM availability_slots WHERE doctor_id = ? ORDER BY day_of_week, start_time')
      .all(doctorId);

    return res.json({ message: 'Availability updated', data: updatedSlots });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.post('/appointments/:id/accept', (req, res) => {
  const appointmentId = Number(req.params.id);
  const { doctorId, patientId = null, action = 'accept' } = req.body;

  if (!appointmentId || !doctorId) {
    return res.status(400).json({ message: 'appointment id and doctorId are required' });
  }

  const doctor = db.prepare('SELECT id FROM doctors WHERE id = ?').get(Number(doctorId));
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const normalizedAction = String(action).toLowerCase();
  if (!['accept', 'reject'].includes(normalizedAction)) {
    return res.status(400).json({ message: "action must be 'accept' or 'reject'" });
  }

  const status = normalizedAction === 'accept' ? 'ACCEPTED' : 'REJECTED';

  db.prepare(`
    INSERT INTO appointments (id, doctor_id, patient_id, status)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      doctor_id = excluded.doctor_id,
      patient_id = excluded.patient_id,
      status = excluded.status,
      decided_at = datetime('now')
  `).run(appointmentId, Number(doctorId), patientId ? Number(patientId) : null, status);

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
  return res.json({ message: `Appointment ${status.toLowerCase()}`, data: appointment });
});

app.post('/prescriptions', (req, res) => {
  const {
    appointmentId,
    doctorId,
    patientId,
    diagnosis = '',
    medication,
    dosage,
    instructions = ''
  } = req.body;

  if (!appointmentId || !doctorId || !patientId || !medication || !dosage) {
    return res.status(400).json({
      message: 'appointmentId, doctorId, patientId, medication, and dosage are required'
    });
  }

  const doctor = db.prepare('SELECT id FROM doctors WHERE id = ?').get(Number(doctorId));
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const result = db.prepare(`
    INSERT INTO prescriptions
      (appointment_id, doctor_id, patient_id, diagnosis, medication, dosage, instructions)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    Number(appointmentId),
    Number(doctorId),
    Number(patientId),
    diagnosis,
    medication,
    dosage,
    instructions
  );

  const prescription = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json({ message: 'Prescription issued', data: prescription });
});

app.listen(port, () => {
  console.log(`doctor-service running on port ${port}`);
});
