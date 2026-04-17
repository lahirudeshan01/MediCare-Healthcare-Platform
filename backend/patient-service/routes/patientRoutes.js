const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const patientController = require("../controllers/patientController");

// Set up Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/reports"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// API Routes
router.get("/patients", patientController.getAllPatients);
router.post("/patients", patientController.createPatient);
router.get("/patients/:id", patientController.getPatientProfile);
router.put("/patients/:id", patientController.updatePatientProfile);
router.delete("/patients/:id", patientController.deletePatient);
router.post(
  "/patients/:id/upload-report",
  upload.single("reportFile"),
  patientController.uploadMedicalReport,
);
router.get("/patients/:id/reports", patientController.getPatientReports);
router.delete(
  "/patients/:id/reports/:reportId",
  patientController.deleteMedicalReport,
);
router.get("/patients/:id/history", patientController.getPatientHistory);

module.exports = router;
