// StadiumGPT — Crowd controller
import { Request, Response } from "express";
import { z } from "zod";
import { resolveCrowd } from "../services/rulesEngine.js";
import { logger } from "../utils/index.js";

const CrowdSchema = z.object({
  stadium_id: z.string().default("met_life"),
  section: z.string().optional(),
});

/**
 * Build a readable crowd summary directly from structured data — no Gemini needed.
 *
 * @param crowdFacts Crowd details resolved from rulesEngine.
 * @returns A descriptive crowd situation report.
 */
function buildCrowdSummary(
  crowdFacts: ReturnType<typeof resolveCrowd>,
): string {
  const level = crowdFacts.overall_level;
  const busyZones = crowdFacts.zones.filter(
    (z) => z.level === "high" || z.level === "critical",
  );
  const bestZone = crowdFacts.zones.reduce((a, b) =>
    a.occupancy_pct < b.occupancy_pct ? a : b,
  );

  const levelMsg =
    level === "low"
      ? "Crowd levels are low — enjoy easy access to all areas."
      : level === "moderate"
        ? "Crowd levels are moderate — some queues at popular gates."
        : level === "high"
          ? "Crowd levels are high — expect delays at busy entrances."
          : "Crowd levels are critical — please follow steward guidance.";

  const busyMsg =
    busyZones.length > 0
      ? ` Avoid ${busyZones.map((z) => z.zone).join(" and ")} if possible.`
      : "";

  const bestMsg = ` Least congested: ${bestZone.zone} (${bestZone.occupancy_pct}%) — use Gate ${bestZone.recommended_gate}.`;

  return levelMsg + busyMsg + bestMsg;
}

/**
 * Handles crowd density inquiries.
 * Computes deterministic occupancy for different stands/zones based on mock schedule.
 *
 * @param req Express Request object.
 * @param res Express Response object.
 * @returns A promise resolving to void.
 */
export async function crowdController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = CrowdSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(422)
      .json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { stadium_id, section } = parsed.data;

  try {
    const crowdFacts = resolveCrowd(stadium_id, section);
    const summary = buildCrowdSummary(crowdFacts);

    res.json({
      stadium_id,
      zones: crowdFacts.zones,
      overall_level: crowdFacts.overall_level,
      gemini_summary: summary,
      language: "en",
    });
  } catch (err) {
    logger.error(err, "crowdController");
    res.status(500).json({ error: "An unexpected error occurred." });
  }
}
