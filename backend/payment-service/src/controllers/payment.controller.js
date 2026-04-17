const PaymentSlip = require("../models/PaymentSlip");

const APPOINTMENT_SERVICE_URL =
  process.env.APPOINTMENT_SERVICE_URL || "http://localhost:3003";

async function markAppointmentPaymentPending(appointmentId, paymentSlip) {
  const candidateUrls = [
    APPOINTMENT_SERVICE_URL,
    "http://localhost:3003",
    "http://appointment-service:3003",
  ];
  const uniqueCandidateUrls = [...new Set(candidateUrls)];
  const failures = [];

  for (const baseUrl of uniqueCandidateUrls) {
    try {
      const response = await fetch(
        `${baseUrl}/appointments/${appointmentId}/payment-pending`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentSlip }),
        },
      );

      if (!response.ok) {
        const body = await response.text();
        failures.push(`${baseUrl} -> ${response.status} ${body}`);
        continue;
      }

      return response.json();
    } catch (error) {
      failures.push(`${baseUrl} -> ${error.message}`);
    }
  }

  throw new Error(
    `Failed to update appointment payment status. Attempts: ${failures.join(" | ")}`,
  );
}

async function callAppointmentService(path, method = "PATCH", body = {}) {
  const candidateUrls = [
    APPOINTMENT_SERVICE_URL,
    "http://localhost:3003",
    "http://appointment-service:3003",
  ];
  const uniqueCandidateUrls = [...new Set(candidateUrls)];
  const failures = [];

  for (const baseUrl of uniqueCandidateUrls) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const responseText = await response.text();
        failures.push(`${baseUrl} -> ${response.status} ${responseText}`);
        continue;
      }

      return response.json();
    } catch (error) {
      failures.push(`${baseUrl} -> ${error.message}`);
    }
  }

  throw new Error(
    `Failed appointment service sync. Attempts: ${failures.join(" | ")}`,
  );
}

exports.uploadPaymentSlip = async (req, res) => {
  try {
    const { appointmentId, patientId, doctorId, amount, currency } = req.body;

    if (!appointmentId || !patientId) {
      return res.status(400).json({
        message: "appointmentId and patientId are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Payment slip image is required",
      });
    }

    const normalizedAmount = Number(amount || 0);
    const slipPublicUrl = `/payments/uploads/${req.file.filename}`;

    const paymentSlip = await PaymentSlip.create({
      appointmentId,
      patientId,
      doctorId,
      amount: Number.isNaN(normalizedAmount) ? 0 : normalizedAmount,
      currency: currency || "LKR",
      status: "PENDING",
      slip: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        storagePath: req.file.path,
        publicUrl: slipPublicUrl,
      },
    });

    let appointmentSync = { synced: true };
    try {
      await markAppointmentPaymentPending(appointmentId, {
        paymentId: paymentSlip._id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        publicUrl: slipPublicUrl,
        uploadedAt: paymentSlip.createdAt,
      });
    } catch (syncError) {
      appointmentSync = {
        synced: false,
        message: syncError.message,
      };
      console.error(
        "Payment slip saved but failed to sync appointment payment status:",
        syncError.message,
      );
    }

    return res.status(201).json({
      message: appointmentSync.synced
        ? "Payment slip uploaded. Appointment marked as pending."
        : "Payment slip uploaded, but appointment status sync failed.",
      payment: paymentSlip,
      appointmentSync,
    });
  } catch (error) {
    console.error("Error uploading payment slip:", error);
    return res.status(500).json({
      message: "Failed to upload payment slip",
      error: error.message,
    });
  }
};

exports.getPaymentsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const slips = await PaymentSlip.find({ appointmentId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(slips);
  } catch (error) {
    console.error("Error fetching payments by appointment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { appointmentId, patientId, doctorId, status } = req.query;
    const filter = {};

    if (appointmentId) {
      filter.appointmentId = appointmentId;
    }

    if (patientId) {
      filter.patientId = patientId;
    }

    if (doctorId) {
      filter.doctorId = doctorId;
    }

    if (status) {
      filter.status = String(status).toUpperCase();
    }

    const slips = await PaymentSlip.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(slips);
  } catch (error) {
    console.error("Error fetching all payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.approvePaymentSlip = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reviewedBy } = req.body;

    const paymentSlip = await PaymentSlip.findById(paymentId);

    if (!paymentSlip) {
      return res.status(404).json({ message: "Payment slip not found" });
    }

    paymentSlip.status = "APPROVED";
    paymentSlip.reviewedAt = new Date();
    paymentSlip.reviewedBy = reviewedBy || "admin";
    paymentSlip.rejectionReason = undefined;
    await paymentSlip.save();

    let appointmentSync = { synced: true };
    try {
      await callAppointmentService(
        `/appointments/${paymentSlip.appointmentId}/payment-approved`,
      );
    } catch (syncError) {
      appointmentSync = {
        synced: false,
        message: syncError.message,
      };
    }

    return res.status(200).json({
      message: "Payment approved",
      payment: paymentSlip,
      appointmentSync,
    });
  } catch (error) {
    console.error("Error approving payment slip:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.rejectPaymentSlip = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reviewedBy, reason } = req.body;

    const paymentSlip = await PaymentSlip.findById(paymentId);

    if (!paymentSlip) {
      return res.status(404).json({ message: "Payment slip not found" });
    }

    paymentSlip.status = "REJECTED";
    paymentSlip.reviewedAt = new Date();
    paymentSlip.reviewedBy = reviewedBy || "admin";
    paymentSlip.rejectionReason = reason || "Payment slip rejected by admin";
    await paymentSlip.save();

    let appointmentSync = { synced: true };
    try {
      await callAppointmentService(
        `/appointments/${paymentSlip.appointmentId}/payment-rejected`,
      );
    } catch (syncError) {
      appointmentSync = {
        synced: false,
        message: syncError.message,
      };
    }

    return res.status(200).json({
      message: "Payment rejected and booking cancelled",
      payment: paymentSlip,
      appointmentSync,
    });
  } catch (error) {
    console.error("Error rejecting payment slip:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
