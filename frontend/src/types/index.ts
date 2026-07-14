// StadiumGPT — TypeScript types for the frontend
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'hi';
export type Intent = 'navigate' | 'accessibility' | 'crowd' | 'facility' | 'transport' | 'emergency' | 'sustainability' | 'general';
export type CrowdLevel = 'low' | 'moderate' | 'high' | 'critical';
export type Urgency = 'normal' | 'high' | 'emergency';
export type SOSType = 'medical' | 'lost_child' | 'security' | 'fire' | 'general';

// ── Chat ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  intent?: Intent;
  urgency?: Urgency;
  cardType?: CardType;
  cardData?: Record<string, unknown>;
  timestamp: Date;
}

export type CardType = 'text' | 'route' | 'facility' | 'crowd' | 'emergency' | 'transport' | 'sustainability';

export interface ChatResponse {
  message: string;
  intent: Intent;
  language: Language;
  accessibility_mode: boolean;
  suggested_actions: string[];
  urgency: Urgency;
  card_type?: CardType;
  card_data?: Record<string, unknown>;
}

// ── Navigation ─────────────────────────────────────────────────────────────

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

// ── Crowd ──────────────────────────────────────────────────────────────────

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

// ── SOS ────────────────────────────────────────────────────────────────────

export interface SOSRequest {
  type: SOSType;
  location?: string;
  description?: string;
  stadium_id?: string;
}

export interface SOSResponse {
  id: string;
  status: 'dispatched';
  type: SOSType;
  location: string;
  eta_minutes: number;
  message: string;
  responder: string;
}

// ── Stats ──────────────────────────────────────────────────────────────────

export interface StadiumStats {
  visitors_today: number;
  avg_wait_minutes: number;
  parking_pct: number;
  carbon_saved_tons: number;
  water_saved_litres: number;
  active_alerts: number;
  medical_incidents: number;
  food_queue_avg: number;
}

// ── AI Insights ────────────────────────────────────────────────────────────

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  action: string;
  confidence_pct: number;
  savings_minutes: number;
  icon: string;
}

// ── Map ────────────────────────────────────────────────────────────────────

export interface MapPOI {
  id: string;
  type: 'restroom' | 'medical' | 'food' | 'parking' | 'gate' | 'seat' | 'prayer' | 'info';
  label: string;
  x: number; // SVG coordinate %
  y: number;
  icon: string;
  accessible?: boolean;
}

// ── Notifications ──────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: 'gate_change' | 'weather' | 'traffic' | 'food_offer' | 'security' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: string;
}
