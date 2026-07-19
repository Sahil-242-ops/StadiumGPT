// StadiumGPT — Rules Engine (deterministic fact resolver)
// Ported from Python rules_engine.py — Gemini only phrases resolved facts.
import path from 'path';
import fs from 'fs';
import { Intent, ResolvedFact, CrowdLevel } from '../types/index.js';

// ── Data loading ───────────────────────────────────────────────────────────

// Works in dev (tsx, __dirname = backend/src/services) and prod (node dist/src/services)
// In both cases, data/ is a sibling directory of services/
const DATA_DIR = path.join(__dirname, '..', 'data');

// ── Deterministic seeded RNG ───────────────────────────────────────────────
// Replaces Math.random() so responses are stable within a 1-minute window.
// Seed varies per context string (stadiumId, section, zone) + minute-bucket.
function seededRand(seed: string): number {
  let h = 0x9e3779b9;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 0x85ebca6b);
    h ^= h >>> 13;
  }
  return ((h >>> 0) / 0xffffffff);
}

function loadJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

let _stadiums: Record<string, unknown> | null = null;
let _routes: Record<string, unknown> | null = null;
let _facilities: Record<string, unknown> | null = null;

function getStadiums() {
  if (!_stadiums) _stadiums = loadJson<Record<string, unknown>>('stadiums.json');
  return _stadiums as { stadiums: StadiumData[] };
}

function getRoutes() {
  if (!_routes) _routes = loadJson<Record<string, unknown>>('routes.json');
  return _routes as { step_free_routes: Record<string, RouteData> };
}

function getFacilities() {
  if (!_facilities)
    _facilities = loadJson<Record<string, unknown>>('facilities.json');
  return _facilities as { facilities: FacilitiesData };
}

// ── Data shape types ───────────────────────────────────────────────────────

interface GateData {
  step_free: boolean;
  description: string;
}

interface StadiumData {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  sections: string[];
  gates: Record<string, GateData>;
  facilities: Record<string, unknown>;
}

interface RouteData {
  accessible: boolean;
  steps: string[];
  distance_metres: number;
  estimated_minutes: number;
  landmarks?: string[];
}

interface FacilitiesData {
  accessible_restrooms: { locations: string[]; features: string[] };
  medical: { locations: string[]; services: string[]; emergency: string };
  transportation: {
    accessible_parking: { lots: string[]; shuttle: string };
    public_transport: { metro: string; accessible_services: string };
  };
  fan_services: {
    lost_found: string;
    prayer_quiet_room: string;
    family_room: string;
    sensory_kits: string;
    sign_language: string;
  };
  sustainability: {
    recycling_stations: string;
    water_refill: string;
    carbon_offset: string;
  };
  concessions: {
    halal: string;
    kosher: string;
    vegan: string;
    allergen_free: string;
  };
}

// ── Prompt injection defence ───────────────────────────────────────────────

const INJECTION_PATTERNS = [
  /ignore\s+(previous|prior|above|all)\s+instructions?/i,
  /act\s+as\s+(if|a|an)\s+/i,
  /you\s+are\s+now\s+/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /bypass\s+(safety|filter|restriction)/i,
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /prompt\s*injection/i,
];

function detectInjection(message: string): boolean {
  return INJECTION_PATTERNS.some((p) => p.test(message));
}

// ── Intent detection ───────────────────────────────────────────────────────

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  navigate: ['route', 'navigate', 'get to', 'how do i reach', 'directions', 'path', 'way to', 'find my seat', 'section', 'level'],
  accessibility: ['accessible', 'wheelchair', 'step-free', 'disability', 'mobility', 'elevator', 'lift', 'ramp', 'hearing loop', 'bsl', 'asl', 'sensory'],
  crowd: ['crowd', 'busy', 'congested', 'queue', 'wait', 'people', 'packed', 'empty', 'how many', 'gate'],
  facility: ['restroom', 'toilet', 'bathroom', 'food', 'drink', 'medical', 'first aid', 'lost', 'found', 'prayer', 'baby', 'halal', 'kosher', 'vegan', 'atm', 'cash', 'locker'],
  transport: ['transport', 'metro', 'bus', 'shuttle', 'parking', 'taxi', 'uber', 'train', 'station', 'travel', 'get here', 'car'],
  emergency: ['emergency', 'help', 'sos', 'injury', 'injured', 'sick', 'fire', 'evacuation', '911', '999', 'ambulance', 'police', 'attack', 'lost child'],
  sustainability: ['recycle', 'recycling', 'eco', 'green', 'water refill', 'sustainability', 'carbon', 'electric', 'environment'],
  general: [],
};

/**
 * Detect the intent of a user message.
 * Returns the most specific matching intent or 'general' as fallback.
 */
export function detectIntent(message: string): Intent {
  const lower = message.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [Intent, string[]][]) {
    if (intent === 'general') continue;
    if (keywords.some((kw) => lower.includes(kw))) return intent;
  }
  return 'general';
}

