// const Appointment = require("../models/Appointment");
// const { publishEvent } = require("../services/rabbitmq.service");
// const { broadcastStatusUpdate } = require("../services/socket.service");

// // GET /appointments
// exports.getAllAppointments = async (req, res) => {
//   try {
//     const appointments = await Appointment.find().sort({ createdAt: -1 });
//     res.status(200).json(appointments);
//   } catch (error) {
//     console.error("Error getting all appointments:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // GET /appointments/search?specialty=cardiology
// exports.searchAppointments = async (req, res) => {
//   try {
//     const { specialty } = req.query;
//     if (!specialty) {
//       return res
//         .status(400)
//         .json({ message: "Specialty is required for search" });
//     }

//     // Find appointments that match the specialty.
//     // In a real app, this might query a Doctor service or check available slots.
//     // For now, we return existing appointments (or available mocked ones) with that specialty.
//     const appointments = await Appointment.find({
//       specialty,
//       status: { $ne: "CANCELLED" },
//     });
//     res.status(200).json(appointments);
//   } catch (error) {
//     console.error("Error searching appointments:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // POST /appointments
// exports.bookAppointment = async (req, res) => {
//   try {
//     const { doctorId, patientId, specialty, date, timeSlot } = req.body;

//     // 1. Check availability
//     const existingBooking = await Appointment.findOne({
//       doctorId,
//       date,
//       timeSlot,
//       status: { $ne: "CANCELLED" },
//     });
//     if (existingBooking) {
//       return res.status(409).json({ message: "Time slot is not available" });
//     }

//     // 2. Lock slot (create with LOCKED status initially, but let's assume CONFIRMED for simplicity if payment is synchronous,
//     // or LOCKED to hold it while payment processes asynchronously).
//     const appointment = new Appointment({
//       doctorId,
//       patientId,
//       specialty,
//       date,
//       timeSlot,
//       status: "LOCKED",
//     });
//     await appointment.save();

//     // 3. Publish Events
//     const eventPayload = {
//       appointmentId: appointment._id,
//       doctorId,
//       patientId,
//       status: appointment.status,
//       date,
//       timeSlot,
//     };

//     // Publish event to Notification service
//     await publishEvent("appointment.notification", eventPayload);

//     // Publish event to Payment service
//     await publishEvent("appointment.payment", eventPayload);

//     res.status(201).json(appointment);
//   } catch (error) {
//     console.error("Error booking appointment:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // PUT /appointments/{id}/cancel
// exports.cancelAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const appointment = await Appointment.findById(id);

//     if (!appointment) {
//       return res.status(404).json({ message: "Appointment not found" });
//     }

//     if (appointment.status === "CANCELLED") {
//       return res
//         .status(400)
//         .json({ message: "Appointment is already cancelled" });
//     }

//     appointment.status = "CANCELLED";
//     await appointment.save();

//     // Publish cancel event
//     await publishEvent("appointment.cancelled", {
//       appointmentId: appointment._id,
//     });

//     // Send real-time status update
//     broadcastStatusUpdate(appointment._id, "CANCELLED");

//     res.status(200).json(appointment);
//   } catch (error) {
//     console.error("Error cancelling appointment:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // GET /appointments/{id}
// exports.getAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const appointment = await Appointment.findById(id);

//     if (!appointment) {
//       return res.status(404).json({ message: "Appointment not found" });
//     }

//     res.status(200).json(appointment);
//   } catch (error) {
//     console.error("Error getting appointment:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const Appointment = require("../models/Appointment");
const {
  sendAppointmentNotification,
} = require("../services/notification.service");

// GET /appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    const filter = {};

    if (patientId) {
      filter.patientId = patientId;
    }

    if (doctorId) {
      filter.doctorId = doctorId;
    }

    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error getting all appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /appointments/search?specialty=cardiology
