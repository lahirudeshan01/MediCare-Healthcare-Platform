const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const MedicalReport = require('../models/MedicalReport');
const PrescriptionReference = require('../models/PrescriptionReference');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

//CREATE PATIENT

// POST /patients
exports.createPatientDetails = async (req, res) => {
  try {
    const { name, age, gender, contactNumber, address, medicalHistoryNotes } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const patient = new Patient({
      name,
      age,
      gender,
      contactNumber,
      address,
      medicalHistoryNotes
    });

    await patient.save();

    res.status(201).json({
      message: 'Patient created successfully',
      patient
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

//GET ALL PATIENTS

// GET /patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Patients fetched successfully',
      count: patients.length,
      patients
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// GET SINGLE PATIENT//

// GET /patients/:id
exports.getPatientProfile = async (req, res) => {
  try {
    const patientId = req.params.id;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ message: 'Invalid patient ID' });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json(patient);

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// UPDATE PATIENT
  
// PUT /patients/:id
exports.updatePatientProfile = async (req, res) => {
  try {
    const patientId = req.params.id;
    const updatedData = req.body;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ message: 'Invalid patient ID' });
    }

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      updatedData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({
      message: 'Patient profile updated successfully',
      patient
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

//DELETE PATIENT

// DELETE /patients/:id
exports.deletePatientProfile = async (req, res) => {
  try {
    const patientId = req.params.id;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ message: 'Invalid patient ID' });
    }

    const patient = await Patient.findByIdAndDelete(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Delete related data
    await MedicalReport.deleteMany({ patientId });
    await PrescriptionReference.deleteMany({ patientId });

    res.status(200).json({
      message: 'Patient and related data deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

//UPLOAD MEDICAL REPORT

// POST /patients/:id/upload-report
exports.uploadMedicalReport = async (req, res) => {
  try {
    const patientId = req.params.id;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ message: 'Invalid patient ID' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newReport = new MedicalReport({
      patientId,
      reportTitle: req.body.title || 'Medical Report',
      filePath: `/uploads/reports/${req.file.filename}`,
      fileType: req.file.mimetype
    });

    await newReport.save();

    res.status(201).json({
      message: 'Medical report uploaded successfully',
      report: newReport
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

//GET PATIENT HISTORY

// GET /patients/:id/history
exports.getPatientHistory = async (req, res) => {
  try {
    const patientId = req.params.id;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ message: 'Invalid patient ID' });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const reports = await MedicalReport
      .find({ patientId })
      .sort({ createdAt: -1 });

    const prescriptions = await PrescriptionReference
      .find({ patientId })
      .sort({ dateIssued: -1 });

    res.status(200).json({
      patientDetails: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        medicalHistoryNotes: patient.medicalHistoryNotes
      },
      reports,
      prescriptions
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};