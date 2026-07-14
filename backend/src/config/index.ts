// StadiumGPT — Backend configuration
// Centralises all env-var reading with defaults and validation
import 'dotenv/config';

function required(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.warn(`[config] Warning: ${key} is not set`);
    return '';
  }
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function optionalInt(key: string, fallback: number): number {
  const val = process.env[key];
  if (!val) return fallback;
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
}

export const config = {
  // Server
  port:        optionalInt('PORT', 8080),
  nodeEnv:     optional('NODE_ENV', 'development'),
  appName:     optional('APP_NAME', 'StadiumGPT'),
  appVersion:  optional('APP_VERSION', '1.0.0'),
  debug:       optional('DEBUG', 'false') === 'true',

  // Gemini AI
  geminiApiKey: required('GEMINI_API_KEY'),
  geminiModel:  optional('GEMINI_MODEL', 'gemini-1.5-flash'),

  // Rate limiting
  rateLimitRequests:    optionalInt('RATE_LIMIT_REQUESTS', 30),
  rateLimitWindowSecs:  optionalInt('RATE_LIMIT_WINDOW_SECONDS', 60),

  // CORS
  allowedOrigins: optional('ALLOWED_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  // Data
  dataDir: optional('DATA_DIR', './src/data'),

  get isProduction() { return this.nodeEnv === 'production'; },
  get isDevelopment() { return this.nodeEnv === 'development'; },
} as const;
