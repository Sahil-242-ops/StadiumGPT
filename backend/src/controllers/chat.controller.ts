// StadiumGPT — Chat controller
import { Request, Response } from "express";
import { z } from "zod";
import { resolve } from "../services/rulesEngine.js";
import { getGeminiClient } from "../services/geminiClient.js";
import { Intent, Language } from "../types/index.js";
import { logger } from "../utils/index.js";

const ChatSchema = z.object({
  message: z.string().min(1).max(500),
  language: z.enum(["en", "es", "fr", "hi"]).default("en"),
  stadium_id: z.string().default("met_life"),
  section: z.string().optional(),
  accessibility_mode: z.boolean().default(false),
});

const SUGGESTED: Record<Intent, string[]> = {
  navigate: [
    "Show me accessible routes",
    "Where is Gate D?",
    "How far is Section B2?",
  ],
  accessibility: [
    "Wheelchair access routes",
    "Accessible restrooms",
    "Elevator locations",
  ],
  crowd: [
    "Which gate is least busy?",
    "Avoid congestion",
    "Best time to enter",
  ],
  facility: [
    "Find accessible restroom",
    "Where is the medical centre?",
    "Halal food stands",
  ],
  transport: ["Accessible parking", "Metro directions", "Shuttle schedule"],
  emergency: [],
  sustainability: ["Water refill stations", "Recycling locations"],
  general: ["Navigate to my seat", "Find facilities", "Check crowd levels"],
};

/**
 * Handles incoming chat messages from stadium fans.
 * Resolves appropriate facts using the rules engine and phrases them with Gemini.
 *
 * @param req Express Request object containing the message payload.
 * @param res Express Response object for sending JSON results.
 * @returns A promise resolving to void.
 */
export async function chatController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = ChatSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(422)
      .json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { message, language, stadium_id, section, accessibility_mode } =
    parsed.data;

  try {
    const fact = resolve(message, stadium_id, section, accessibility_mode);
    const gemini = getGeminiClient();
    const narrative = await gemini.phraseFacts(
      fact,
      language as Language,
      message,
    );

    res.json({
      message: narrative,
      intent: fact.intent,
      language,
      accessibility_mode,
      suggested_actions: SUGGESTED[fact.intent] ?? [],
      urgency: fact.urgency ?? "normal",
    });
  } catch (err) {
    logger.error(err, "chatController");
    res.status(500).json({ error: "An unexpected error occurred." });
  }
}
