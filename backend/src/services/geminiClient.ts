// StadiumGPT — Google Gemini API client (TypeScript port of gemini_client.py)
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Intent, Language, ResolvedFact } from '../types/index.js';

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Spanish (Español)',
  fr: 'French (Français)',
  hi: 'Hindi (हिन्दी)',
};

const SYSTEM_PROMPT = `You are StadiumGPT, the official AI assistant for FIFA World Cup 2026.

CRITICAL RULES — you MUST follow these without exception:
1. You ONLY phrase facts given to you in the <FACTS> block. Never invent, guess, or add information.
2. You speak ONLY in the language specified in <LANGUAGE>. Do not switch languages.
3. You are helpful, warm, concise, and accessible. Use simple words.
4. For EMERGENCY intents, start with clear, calm, urgent instructions.
5. For navigation, give numbered step-by-step directions.
6. Never discuss anything unrelated to the stadium, the match, or fan assistance.
7. If facts are empty or unclear, apologise and suggest visiting the Gate A information desk.
8. Keep responses under 150 words unless it is a multi-step navigation route.`;

function buildPrompt(fact: ResolvedFact, language: Language, userMessage: string): string {
  const langName = LANGUAGE_NAMES[language];
  const factsStr = Object.entries(fact.facts)
    .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
    .join('\n');

  return `${SYSTEM_PROMPT}

<LANGUAGE>${langName}</LANGUAGE>
<INTENT>${fact.intent}</INTENT>
<URGENCY>${fact.urgency ?? 'normal'}</URGENCY>
<FACTS>
${factsStr}
</FACTS>
<FAN_QUESTION>${userMessage}</FAN_QUESTION>

Respond to the fan's question using ONLY the facts above, in ${langName}:`;
}

function buildCrowdPrompt(crowdFacts: Record<string, unknown>, language: Language): string {
  const langName = LANGUAGE_NAMES[language];
  const zones = (crowdFacts.zones as { zone: string; level: string; occupancy_pct: number; recommended_gate: string }[]) ?? [];
  const zonesStr = zones
    .map((z) => `  ${z.zone}: ${z.level} (${z.occupancy_pct}%) — use Gate ${z.recommended_gate}`)
    .join('\n');

  return `${SYSTEM_PROMPT}

<LANGUAGE>${langName}</LANGUAGE>
<INTENT>crowd</INTENT>
<FACTS>
Overall crowd level: ${crowdFacts.overall_level}
Zone breakdown:
${zonesStr}
</FACTS>

Give a concise crowd status update and recommend the best gates to use, in ${langName}:`;
}

// ── Fallback responses (when Gemini is unavailable) ────────────────────────

const FALLBACKS: Record<Language, Record<Intent, string>> = {
  en: {
    navigate:       'Please follow the green accessible path signs and take the elevator to your level.',
    accessibility:  'Accessible routes are available via Gate A and Gate D. Please ask a steward.',
    crowd:          'Please check with stewards for the least congested route.',
    facility:       'Please visit the Gate A information desk for assistance.',
    transport:      'Accessible transport is available. Please check with Gate A information desk.',
    emergency:      'EMERGENCY: Contact the nearest steward or call 911 immediately.',
    sustainability: 'Recycling stations are available every 50 metres on all concourses.',
    general:        'Welcome to StadiumGPT! Visit Gate A information desk for any assistance.',
  },
  es: {
    navigate:       'Por favor, siga las señales de ruta accesible verde y tome el ascensor a su nivel.',
    accessibility:  'Las rutas accesibles están disponibles por las Puertas A y D.',
    crowd:          'Por favor, consulte con los guardias para la ruta menos congestionada.',
    facility:       'Por favor, visite el mostrador de información en la Puerta A.',
    transport:      'El transporte accesible está disponible. Consulte en la Puerta A.',
    emergency:      'EMERGENCIA: Contacte al guardia más cercano o llame al 911 de inmediato.',
    sustainability: 'Hay estaciones de reciclaje cada 50 metros en todas las concesiones.',
    general:        '¡Bienvenido a StadiumGPT! Visita el mostrador en la Puerta A.',
  },
  fr: {
    navigate:       "Veuillez suivre les panneaux verts d'accès et prendre l'ascenseur jusqu'à votre niveau.",
    accessibility:  'Les itinéraires accessibles sont disponibles via les Portes A et D.',
    crowd:          "Veuillez consulter les stewards pour l'itinéraire le moins encombré.",
    facility:       "Veuillez visiter le bureau d'information à la Porte A.",
    transport:      'Transport accessible disponible. Renseignez-vous à la Porte A.',
    emergency:      "URGENCE : Contactez le steward le plus proche ou appelez le 911 immédiatement.",
    sustainability: 'Des stations de recyclage sont disponibles tous les 50 mètres.',
    general:        "Bienvenue sur StadiumGPT ! Visitez le bureau d'information à la Porte A.",
  },
  hi: {
    navigate:       'कृपया हरे रंग के सुलभ मार्ग संकेतों का पालन करें और लिफ्ट से अपने स्तर पर जाएं।',
    accessibility:  'गेट A और गेट D के माध्यम से सुलभ मार्ग उपलब्ध हैं। कृपया स्टाफ से पूछें।',
    crowd:          'कृपया सबसे कम भीड़ वाले मार्ग की जानकारी के लिए स्टाफ से संपर्क करें।',
    facility:       'कृपया सहायता के लिए गेट A सूचना पटल पर जाएं।',
    transport:      'सुलभ परिवहन उपलब्ध है। कृपया गेट A सूचना पटल पर जाँच करें।',
    emergency:      'आपातकाल: तुरंत निकटतम स्टाफ से संपर्क करें या 112/911 पर कॉल करें।',
    sustainability: 'सभी रास्तों पर हर 50 मीटर पर रीसाइक्लिंग केंद्र उपलब्ध हैं।',
    general:        'StadiumGPT में आपका स्वागत है! किसी भी सहायता के लिए गेट A सूचना पटल पर जाएँ।',
  },
};

// ── Gemini client ──────────────────────────────────────────────────────────

class GeminiClient {
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;
  public readonly available: boolean;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
      });
      this.available = true;
    } else {
      console.warn('GEMINI_API_KEY not set — using fallback responses.');
      this.available = false;
    }
  }

  async phraseFacts(fact: ResolvedFact, language: Language, userMessage: string): Promise<string> {
    if (!this.available || !this.model) {
      return this.fallback(fact, language);
    }
    try {
      const prompt = buildPrompt(fact, language, userMessage);
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.error('Gemini error:', err);
      return this.fallback(fact, language);
    }
  }

  async summariseCrowd(crowdFacts: Record<string, unknown>, language: Language): Promise<string> {
    if (!this.available || !this.model) {
      return `Crowd level is currently ${crowdFacts.overall_level ?? 'moderate'}. Please follow steward guidance.`;
    }
    try {
      const prompt = buildCrowdPrompt(crowdFacts, language);
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.error('Gemini crowd error:', err);
      return `Crowd level is currently ${crowdFacts.overall_level ?? 'moderate'}.`;
    }
  }

  private fallback(fact: ResolvedFact, language: Language): string {
    const langMap = FALLBACKS[language] ?? FALLBACKS.en;
    return langMap[fact.intent] ?? langMap.general;
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────
let _client: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!_client) _client = new GeminiClient();
  return _client;
}
