/**
 * StadiumGPT — Unit tests for the Gemini client
 *
 * Tests the fallback behaviour (when GEMINI_API_KEY is absent),
 * singleton pattern, and the fallback language × intent coverage.
 */

import { getGeminiClient } from '../services/geminiClient';
import { Intent, Language, ResolvedFact } from '../types/index';

// Ensure GEMINI_API_KEY is NOT set so we test the fallback path
beforeAll(() => {
  delete process.env.GEMINI_API_KEY;
  // Reset the singleton between tests
  jest.resetModules();
});

describe('GeminiClient — singleton pattern', () => {
  it('getGeminiClient returns the same instance on repeated calls', () => {
    const c1 = getGeminiClient();
    const c2 = getGeminiClient();
    expect(c1).toBe(c2);
  });

  it('available is false when GEMINI_API_KEY is not set', () => {
    const client = getGeminiClient();
    expect(client.available).toBe(false);
  });
});

describe('GeminiClient — fallback responses (no API key)', () => {
  const languages: Language[] = ['en', 'es', 'fr', 'hi'];
  const intents: Intent[] = [
    'navigate', 'accessibility', 'crowd', 'facility',
    'transport', 'emergency', 'sustainability', 'general',
  ];

  languages.forEach((lang) => {
    intents.forEach((intent) => {
      it(`returns non-empty fallback for lang=${lang} intent=${intent}`, async () => {
        const client = getGeminiClient();
        const fact: ResolvedFact = {
          intent,
          facts: {},
          urgency: intent === 'emergency' ? 'emergency' : 'normal',
        };
        const result = await client.phraseFacts(fact, lang, 'test message');
        expect(typeof result).toBe('string');
        expect(result.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('emergency fallback contains urgency keyword in English', async () => {
    const client = getGeminiClient();
    const fact: ResolvedFact = { intent: 'emergency', facts: {}, urgency: 'emergency' };
    const result = await client.phraseFacts(fact, 'en', 'help!');
    expect(result.toUpperCase()).toMatch(/EMERGENCY|911|STEWARD/);
  });

  it('Hindi fallback for navigate is non-empty', async () => {
    const client = getGeminiClient();
    const fact: ResolvedFact = { intent: 'navigate', facts: {}, urgency: 'normal' };
    const result = await client.phraseFacts(fact, 'hi', 'रास्ता दिखाएं');
    expect(result.length).toBeGreaterThan(5);
  });
});

describe('GeminiClient — summariseCrowd fallback', () => {
  it('returns a string containing crowd level when gemini unavailable', async () => {
    const client = getGeminiClient();
    const crowdFacts = { overall_level: 'high', zones: [] };
    const result = await client.summariseCrowd(crowdFacts, 'en');
    expect(typeof result).toBe('string');
    expect(result).toMatch(/high/i);
  });

  it('handles missing overall_level gracefully', async () => {
    const client = getGeminiClient();
    const result = await client.summariseCrowd({}, 'en');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
