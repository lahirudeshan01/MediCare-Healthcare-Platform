const express = require("express");
const router = express.Router();
const controller = require("../controllers/doctorController");
const verifyToken = require("../middleware/verifyToken");
const requireAdmin = require("../middleware/requireAdmin");

// ── Admin routes ────────────────────────────────────────
router.get("/doctors/admin/stats", requireAdmin, controller.getDoctorAdminStats);
router.get("/doctors/admin/pending", requireAdmin, controller.getPendingDoctors);
router.get("/doctors/admin/all", requireAdmin, controller.getAllDoctorsAdmin);
router.get("/doctors/admin/transactions", requireAdmin, controller.getTransactions);
router.patch("/doctors/admin/:id/verify", requireAdmin, controller.verifyDoctor);

// ── Doctor profile ─────────────────────────────────────
// Public: browse approved doctors (no auth required)
router.get("/doctors", controller.getVerifiedDoctors);

// Creating a doctor profile — also called by auth-service during verification (no token)
router.post("/doctors", controller.createDoctor);
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