const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3005";

const normalizeBaseUrl = (value) => value.replace(/\/$/, "");

exports.sendAppointmentNotification = async ({
  userId,
  appointmentId,
  type,
  title,
  message,
}) => {
  if (!userId || !title || !message) {
    return;
  }

  if (typeof fetch !== "function") {
    console.warn("Fetch is not available; skipping notification delivery.");
    return;
  }

  try {
    const response = await fetch(
      `${normalizeBaseUrl(NOTIFICATION_SERVICE_URL)}/notifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          appointmentId,
          type,
          title,
          message,
          source: "appointment-service",
        }),
      },
    );

    if (!response.ok) {
      console.warn("Notification service returned a non-success response.");
    }
  } catch (error) {
    console.error("Failed to send notification:", error.message);
  }
};
