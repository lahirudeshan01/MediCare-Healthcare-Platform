const express = require("express");
const router = express.Router();
const controller = require("../controllers/doctorController");

router.post("/doctors", controller.createDoctor);
router.get("/doctors/:id/availability", controller.getAvailability);
router.put("/doctors/:id/availability", controller.setAvailability);
router.post("/appointments", controller.createAppointment);
router.get("/appointments", controller.listAppointments);
router.post("/appointments/:id/accept", controller.acceptAppointment);
router.post("/prescriptions", controller.createPrescription);
router.get("/prescriptions", controller.listPrescriptions);
router.put("/prescriptions/:id", controller.updatePrescription);
router.delete("/prescriptions/:id", controller.deletePrescription);

module.exports = router;