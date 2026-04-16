const Patient = require('../models/Patient');
const MedicalReport = require('../models/MedicalReport');
const PrescriptionReference = require('../models/PrescriptionReference');

// GET /patients
exports.getAllPatients = async (_req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /patients
exports.createPatient = async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json({ message: 'Patient created successfully', patient });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create patient', error: error.message });
  }
};

// GET /patients/{id}
exports.getPatientProfile = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /patients/{id}
exports.updatePatientProfile = async (req, res) => {
  try {
    const patientId = req.params.id;
    const updatedData = req.body;
    
    // Check if patient exists first or findByIdAndUpdate directly
    const patient = await Patient.findByIdAndUpdate(patientId, updatedData, {
      new: true, // return updated document
      runValidators: true
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.status(200).json({ message: 'Patient profile updated successfully', patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /patients/{id}
exports.deletePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findByIdAndDelete(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await Promise.all([
      MedicalReport.deleteMany({ patientId }),
      PrescriptionReference.deleteMany({ patientId })
    ]);

    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /patients/{id}/upload-report
exports.uploadMedicalReport = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const newReport = new MedicalReport({
      patientId: patientId,
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /patients/{id}/history
exports.getPatientHistory = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Fetch related reports and prescriptions
    const reports = await MedicalReport.find({ patientId }).sort({ createdAt: -1 });
    const prescriptions = await PrescriptionReference.find({ patientId }).sort({ dateIssued: -1 });
    
    const medicalHistory = {
      patientDetails: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        medicalHistoryNotes: patient.medicalHistoryNotes
      },
      reports: reports,
      prescriptions: prescriptions
    };
    
    res.status(200).json(medicalHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