// ── Fact resolvers ─────────────────────────────────────────────────────────

function resolveNavigation(
  message: string,
  stadiumId: string,
  stepFree: boolean
): Record<string, unknown> {
  const { stadiums } = getStadiums();
  const { step_free_routes } = getRoutes();

  const stadium = stadiums.find((s) => s.id === stadiumId) ?? stadiums[0];

  // Try to extract gate and section from message
  const gateMatch = message.toUpperCase().match(/GATE\s+([A-E])/);
  const sectionMatch = message.toUpperCase().match(/SECTION\s+([A-C][1-3]|ACCESSIBLE|VIP|PRESS)/);

  const gate = gateMatch?.[1] ?? 'A';
  const section = sectionMatch?.[1] ?? 'B2';

  const gateData = stadium.gates[gate];
  const routeKey = `gate_${gate.toLowerCase()}_to_section_${section.toLowerCase()}`;

  let route = step_free_routes[routeKey];
  if (!route) {
    const accessible = stepFree || gate === 'A' || gate === 'C' || gate === 'D';
    const levelNum = section.startsWith('A') ? '1' : section.startsWith('B') ? '2' : '3';
    const estimated_minutes = Math.floor(seededRand(`${gate}${section}min`) * 5) + 4;
    const distance_metres = estimated_minutes * 60 + Math.floor(seededRand(`${gate}${section}dist`) * 40);

    const steps = stepFree
      ? [
          `Enter via Gate ${gate} (ground level accessible entrance)`,
          `Follow green accessible path signs towards Section ${section} elevators`,
          `Take elevator on your left to Level ${levelNum}`,
          `Proceed along the wheelchair-accessible corridor`,
          `Section ${section} accessible seating is directly ahead`
        ]
      : [
          `Enter via Gate ${gate} (main entrance)`,
          `Take the concourse stairs or escalator to Level ${levelNum}`,
          `Follow color-coded wayfinding signs towards the Stand area`,
          `Locate the entry portal for Section ${section}`,
          `Section ${section} entrance is directly ahead`
        ];

    route = {
      accessible,
      steps,
      distance_metres,
      estimated_minutes,
      landmarks: [`Gate ${gate} Information board`, `Level ${levelNum} junction`, `Section ${section} entryway`]
    };
  }

  return {
    gate,
    section,
    gate_step_free: gateData?.step_free ?? false,
    gate_description: gateData?.description ?? 'Main entrance',
    accessible: route.accessible,
    route_steps: route.steps,
    distance_metres: route.distance_metres,
    estimated_minutes: route.estimated_minutes,
    landmarks: route.landmarks ?? [],
  };
}

function resolveAccessibility(stadiumId: string): Record<string, unknown> {
  const { stadiums } = getStadiums();
  const { facilities } = getFacilities();
  const stadium = stadiums.find((s) => s.id === stadiumId) ?? stadiums[0];
  const stepFreeGates = Object.entries(stadium.gates)
    .filter(([, g]) => g.step_free)
    .map(([name]) => `Gate ${name}`);

  return {
    step_free_gates: stepFreeGates.join(', '),
    accessible_restrooms: facilities.accessible_restrooms.locations.join(', '),
    elevator_info: 'Elevators available at Gate A, C and D — all levels',
    hearing_loop: 'Hearing loop installed throughout the stadium bowl',
    sensory_kits: facilities.fan_services.sensory_kits,
    sign_language: facilities.fan_services.sign_language,
  };
}

function resolveCrowd(
  stadiumId: string,
  section?: string
): {
  overall_level: CrowdLevel;
  zones: {
    zone: string;
    level: CrowdLevel;
    occupancy_pct: number;
    recommended_gate: string;
    alert?: string;
  }[];
} {
  // Deterministic crowd simulation based on time of day
  const hour = new Date().getHours();
  const isMatchTime = hour >= 14 && hour <= 22;

  const zones = [
    { zone: 'North Stand',  base: isMatchTime ? 78 : 35 },
    { zone: 'South Stand',  base: isMatchTime ? 82 : 40 },
    { zone: 'East Stand',   base: isMatchTime ? 65 : 28 },
    { zone: 'West Stand',   base: isMatchTime ? 71 : 32 },
    { zone: 'VIP Lounge',   base: isMatchTime ? 45 : 20 },
    { zone: 'Concourse A',  base: isMatchTime ? 88 : 50 },
  ].map(({ zone, base }) => {
    const seed = `${zone}${Math.floor(Date.now() / 60000)}`;
    const pct = Math.min(100, base + Math.floor(seededRand(seed) * 10));
    const level: CrowdLevel =
      pct >= 85 ? 'critical' : pct >= 70 ? 'high' : pct >= 45 ? 'moderate' : 'low';
    const gates: Record<CrowdLevel, string> = {
      critical: 'D', high: 'C', moderate: 'B', low: 'A',
    };
    return {
      zone,
      level,
      occupancy_pct: pct,
      recommended_gate: gates[level],
      ...(level === 'critical' ? { alert: 'High congestion — use Gate D or C' } : {}),
    };
  });

  const avgPct =
    zones.reduce((sum, z) => sum + z.occupancy_pct, 0) / zones.length;
  const overall_level: CrowdLevel =
    avgPct >= 85 ? 'critical' : avgPct >= 70 ? 'high' : avgPct >= 45 ? 'moderate' : 'low';

  return { overall_level, zones };
}

