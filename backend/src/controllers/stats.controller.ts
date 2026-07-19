// StadiumGPT — Stats controller
import { Request, Response } from "express";
import { logger } from "../utils/index.js";

/**
 * Deterministic pseudo-random generator seeded by an integer.
 *
 * @param seed The integer seed.
 * @returns A pseudo-random floating point number between 0 and 1.
 */
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

/**
 * Handles requests for live stadium statistics.
 * Generates deterministic live occupancy, parking status, and environmental savings.
 *
 * @param _req Express Request object.
 * @param res Express Response object.
 * @returns A promise resolving to void.
 */
export async function statsController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const now = new Date();
    const hour = now.getHours();
    const dayHourSeed = now.getDate() * 100 + hour; // changes once per hour
    const isMatchTime = hour >= 14 && hour <= 22;
    const base = isMatchTime ? 58431 : 12840;

    res.json({
      visitors_today: base + Math.floor(seededRand(dayHourSeed) * 500),
      avg_wait_minutes: isMatchTime
        ? 4 + Math.floor(seededRand(dayHourSeed + 1) * 3)
        : 1,
      parking_pct: isMatchTime
        ? 78 + Math.floor(seededRand(dayHourSeed + 2) * 15)
        : 25 + Math.floor(seededRand(dayHourSeed + 3) * 10),
      carbon_saved_tons: parseFloat(
        (12.8 + seededRand(dayHourSeed + 4) * 0.5).toFixed(1),
      ),
      water_saved_litres: 9500 + Math.floor(seededRand(dayHourSeed + 5) * 300),
      active_alerts: isMatchTime
        ? 2 + Math.floor(seededRand(dayHourSeed + 6) * 3)
        : 0,
      medical_incidents: isMatchTime
        ? Math.floor(seededRand(dayHourSeed + 7) * 4)
        : 0,
      food_queue_avg: isMatchTime
        ? 3 + Math.floor(seededRand(dayHourSeed + 8) * 5)
        : 0,
    });
  } catch (err) {
    logger.error(err, "statsController");
    res.status(500).json({
      error: "An unexpected error occurred while loading statistics.",
    });
  }
}
