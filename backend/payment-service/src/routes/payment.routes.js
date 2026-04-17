const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

const uploadsDir = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeOriginalName}`);
  },
});

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, or WEBP images are allowed"));
    }
    return cb(null, true);
  },
});

// Health check -> GET /payments/health
router.get("/health", (_req, res) => res.json({ status: "ok", service: "payment-service" }));

router.post(
  "/slips",
  upload.single("slip"),
  paymentController.uploadPaymentSlip,
);
router.get("/", paymentController.getAllPayments);
router.patch("/:paymentId/approve", paymentController.approvePaymentSlip);
router.patch("/:paymentId/reject", paymentController.rejectPaymentSlip);
router.get(
  "/appointments/:appointmentId",
  paymentController.getPaymentsByAppointment,
);

module.exports = router;
