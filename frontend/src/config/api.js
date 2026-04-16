// API Gateway — all requests go through a single entry point
export const API_GATEWAY = "http://localhost:3000";

// Service routes (proxied through gateway)
export const AUTH_SERVICE = API_GATEWAY;
export const AI_SERVICE = API_GATEWAY;

// Future services (same gateway, different route prefixes)
// export const APPOINTMENT_SERVICE = API_GATEWAY;
// export const DOCTOR_SERVICE = API_GATEWAY;
// export const NOTIFICATION_SERVICE = API_GATEWAY;
