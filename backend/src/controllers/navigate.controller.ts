// StadiumGPT — Navigate controller
import { Request, Response } from 'express';
import { z } from 'zod';
import { resolve } from '../services/rulesEngine.js';
import { getGeminiClient } from '../services/geminiClient.js';
import { Language } from '../types/index.js';

const NavigateSchema = z.object({
  from_gate:  z.string().min(1).max(2).toUpperCase(),
  to_section: z.string().min(1).max(20).toUpperCase(),
  stadium_id: z.string().default('met_life'),
  step_free:  z.boolean().default(false),
  language:   z.enum(['en', 'es', 'fr', 'hi']).default('en'),
});

export async function navigateController(req: Request, res: Response): Promise<void> {
  const parsed = NavigateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { from_gate, to_section, stadium_id, step_free, language } = parsed.data;
  const message = `gate ${from_gate} section ${to_section}`;
  const fact = resolve(message, stadium_id, to_section, step_free);
  const navFacts = fact.facts as {
    gate_step_free: boolean;
    accessible: boolean;
    route_steps: string[];
    distance_metres: number;
    estimated_minutes: number;
  };

  if (!navFacts.gate_step_free && step_free) {
    res.status(422).json({
      error: `Gate ${from_gate} is not step-free. Please use Gate A, C, or D for accessible access.`,
    });
    return;
  }

  const gemini = getGeminiClient();
  const narrative = await gemini.phraseFacts(
    fact,
    language as Language,
    `How do I get from Gate ${from_gate} to Section ${to_section}?`
  );

  res.json({
    route_id: `${from_gate.toLowerCase()}_to_${to_section.toLowerCase()}`,
    from_gate,
    to_section,
    accessible: navFacts.accessible,
    steps: (navFacts.route_steps ?? []).map((instruction) => ({ instruction, accessible: navFacts.accessible })),
    distance_metres: navFacts.distance_metres,
    estimated_minutes: navFacts.estimated_minutes,
    gemini_narrative: narrative,
    language,
  });
}
