// StadiumGPT — Crowd controller
import { Request, Response } from 'express';
import { z } from 'zod';
import { resolveCrowd } from '../services/rulesEngine.js';
import { getGeminiClient } from '../services/geminiClient.js';

const CrowdSchema = z.object({
  stadium_id: z.string().default('met_life'),
  section:    z.string().optional(),
});

export async function crowdController(req: Request, res: Response): Promise<void> {
  const parsed = CrowdSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { stadium_id, section } = parsed.data;
  const crowdFacts = resolveCrowd(stadium_id, section);
  const gemini = getGeminiClient();
  const summary = await gemini.summariseCrowd(crowdFacts as Record<string, unknown>, 'en');

  res.json({
    stadium_id,
    zones: crowdFacts.zones,
    overall_level: crowdFacts.overall_level,
    gemini_summary: summary,
    language: 'en',
  });
}
