// StadiumGPT — Gemini prompt templates
// Centralised prompt strings for easy iteration and localisation

export const SYSTEM_PROMPT = `You are StadiumGPT, the official AI assistant for FIFA World Cup 2026.

CRITICAL RULES — you MUST follow these without exception:
1. You ONLY phrase facts given to you in the <FACTS> block. Never invent, guess, or add information.
2. You speak ONLY in the language specified in <LANGUAGE>. Do not switch languages.
3. You are helpful, warm, concise, and accessible. Use simple words.
4. For EMERGENCY intents, start with clear, calm, urgent instructions.
5. For navigation, give numbered step-by-step directions.
6. Never discuss anything unrelated to the stadium, the match, or fan assistance.
7. If facts are empty or unclear, apologise and suggest visiting the Gate A information desk.
8. Keep responses under 150 words unless it is a multi-step navigation route.`;

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish (Español)',
  fr: 'French (Français)',
};

export function buildFactsPrompt(params: {
  langName: string;
  intent: string;
  urgency: string;
  factsStr: string;
  userMessage: string;
}): string {
  const { langName, intent, urgency, factsStr, userMessage } = params;
  return `${SYSTEM_PROMPT}

<LANGUAGE>${langName}</LANGUAGE>
<INTENT>${intent}</INTENT>
<URGENCY>${urgency}</URGENCY>
<FACTS>
${factsStr}
</FACTS>
<FAN_QUESTION>${userMessage}</FAN_QUESTION>

Respond to the fan's question using ONLY the facts above, in ${langName}:`;
}

export function buildCrowdPrompt(params: {
  langName: string;
  overallLevel: string;
  zonesStr: string;
}): string {
  const { langName, overallLevel, zonesStr } = params;
  return `${SYSTEM_PROMPT}

<LANGUAGE>${langName}</LANGUAGE>
<INTENT>crowd</INTENT>
<FACTS>
Overall crowd level: ${overallLevel}
Zone breakdown:
${zonesStr}
</FACTS>

Give a concise crowd status update and recommend the best gates to use, in ${langName}:`;
}

export const FALLBACK_RESPONSES: Record<string, Record<string, string>> = {
  en: {
    navigate:      'Please follow the green accessible path signs and take the elevator to your level.',
    accessibility: 'Accessible routes are available via Gate A and Gate D. Please ask a steward.',
    crowd:         'Please check with stewards for the least congested route.',
    facility:      'Please visit the Gate A information desk for assistance.',
    transport:     'Accessible transport is available. Please check with Gate A information desk.',
    emergency:     'EMERGENCY: Contact the nearest steward or call 911 immediately.',
    sustainability:'Recycling stations are available every 50 metres on all concourses.',
    general:       'Welcome to StadiumGPT! Visit Gate A information desk for any assistance.',
  },
  es: {
    navigate:      'Por favor, siga las señales de ruta accesible verde y tome el ascensor.',
    accessibility: 'Las rutas accesibles están disponibles por las Puertas A y D.',
    crowd:         'Por favor, consulte con los guardias para la ruta menos congestionada.',
    facility:      'Por favor, visite el mostrador de información en la Puerta A.',
    transport:     'El transporte accesible está disponible. Consulte en la Puerta A.',
    emergency:     'EMERGENCIA: Contacte al guardia más cercano o llame al 911 de inmediato.',
    sustainability:'Hay estaciones de reciclaje cada 50 metros en todas las concesiones.',
    general:       '¡Bienvenido a StadiumGPT! Visita el mostrador en la Puerta A.',
  },
  fr: {
    navigate:      "Veuillez suivre les panneaux verts d'accès et prendre l'ascenseur.",
    accessibility: 'Les itinéraires accessibles sont disponibles via les Portes A et D.',
    crowd:         "Veuillez consulter les stewards pour l'itinéraire le moins encombré.",
    facility:      "Veuillez visiter le bureau d'information à la Porte A.",
    transport:     'Transport accessible disponible. Renseignez-vous à la Porte A.',
    emergency:     "URGENCE : Contactez le steward le plus proche ou appelez le 911 immédiatement.",
    sustainability:'Des stations de recyclage sont disponibles tous les 50 mètres.',
    general:       "Bienvenue sur StadiumGPT ! Visitez le bureau d'information à la Porte A.",
  },
};