function resolveFacility(message: string): Record<string, unknown> {
  const { facilities } = getFacilities();
  const lower = message.toLowerCase();

  if (lower.includes('restroom') || lower.includes('toilet') || lower.includes('bathroom')) {
    return {
      type: 'accessible_restrooms',
      locations: facilities.accessible_restrooms.locations.join(', '),
      features: facilities.accessible_restrooms.features.join(', '),
      operating_hours: 'Match day: 4 hours before kick-off to 1 hour after final whistle',
    };
  }
  if (lower.includes('medical') || lower.includes('first aid')) {
    return {
      type: 'medical',
      locations: facilities.medical.locations.join(', '),
      services: facilities.medical.services.join(', '),
      emergency: facilities.medical.emergency,
    };
  }
  if (lower.includes('food') || lower.includes('halal') || lower.includes('kosher') || lower.includes('vegan')) {
    return {
      type: 'concessions',
      halal: facilities.concessions.halal,
      kosher: facilities.concessions.kosher,
      vegan: facilities.concessions.vegan,
      allergen_info: facilities.concessions.allergen_free,
    };
  }
  if (lower.includes('prayer') || lower.includes('quiet')) {
    return {
      type: 'prayer_quiet_room',
      location: facilities.fan_services.prayer_quiet_room,
    };
  }
  if (lower.includes('lost') || lower.includes('found')) {
    return {
      type: 'lost_and_found',
      location: facilities.fan_services.lost_found,
    };
  }
  if (lower.includes('baby') || lower.includes('family') || lower.includes('nursing')) {
    return {
      type: 'family_room',
      location: facilities.fan_services.family_room,
    };
  }
  return {
    type: 'general_facilities',
    medical: facilities.medical.locations[0],
    restrooms: facilities.accessible_restrooms.locations[0],
    lost_found: facilities.fan_services.lost_found,
    prayer: facilities.fan_services.prayer_quiet_room,
  };
}

function resolveTransport(): Record<string, unknown> {
  const { facilities } = getFacilities();
  const { accessible_parking, public_transport } = facilities.transportation;
  return {
    accessible_parking_lots: accessible_parking.lots.join(', '),
    shuttle: accessible_parking.shuttle,
    metro: public_transport.metro,
    accessible_transport: public_transport.accessible_services,
  };
}

function resolveEmergency(): Record<string, unknown> {
  const { facilities } = getFacilities();
  return {
    action: 'Contact nearest steward immediately or call 911',
    medical_locations: facilities.medical.locations.join(', '),
    emergency_contact: facilities.medical.emergency,
    evacuation: 'Follow steward directions and green exit signs',
  };
}

function resolveSustainability(): Record<string, unknown> {
  const { facilities } = getFacilities();
  return {
    recycling: facilities.sustainability.recycling_stations,
    water_refill: facilities.sustainability.water_refill,
    carbon_offset: facilities.sustainability.carbon_offset,
  };
}

// ── Main resolver ──────────────────────────────────────────────────────────

/**
 * Main fact resolver — takes a raw user message and returns structured facts
 * that can be phrased by the Gemini client.
 */
export function resolve(
  message: string,
  stadiumId = 'met_life',
  section?: string,
  stepFree = false
): ResolvedFact {
  if (detectInjection(message)) {
    return {
      intent: 'general',
      facts: { info: 'I can only assist with stadium navigation and fan services.' },
      urgency: 'normal',
    };
  }

  const intent = detectIntent(message);

  switch (intent) {
    case 'navigate':
    case 'accessibility': {
      if (intent === 'accessibility') {
        return {
          intent,
          facts: resolveAccessibility(stadiumId),
          urgency: 'normal',
        };
      }
      const navFacts = resolveNavigation(message, stadiumId, stepFree);
      return { intent, facts: navFacts, urgency: 'normal' };
    }
    case 'crowd':
      return { intent, facts: resolveCrowd(stadiumId, section) as Record<string, unknown>, urgency: 'normal' };
    case 'facility':
      return { intent, facts: resolveFacility(message), urgency: 'normal' };
    case 'transport':
      return { intent, facts: resolveTransport(), urgency: 'normal' };
    case 'emergency':
      return { intent, facts: resolveEmergency(), urgency: 'emergency' };
    case 'sustainability':
      return { intent, facts: resolveSustainability(), urgency: 'normal' };
    default:
      return {
        intent: 'general',
        facts: { info: 'Welcome to StadiumGPT! Ask me about navigation, facilities, crowd levels, or transport.' },
        urgency: 'normal',
      };
  }
}

export { resolveCrowd };
