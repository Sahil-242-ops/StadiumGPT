// StadiumGPT — Stats controller
import { Request, Response } from 'express';

export async function statsController(_req: Request, res: Response): Promise<void> {
  // Simulated live stats (deterministic base + small random variation)
  const hour = new Date().getHours();
  const isMatchTime = hour >= 14 && hour <= 22;
  const base = isMatchTime ? 58431 : 12840;

  res.json({
    visitors_today: base + Math.floor(Math.random() * 500),
    avg_wait_minutes: isMatchTime ? 4 + Math.floor(Math.random() * 3) : 1,
    parking_pct: isMatchTime ? 78 + Math.floor(Math.random() * 15) : 25 + Math.floor(Math.random() * 10),
    carbon_saved_tons: 12.8 + parseFloat((Math.random() * 0.5).toFixed(1)),
    water_saved_litres: 9500 + Math.floor(Math.random() * 300),
    active_alerts: isMatchTime ? 2 + Math.floor(Math.random() * 3) : 0,
    medical_incidents: isMatchTime ? Math.floor(Math.random() * 4) : 0,
    food_queue_avg: isMatchTime ? 3 + Math.floor(Math.random() * 5) : 0,
  });
}
