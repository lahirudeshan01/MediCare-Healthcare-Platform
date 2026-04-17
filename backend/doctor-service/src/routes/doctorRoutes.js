const express = require("express");
const router = express.Router();
const controller = require("../controllers/doctorController");
const verifyToken = require("../middleware/verifyToken");

// ── Doctor profile ─────────────────────────────────────
// Creating a doctor profile is called internally after registration
router.post("/doctors", verifyToken, controller.createDoctor);
router.get("/doctors/:id/availability", controller.getAvailability);        // public — patients browse
router.put("/doctors/:id/availability", verifyToken, controller.setAvailability);

// ── Appointments ───────────────────────────────────────
router.post("/appointments", verifyToken, controller.createAppointment);    // patient books
router.get("/appointments", verifyToken, controller.listAppointments);
router.post("/appointments/:id/accept", verifyToken, controller.acceptAppointment); // doctor accepts/rejects

// ── Prescriptions ──────────────────────────────────────
router.post("/prescriptions", verifyToken, controller.createPrescription);
router.get("/prescriptions", verifyToken, controller.listPrescriptions);
router.put("/prescriptions/:id", verifyToken, controller.updatePrescription);
router.delete("/prescriptions/:id", verifyToken, controller.deletePrescription);

module.exports = router;