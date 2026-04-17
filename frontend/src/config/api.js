// API Gateway — all requests go through a single entry point
export const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || "http://localhost:3000";

// Service routes (proxied through gateway)
export const AUTH_SERVICE        = API_GATEWAY;
export const AI_SERVICE          = API_GATEWAY;
export const DOCTOR_SERVICE      = API_GATEWAY;   // /doctors, /appointments, /prescriptions
export const TELEMEDICINE_SERVICE = API_GATEWAY;  // /telemedicine

// Payment routes
const _PAYMENT_BASE = `${API_GATEWAY}/payments`;
export const PAYMENT_ROUTES = {
  base:    _PAYMENT_BASE,
  approve: (id) => `${_PAYMENT_BASE}/${id}/approve`,
  reject:  (id) => `${_PAYMENT_BASE}/${id}/reject`,
};
