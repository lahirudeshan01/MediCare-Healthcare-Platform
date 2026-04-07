const Doctor = require("../models/Doctor");
const Availability = require("../models/Availability");
const Prescription = require("../models/Prescription");

// Register Doctor
exports.createDoctor = async (req, res) => {
  const doctor = new Doctor(req.body);
  await doctor.save();
  res.json(doctor);
};

// Set Availability
exports.setAvailability = async (req, res) => {
  const availability = new Availability({
    doctorId: req.params.id,
    date: req.body.date,
    slots: req.body.slots
  });
  await availability.save();
  res.json(availability);
};

// Accept Appointment
exports.acceptAppointment = async (req, res) => {
  // Normally call Appointment Service
  res.json({ message: "Appointment Accepted" });
};

// Issue Prescription
exports.createPrescription = async (req, res) => {
  const prescription = new Prescription(req.body);
  await prescription.save();
  res.json(prescription);
};