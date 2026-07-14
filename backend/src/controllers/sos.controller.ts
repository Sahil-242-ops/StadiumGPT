// StadiumGPT — SOS controller
import { Request, Response } from 'express';
import { z } from 'zod';

const SOSSchema = z.object({
  type: z.enum(['medical', 'lost_child', 'security', 'fire', 'general']),
  location: z.string().optional().default('Section B2, Row 14'),
  description: z.string().max(500).optional(),
  stadium_id: z.string().default('met_life'),
});

const RESPONDERS: Record<string, { responder: string; eta: number; msg: string }> = {
  medical:    { responder: 'Medical Team Alpha',    eta: 2,  msg: 'Medical team dispatched to your location. Stay calm, help is on the way.' },
  lost_child: { responder: 'Security Team Bravo',   eta: 3,  msg: 'Security team alerted. All gates notified. Please stay at your current location.' },
  security:   { responder: 'Security Operations',   eta: 1,  msg: 'Security team dispatched immediately. Please move to a safe location if possible.' },
  fire:       { responder: 'Fire & Safety Team',    eta: 1,  msg: 'EVACUATION PROTOCOL: Follow green exit signs. Fire team en route. Do NOT use elevators.' },
  general:    { responder: 'Guest Services',        eta: 5,  msg: 'A guest services representative has been notified and will assist you shortly.' },
};

let sosCounter = 0;

export async function sosController(req: Request, res: Response): Promise<void> {
  const parsed = SOSSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { type, location, description } = parsed.data;
  const info = RESPONDERS[type] ?? RESPONDERS.general;

  sosCounter++;
  const id = `SOS-${Date.now()}-${sosCounter}`;

  console.warn(`🚨 SOS ALERT [${id}] Type: ${type} | Location: ${location} | Desc: ${description ?? 'none'}`);

  res.json({
    id,
    status: 'dispatched',
    type,
    location: location ?? 'Section B2',
    eta_minutes: info.eta,
    message: info.msg,
    responder: info.responder,
  });
}
