const express = require("express");
const router = express.Router();
const controller = require("../controllers/doctorController");

router.post("/doctors", controller.createDoctor);
router.put("/doctors/:id/availability", controller.setAvailability);
router.post("/appointments/:id/accept", controller.acceptAppointment);
router.post("/prescriptions", controller.createPrescription);

module.exports = router;