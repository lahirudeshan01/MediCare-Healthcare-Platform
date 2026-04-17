// API Gateway — all requests go through a single entry point
export const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || "http://localhost:3000";

// Service routes (proxied through gateway)
export const AUTH_SERVICE = API_GATEWAY;
export const AI_SERVICE = API_GATEWAY;
export const APPOINTMENT_SERVICE = API_GATEWAY;
export const DOCTOR_SERVICE = API_GATEWAY;      // /doctors, /appointments, /prescriptions
export const TELEMEDICINE_SERVICE = API_GATEWAY; // /telemedicine

export const APPOINTMENT_ROUTES = {
  base: `${APPOINTMENT_SERVICE}/appointments`,
  byPatient: (patientId) =>
    `${APPOINTMENT_SERVICE}/appointments?patientId=${encodeURIComponent(patientId)}`,
  cancel: (appointmentId) =>
    `${APPOINTMENT_SERVICE}/appointments/${encodeURIComponent(appointmentId)}/cancel`,
};

export const NOTIFICATION_SERVICE = API_GATEWAY;
export const NOTIFICATION_ROUTES = {
  base: `${NOTIFICATION_SERVICE}/notifications`,
  byUser: (userId) =>
    `${NOTIFICATION_SERVICE}/notifications?userId=${encodeURIComponent(userId)}`,
  unreadCount: (userId) =>
    `${NOTIFICATION_SERVICE}/notifications/unread-count?userId=${encodeURIComponent(userId)}`,
  markRead: (notificationId) =>
    `${NOTIFICATION_SERVICE}/notifications/${encodeURIComponent(notificationId)}/read`,
  markAllRead: `${NOTIFICATION_SERVICE}/notifications/mark-all-read`,
};

export const PAYMENT_SERVICE = API_GATEWAY;
export const PAYMENT_ROUTES = {
  base: `${PAYMENT_SERVICE}/payments`,
  slips: `${PAYMENT_SERVICE}/payments/slips`,
  byAppointment: (appointmentId) =>
    `${PAYMENT_SERVICE}/payments/appointments/${encodeURIComponent(appointmentId)}`,
  approve: (paymentId) =>
    `${PAYMENT_SERVICE}/payments/${encodeURIComponent(paymentId)}/approve`,
  reject: (paymentId) =>
    `${PAYMENT_SERVICE}/payments/${encodeURIComponent(paymentId)}/reject`,
};

export const PATIENT_SERVICE = API_GATEWAY;
export const PATIENT_ROUTES = {
  base: `${PATIENT_SERVICE}/patients`,
  byId: (patientId) =>
    `${PATIENT_SERVICE}/patients/${encodeURIComponent(patientId)}`,
  reports: (patientId) =>
    `${PATIENT_SERVICE}/patients/${encodeURIComponent(patientId)}/reports`,
  uploadReport: (patientId) =>
    `${PATIENT_SERVICE}/patients/${encodeURIComponent(patientId)}/upload-report`,
  deleteReport: (patientId, reportId) =>
    `${PATIENT_SERVICE}/patients/${encodeURIComponent(patientId)}/reports/${encodeURIComponent(reportId)}`,
};
