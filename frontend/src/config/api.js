// API Gateway — all requests go through a single entry point
export const API_GATEWAY = "http://localhost:3000";

// Service routes (proxied through gateway)
export const AUTH_SERVICE = API_GATEWAY;
export const AI_SERVICE = API_GATEWAY;
export const APPOINTMENT_SERVICE = API_GATEWAY;
export const APPOINTMENT_ROUTES = {
  base: `${APPOINTMENT_SERVICE}/appointments`,
  byPatient: (patientId) =>
    `${APPOINTMENT_SERVICE}/appointments?patientId=${encodeURIComponent(patientId)}`,
  cancel: (appointmentId) =>
    `${APPOINTMENT_SERVICE}/appointments/${encodeURIComponent(appointmentId)}/cancel`,
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

// Future services (same gateway, different route prefixes)
// export const DOCTOR_SERVICE = API_GATEWAY;
// export const NOTIFICATION_SERVICE = API_GATEWAY;
