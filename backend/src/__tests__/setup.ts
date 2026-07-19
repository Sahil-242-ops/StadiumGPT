// StadiumGPT — Jest global setup file
// Sets NODE_ENV=test before any module is loaded so rate limiter uses test limits.
process.env.NODE_ENV = "test";
process.env.RATE_LIMIT_REQUESTS = "10000";
