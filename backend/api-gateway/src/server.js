const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();

// ── CORS ────────────────────────────────────────────────
app.use(cors());

// ── Rate Limiting ───────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ── Service Registry ────────────────────────────────────
// Add new services here as team members merge their work.
// Each entry: route prefix → target service URL
const services = {
  "/auth": process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  "/ai": process.env.AI_SYMPTOM_SERVICE_URL || "http://localhost:3002",
  "/appointments":
    process.env.APPOINTMENT_SERVICE_URL || "http://localhost:3003",
  "/payments": process.env.PAYMENT_SERVICE_URL || "http://localhost:3004",
  "/notifications":
    process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3005",

  // ── Future services (uncomment when ready) ────────────
  // '/doctors':      process.env.DOCTOR_SERVICE_URL      || 'http://localhost:3004',
};

// ── Health Check ────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    routes: Object.keys(services),
  });
});

// ── Proxy Routes ────────────────────────────────────────
for (const [route, target] of Object.entries(services)) {
  app.use(
    route,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      // Preserve the full path (e.g. /auth/login → /auth/login, not /login)
      pathRewrite: (path, req) => route + path,
      // Log proxied requests
      on: {
        proxyReq: (proxyReq, req) => {
          console.log(
            `[GATEWAY] ${req.method} ${req.originalUrl} → ${target}${route}${req.url}`,
          );
        },
        error: (err, req, res) => {
          console.error(
            `[GATEWAY] Proxy error for ${req.originalUrl}:`,
            err.message,
          );
          res
            .status(502)
            .json({ message: "Service unavailable.", service: route });
        },
      },
    }),
  );
}

// ── 404 for unmatched routes ────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.originalUrl} not found on gateway.` });
});

// ── Start ───────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log("Registered routes:");
  for (const [route, target] of Object.entries(services)) {
    console.log(`  ${route} → ${target}`);
  }
});
