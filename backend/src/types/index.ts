// StadiumGPT — Shared TypeScript types for backend

export type Language = "en" | "es" | "fr" | "hi";

export type Intent =
  | "navigate"
  | "accessibility"
  | "crowd"
  | "facility"
  | "transport"
  | "emergency"
  | "sustainability"
  | "general";

export type CrowdLevel = "low" | "moderate" | "high" | "critical";

// ── Request schemas ────────────────────────────────────────────────────────

export interface ChatRequest {
  message: string;
  language?: Language;
  stadium_id?: string;
  section?: string;
  accessibility_mode?: boolean;
}

export interface NavigateRequest {
  from_gate: string;
  to_section: string;
  stadium_id?: string;
  step_free?: boolean;
  language?: Language;
}

export interface CrowdRequest {
  stadium_id?: string;
  section?: string;
}

// ── Response schemas ───────────────────────────────────────────────────────

export interface ChatResponse {
  message: string;
  intent: Intent;
  language: Language;
  accessibility_mode: boolean;
  suggested_actions: string[];
  urgency: "normal" | "high" | "emergency";
}

export interface RouteStep {
  instruction: string;
  accessible: boolean;
}

export interface NavigateResponse {
  route_id: string;
  from_gate: string;
  to_section: string;
  accessible: boolean;
  steps: RouteStep[];
  distance_metres: number;
  estimated_minutes: number;
  gemini_narrative: string;
  language: Language;
}

export interface CrowdZone {
  zone: string;
  level: CrowdLevel;
  occupancy_pct: number;
  recommended_gate: string;
  alert?: string;
}

export interface CrowdResponse {
  stadium_id: string;
  zones: CrowdZone[];
  overall_level: CrowdLevel;
  gemini_summary: string;
  language: Language;
}

// ── Internal types ─────────────────────────────────────────────────────────

export interface ResolvedFact {
  intent: Intent;
  facts: Record<string, unknown>;
  urgency?: "normal" | "high" | "emergency";
}
