// StadiumGPT — Rate limiting middleware (sliding window per IP)
import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";
const maxRequests = isTest
  ? 10000
  : parseInt(process.env.RATE_LIMIT_REQUESTS ?? "30", 10);
const windowSecs = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS ?? "60", 10);

export const rateLimitMiddleware = rateLimit({
  windowMs: windowSecs * 1000,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests — please try again shortly.",
    retry_after_seconds: windowSecs,
  },
  keyGenerator: (req) =>
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.ip ??
    "unknown",
});
