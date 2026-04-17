const Doctor = require("../models/Doctor");
const Availability = require("../models/Availability");
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const { publishAppointmentApproved } = require("../rabbitmq");

const DEFAULT_AVAILABILITY_SLOTS = [
  { day: "Mon", block: "9:00 AM - 12:00 PM", isAvailable: true },
  { day: "Mon", block: "12:00 PM - 2:00 PM", isAvailable: false },
  { day: "Mon", block: "2:00 PM - 5:00 PM", isAvailable: true },
  { day: "Tue", block: "9:00 AM - 12:00 PM", isAvailable: true },
  { day: "Tue", block: "12:00 PM - 2:00 PM", isAvailable: false },
  { day: "Tue", block: "2:00 PM - 5:00 PM", isAvailable: true },
  { day: "Wed", block: "9:00 AM - 12:00 PM", isAvailable: true },
  { day: "Wed", block: "12:00 PM - 2:00 PM", isAvailable: false },
  { day: "Wed", block: "2:00 PM - 5:00 PM", isAvailable: true },
  { day: "Thu", block: "9:00 AM - 12:00 PM", isAvailable: true },
  { day: "Thu", block: "12:00 PM - 2:00 PM", isAvailable: false },
  { day: "Thu", block: "2:00 PM - 5:00 PM", isAvailable: true },
  { day: "Fri", block: "9:00 AM - 12:00 PM", isAvailable: true },
  { day: "Fri", block: "12:00 PM - 2:00 PM", isAvailable: false },
  { day: "Fri", block: "2:00 PM - 5:00 PM", isAvailable: true }
];

// Public: list approved/verified doctors for patient browse
exports.getVerifiedDoctors = async (req, res) => {
  try {
    const filter = { verificationStatus: 'approved' };
    if (req.query.specialization) {
      filter.specialization = { $regex: req.query.specialization, $options: 'i' };
    }
    const doctors = await Doctor.find(filter)
      .select('name specialization consultationFee verified')
      .sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: err.message });
  }
};

// Register Doctor
exports.createDoctor = async (req, res) => {
  const doctor = new Doctor(req.body);
  await doctor.save();
  res.json(doctor);
};

// Set Availability
exports.setAvailability = async (req, res) => {
  try {
    const slots = Array.isArray(req.body.slots) ? req.body.slots : null;

    if (!slots) {
      return res.status(400).json({ message: "slots array is required" });
    }

    const sanitizedSlots = slots.map((slot) => ({
      day: String(slot.day || "").trim(),
      block: String(slot.block || "").trim(),
      isAvailable: Boolean(slot.isAvailable)
    }));

    const hasInvalidSlot = sanitizedSlots.some((slot) => !slot.day || !slot.block);
    if (hasInvalidSlot) {
      return res.status(400).json({ message: "Each slot must include day and block" });
    }

    const availability = await Availability.findOneAndUpdate(
      { doctorId: String(req.params.id) },
      {
        doctorId: String(req.params.id),
        slots: sanitizedSlots
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json(availability);
  } catch (error) {
    return res.status(500).json({ message: "Failed to save availability" });
  }
};

// Get Availability
exports.getAvailability = async (req, res) => {
  try {
    const doctorId = String(req.params.id);
    const availability = await Availability.findOne({ doctorId });

    if (!availability) {
      return res.json({
        doctorId,
        slots: DEFAULT_AVAILABILITY_SLOTS
      });
    }

    return res.json(availability);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch availability" });
  }
};

// Create Appointment Request
exports.createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      patientName,
      reason,
      appointmentDate,
      appointmentTime,
      consultType
    } = req.body;

    if (!doctorId || !patientName || !reason || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message:
          "doctorId, patientName, reason, appointmentDate and appointmentTime are required"
      });
    }

    const appointment = new Appointment({
      doctorId: String(doctorId),
      patientId,
      patientName,
      reason,
      appointmentDate,
      appointmentTime,
      consultType: consultType || "video"
    });

    await appointment.save();
    return res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create appointment request" });
  }
};

