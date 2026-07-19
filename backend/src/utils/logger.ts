// StadiumGPT — Structured Logger Utility

/**
 * A lightweight structured logging utility that formats log outputs
 * with timestamps and standard log levels.
 */
export const logger = {
  /**
   * Log an informational message.
   * @param message Main message to log.
   * @param args Additional metadata or objects to print.
   */
  info(message: string, ...args: unknown[]): void {
    console.log(`[${new Date().toISOString()}] [INFO] ${message}`, ...args);
  },

  /**
   * Log a warning message.
   * @param message Main warning message to log.
   * @param args Additional metadata or objects to print.
   */
  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, ...args);
  },

  /**
   * Log an error message.
   * @param err An Error object or string describing the error.
   * @param context Additional context or metadata about where the error happened.
   */
  error(err: unknown, context?: string): void {
    const errorPrefix = context ? `[CONTEXT: ${context}] ` : "";
    if (err instanceof Error) {
      console.error(
        `[${new Date().toISOString()}] [ERROR] ${errorPrefix}${err.message}`,
        err.stack ?? "",
      );
    } else {
      console.error(
        `[${new Date().toISOString()}] [ERROR] ${errorPrefix}${err}`,
      );
    }
  },
};
