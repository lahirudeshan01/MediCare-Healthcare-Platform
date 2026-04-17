const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005';

const normalizeBaseUrl = (value) => value.replace(/\/$/, '');

/**
 * Send a notification to the notification-service via HTTP.
 * Failures are logged but never bubble up to the caller.
 */
exports.sendNotification = async ({ userId, type = 'general', title, message, metadata = {} }) => {
  if (!userId || !title || !message) {
    return;
  }

  try {
    const response = await fetch(
      `${normalizeBaseUrl(NOTIFICATION_SERVICE_URL)}/notifications`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          title,
          message,
          source: 'patient-service',
          metadata,
        }),
      },
    );

    if (!response.ok) {
      console.warn('[patient-service] Notification service returned non-success response:', response.status);
    }
  } catch (error) {
    console.error('[patient-service] Failed to send notification:', error.message);
  }
};