// List Appointments
exports.listAppointments = async (req, res) => {
  try {
    const filter = {};

    if (req.query.doctorId) {
      filter.doctorId = String(req.query.doctorId);
    }

    if (req.query.patientId) {
      filter.patientId = String(req.query.patientId);
    }

    if (req.query.status) {
      filter.status = String(req.query.status);
    }

    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

// Accept or Reject Appointment
exports.acceptAppointment = async (req, res) => {
  try {
    const action = String(req.body.action || "").toLowerCase();
    const status = action === "reject" ? "rejected" : action === "accept" ? "approved" : null;

    if (!status) {
      return res.status(400).json({ message: "action must be 'accept' or 'reject'" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Publish RabbitMQ event so telemedicine-service auto-creates a meeting room
    if (status === "approved" && appointment.consultType === "video") {
      publishAppointmentApproved({
        appointmentId: String(appointment._id),
        doctorId: appointment.doctorId,
        patientId: appointment.patientId || "",
        provider: "jitsi"
      });
    }

    return res.json({
      message: status === "approved" ? "Appointment approved" : "Appointment rejected",
      appointment
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update appointment" });
  }
};

// Issue Prescription
exports.createPrescription = async (req, res) => {
  try {
    const { doctorId, patientName, diagnosis } = req.body;

    if (!doctorId || !patientName || !diagnosis) {
      return res.status(400).json({
        message: "doctorId, patientName and diagnosis are required"
      });
    }

    const prescription = new Prescription(req.body);
    await prescription.save();
    return res.status(201).json(prescription);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create prescription" });
  }
};

// List Prescriptions
exports.listPrescriptions = async (req, res) => {
  try {
    const filter = {};

    if (req.query.doctorId) {
      filter.doctorId = String(req.query.doctorId);
    }

    const prescriptions = await Prescription.find(filter).sort({ date: -1 });
    return res.json(prescriptions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch prescriptions" });
  }
};

// Update Prescription
exports.updatePrescription = async (req, res) => {
  try {
    const { patientName, diagnosis } = req.body;

    if (!patientName || !diagnosis) {
      return res.status(400).json({
        message: "patientName and diagnosis are required"
      });
    }

    const updated = await Prescription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update prescription" });
  }
};

// Delete Prescription
exports.deletePrescription = async (req, res) => {
  try {
    const deleted = await Prescription.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    return res.json({ message: "Prescription deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete prescription" });
  }
};

// ── Admin functions ────────────────────────────────────────────────────────

// Admin: get all unverified doctors
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ verificationStatus: 'pending' }).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending doctors", error: err.message });
  }
};

// Admin: approve or reject a doctor
exports.verifyDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "action must be 'approve' or 'reject'" });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      {
        verificationStatus: action === 'approve' ? 'approved' : 'rejected',
        verified: action === 'approve',
      },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Failed to update verification", error: err.message });
  }
};

// Admin: get all doctors
exports.getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch doctors", error: err.message });
  }
};

// Admin: platform stats from doctor-service
exports.getDoctorAdminStats = async (req, res) => {
  try {
    const [
      totalDoctors, verifiedDoctors, pendingDoctors, rejectedDoctors,
      totalAppointments, approvedAppointments
    ] = await Promise.all([
      Doctor.countDocuments(),
      Doctor.countDocuments({ verificationStatus: 'approved' }),
      Doctor.countDocuments({ verificationStatus: 'pending' }),
      Doctor.countDocuments({ verificationStatus: 'rejected' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'approved' }),
    ]);

    const revenueResult = await Appointment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$fee' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      totalDoctors, verifiedDoctors, pendingDoctors, rejectedDoctors,
      totalAppointments, approvedAppointments, totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
};

// Admin: get approved appointments as financial transactions
exports.getTransactions = async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(100);

    const transactions = await Promise.all(appointments.map(async (apt) => {
      const doctor = await Doctor.findById(apt.doctorId).select('name specialization consultationFee');
      return {
        id: apt._id,
        patientName: apt.patientName,
        doctorName: doctor?.name || 'Unknown Doctor',
        specialization: doctor?.specialization || '',
        consultType: apt.consultType,
        date: apt.appointmentDate,
        fee: apt.fee || doctor?.consultationFee || 2000,
        createdAt: apt.createdAt,
      };
    }));

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
};