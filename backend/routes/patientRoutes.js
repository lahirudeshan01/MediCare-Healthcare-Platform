const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const patientController = require('../controllers/patientController');

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/reports'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

//Patient Routes

// Create patient
router.post('/patients', patientController.createPatientDetails);

//Get ALL patients (this was missing)
router.get('/patients', patientController.getAllPatients);

//Get single patient by ID
router.get('/patients/:id', patientController.getPatientProfile);

//Update patient
router.put('/patients/:id', patientController.updatePatientProfile);

//Delete patient
router.delete('/patients/:id', patientController.deletePatientProfile);

//Upload medical report
router.post(
  '/patients/:id/upload-report',
  upload.single('reportFile'),
  patientController.uploadMedicalReport
);

//Get patient history
router.get('/patients/:id/history', patientController.getPatientHistory);

module.exports = router;