exports.searchAppointments = async (req, res) => {
  try {
    const { specialty } = req.query;

    if (!specialty) {
      return res.status(400).json({
        message: "Specialty is required for search",
      });
    }

    const appointments = await Appointment.find({
      specialty,
      status: { $ne: "CANCELLED" },
    });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error searching appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /appointments
exports.bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      specialty,
      date,
      timeSlot,
      consultType,
      paymentMode,
      paymentReference,
    } = req.body;
    const normalizedConsultType =
      typeof consultType === "string" ? consultType.trim().toLowerCase() : "";
    const normalizedPaymentMode =
      typeof paymentMode === "string" ? paymentMode.trim().toLowerCase() : "";

    // Basic validation
    if (
      !doctorId ||
      !patientId ||
      !specialty ||
      !date ||
      !timeSlot ||
      !normalizedConsultType
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!["video", "in-person"].includes(normalizedConsultType)) {
      return res.status(400).json({
        message: "consultType must be either video or in-person",
      });
    }

    // Check availability
    const existingBooking = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $ne: "CANCELLED" },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "Time slot is not available",
      });
    }

    // Create appointment (directly CONFIRMED since no async flow)
    const isBankSlipPayment = normalizedPaymentMode === "bank-slip";

    const appointment = new Appointment({
      doctorId,
      patientId,
      specialty,
      date,
      timeSlot,
      consultType: normalizedConsultType,
      status: "CONFIRMED",
      paymentStatus: isBankSlipPayment ? "PENDING" : "UNPAID",
      paymentSlip:
        isBankSlipPayment && paymentReference
          ? {
              originalName: paymentReference,
              uploadedAt: new Date(),
            }
          : undefined,
    });

    await appointment.save();

    await sendAppointmentNotification({
      userId: patientId,
      appointmentId: appointment._id,
      type: "appointment-booked",
      title: "Appointment booked",
      message: `Your ${normalizedConsultType} appointment for ${date} at ${timeSlot} has been confirmed.`,
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// PATCH /appointments/:id/payment-pending
exports.markPaymentPending = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentSlip } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        message: "Cannot upload payment for a cancelled appointment",
      });
    }

    appointment.paymentStatus = "PENDING";
    appointment.status = "CONFIRMED";

    if (paymentSlip && typeof paymentSlip === "object") {
      appointment.paymentSlip = {
        paymentId: paymentSlip.paymentId,
        fileName: paymentSlip.fileName,
        originalName: paymentSlip.originalName,
        mimeType: paymentSlip.mimeType,
        size: paymentSlip.size,
        publicUrl: paymentSlip.publicUrl,
        uploadedAt: paymentSlip.uploadedAt || new Date(),
      };
    }

    await appointment.save();

    return res.status(200).json({
      message: "Appointment marked as payment pending",
      appointment,
    });
  } catch (error) {
    console.error("Error marking appointment payment as pending:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /appointments/:id/payment-approved
exports.markPaymentApproved = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        message: "Cannot approve payment for a cancelled appointment",
      });
    }

    appointment.paymentStatus = "PAID";
    appointment.status = "CONFIRMED";
    await appointment.save();

    return res.status(200).json({
      message: "Appointment payment verified",
      appointment,
    });
  } catch (error) {
    console.error("Error marking appointment payment as approved:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /appointments/:id/payment-rejected
exports.rejectPaymentAndCancel = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    appointment.paymentStatus = "REJECTED";
    appointment.status = "CANCELLED";
    await appointment.save();

    await sendAppointmentNotification({
      userId: appointment.patientId,
      appointmentId: appointment._id,
      type: "payment-rejected",
      title: "Payment rejected",
      message: `Your payment for the appointment on ${appointment.date} at ${appointment.timeSlot} was rejected and the booking was cancelled.`,
    });

    return res.status(200).json({
      message: "Payment rejected and appointment cancelled",
      appointment,
    });
  } catch (error) {
    console.error("Error rejecting payment and cancelling appointment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /appointments/:id/cancel
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        message: "Appointment already cancelled",
      });
    }

    appointment.status = "CANCELLED";
    await appointment.save();

    await sendAppointmentNotification({
      userId: appointment.patientId,
      appointmentId: appointment._id,
      type: "appointment-cancelled",
      title: "Appointment cancelled",
      message: `Your appointment for ${appointment.date} at ${appointment.timeSlot} has been cancelled.`,
    });

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /appointments/:id
exports.getAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error getting appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
