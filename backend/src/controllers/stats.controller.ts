// StadiumGPT — Stats controller
import { Request, Response } from 'express';

/** Deterministic pseudo-random seeded by integer seed (0–1 exclusive). */
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

/**
 * GET /api/stats
 * Returns live-simulated stadium statistics.
 * Values are deterministic per hour-bucket so they are stable within a request window.
 */
export async function statsController(_req: Request, res: Response): Promise<void> {
  const now = new Date();
  const hour = now.getHours();
  const dayHourSeed = now.getDate() * 100 + hour; // changes once per hour
  const isMatchTime = hour >= 14 && hour <= 22;
  const base = isMatchTime ? 58431 : 12840;

  res.json({
    visitors_today:    base + Math.floor(seededRand(dayHourSeed) * 500),
    avg_wait_minutes:  isMatchTime ? 4 + Math.floor(seededRand(dayHourSeed + 1) * 3) : 1,
    parking_pct:       isMatchTime
                         ? 78 + Math.floor(seededRand(dayHourSeed + 2) * 15)
                         : 25 + Math.floor(seededRand(dayHourSeed + 3) * 10),
    carbon_saved_tons: parseFloat((12.8 + seededRand(dayHourSeed + 4) * 0.5).toFixed(1)),
    water_saved_litres:9500 + Math.floor(seededRand(dayHourSeed + 5) * 300),
    active_alerts:     isMatchTime ? 2 + Math.floor(seededRand(dayHourSeed + 6) * 3) : 0,
    medical_incidents: isMatchTime ? Math.floor(seededRand(dayHourSeed + 7) * 4) : 0,
    food_queue_avg:    isMatchTime ? 3 + Math.floor(seededRand(dayHourSeed + 8) * 5) : 0,
  });
}
