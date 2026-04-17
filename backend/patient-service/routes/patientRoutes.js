const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const patientController = require("../controllers/patientController");
const verifyToken = require("../middleware/verifyToken");

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
router.get("/patients", verifyToken, patientController.getAllPatients);
router.post("/patients", verifyToken, patientController.createPatient);
router.get("/patients/:id", verifyToken, patientController.getPatientProfile);
router.put("/patients/:id", verifyToken, patientController.updatePatientProfile);
router.delete("/patients/:id", verifyToken, patientController.deletePatient);
router.post(
  "/patients/:id/upload-report",
  verifyToken,
  upload.single("reportFile"),
  patientController.uploadMedicalReport,
);
router.get("/patients/:id/reports", verifyToken, patientController.getPatientReports);
router.delete(
  "/patients/:id/reports/:reportId",
  verifyToken,
  patientController.deleteMedicalReport,
);
router.get("/patients/:id/history", verifyToken, patientController.getPatientHistory);

module.exports = router;
