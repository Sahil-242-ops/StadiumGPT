// StadiumGPT — Frontend utilities

/**
 * Generate a unique ID for messages or elements
 */
let _counter = 0;
export const uid = (prefix = 'id') => `${prefix}_${++_counter}_${Date.now()}`;

/**
 * Format crowd occupancy percentage for display
 */
export function formatOccupancy(pct: number): string {
  return `${Math.round(pct)}%`;
}

/**
 * Capitalise the first letter of a string
 */
export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a Date as a human-readable time string (HH:MM)
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}
