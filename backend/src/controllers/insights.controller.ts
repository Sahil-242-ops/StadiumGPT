// StadiumGPT — Insights controller
import { Request, Response } from 'express';

const INSIGHT_POOL = [
  { title: 'Gate B congested', description: 'Gate B is at 91% capacity. Gate D has only 23% and saves 12 minutes.', action: 'Use Gate D instead', confidence_pct: 94, savings_minutes: 12, icon: '🚪' },
  { title: 'Food queue alert', description: 'Concourse A food stands have 8-min wait. Concourse C is under 2 minutes.', action: 'Head to Concourse C', confidence_pct: 87, savings_minutes: 6, icon: '🍔' },
  { title: 'Parking filling up', description: 'Lot A is 95% full. Lot C has 40% availability with shuttle service.', action: 'Park in Lot C', confidence_pct: 91, savings_minutes: 15, icon: '🅿' },
  { title: 'Weather update', description: 'Rain expected in 30 minutes. Consider entering the stadium now to avoid delays.', action: 'Enter now', confidence_pct: 78, savings_minutes: 20, icon: '🌧️' },
  { title: 'Accessible route clear', description: 'Step-free route via Gate A is currently empty. Ideal time to enter.', action: 'Use Gate A now', confidence_pct: 96, savings_minutes: 8, icon: '♿' },
  { title: 'Metro arriving', description: 'Next accessible metro arrives in 4 minutes at Platform 2.', action: 'Head to Platform 2', confidence_pct: 99, savings_minutes: 10, icon: '🚇' },
];

let insightIdx = 0;

export async function insightsController(_req: Request, res: Response): Promise<void> {
  const insight = INSIGHT_POOL[insightIdx % INSIGHT_POOL.length];
  insightIdx++;

  res.json({
    id: `insight_${Date.now()}`,
    ...insight,
  });
}
