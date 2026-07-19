// StadiumGPT — Express.js API entry point
import dotenv from "dotenv";
import path from "path";

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { rateLimitMiddleware } from "./middleware/rateLimit.js";
import { logger } from "./utils/index.js";
import { chatRouter } from "./routes/chat.js";
import { navigateRouter } from "./routes/navigate.js";
import { crowdRouter } from "./routes/crowd.js";
import { sosRouter } from "./routes/sos.js";
import { statsRouter } from "./routes/stats.js";
import { insightsRouter } from "./routes/insights.js";

const app = express();
const PORT = parseInt(
  process.env.BACKEND_PORT ?? process.env.PORT ?? "8080",
  10,
);
const APP_VERSION = process.env.APP_VERSION ?? "1.0.0";

// ── Security middleware ────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "*")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "100kb" }));

// ── Rate limiting ──────────────────────────────────────────────────────────
app.use("/api", rateLimitMiddleware);

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api", chatRouter);
app.use("/api", navigateRouter);
app.use("/api", crowdRouter);
app.use("/api", sosRouter);
app.use("/api", statsRouter);
app.use("/api", insightsRouter);

// ── Health check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "ok",
    version: APP_VERSION,
    gemini_available: geminiConfigured,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 catch-all ──────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error(err, "GlobalErrorHandler");
    res.status(500).json({ error: "Internal server error" });
  },
);

// ── Start ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, "0.0.0.0", () => {
    console.info(`⚽ StadiumGPT ${APP_VERSION} — listening on port ${PORT}`);
    console.info(
      `   Gemini: ${process.env.GEMINI_API_KEY ? "configured ✓" : "NOT configured ✗"}`,
    );
    console.info(`   CORS:   ${allowedOrigins.join(", ")}`);
  });
}

export default app;
