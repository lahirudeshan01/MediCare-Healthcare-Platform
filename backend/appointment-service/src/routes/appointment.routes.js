const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");

// Search doctor by specialty -> GET /appointments/search?specialty=cardiology
// Place the /search route before /:id so it doesn't get caught as an ID
router.get("/search", appointmentController.searchAppointments);

// Get all appointments -> GET /appointments
router.get("/", appointmentController.getAllAppointments);

// Book appointment -> POST /appointments
router.post("/", appointmentController.bookAppointment);

// Doctor accept/reject -> POST /appointments/{id}/accept
router.post("/:id/accept", appointmentController.acceptOrRejectAppointment);

// Cancel appointment -> PUT /appointments/{id}/cancel
router.put("/:id/cancel", appointmentController.cancelAppointment);

// Mark appointment payment as pending -> PATCH /appointments/{id}/payment-pending
router.patch("/:id/payment-pending", appointmentController.markPaymentPending);

// Mark appointment payment as approved -> PATCH /appointments/{id}/payment-approved
router.patch(
  "/:id/payment-approved",
  appointmentController.markPaymentApproved,
);

// Reject appointment payment and cancel booking -> PATCH /appointments/{id}/payment-rejected
router.patch(
  "/:id/payment-rejected",
  appointmentController.rejectPaymentAndCancel,
);

// Health check -> GET /appointments/health
router.get("/health", (_req, res) => res.json({ status: "ok", service: "appointment-service" }));

// Get appointment -> GET /appointments/{id}
router.get("/:id", appointmentController.getAppointment);

module.exports = router;
