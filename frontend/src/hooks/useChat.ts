// StadiumGPT — useChat hook
// Manages chat message state, sending, and suggested actions
import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, Language, Intent } from '@/types';
import { chatService } from '@/services/chat.service';

let _id = 0;
const uid = () => `msg_${++_id}_${Date.now()}`;

const SUGGESTIONS: Partial<Record<Intent, string[]>> = {
  navigate:      ['Show me accessible routes', 'Where is Gate D?', 'How far is Section B2?'],
  accessibility: ['Wheelchair access routes', 'Accessible restrooms', 'Elevator locations'],
  crowd:         ['Which gate is least busy?', 'Avoid congestion', 'Best time to enter'],
  facility:      ['Find accessible restroom', 'Where is the medical centre?', 'Halal food stands'],
  general:       ['Navigate to my seat', 'Find facilities', 'Check crowd levels'],
};

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: '__welcome__',
  timestamp: new Date(),
};

export function useChat(stadiumId: string, language: Language, accessibilityMode: boolean) {
  const [messages, setMessages]     = useState<ChatMessage[]>([WELCOME]);
  const [suggestions, setSuggestions] = useState<string[]>(SUGGESTIONS.general ?? []);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = { id: uid(), role: 'user', text: trimmed, timestamp: new Date() };
      const thinkingId = uid();
      const thinkingMsg: ChatMessage = { id: thinkingId, role: 'bot', text: '__typing__', timestamp: new Date() };

      setMessages((prev) => [...prev, userMsg, thinkingMsg]);
      setLoading(true);
      setError(null);

      try {
        const data = await chatService.send({
          message: trimmed,
          language,
          stadium_id: stadiumId,
          accessibility_mode: accessibilityMode,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? { ...m, text: data.message, intent: data.intent, urgency: data.urgency }
              : m
          )
        );
        setSuggestions(SUGGESTIONS[data.intent] ?? SUGGESTIONS.general ?? []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An error occurred. Please try again.';
        setError(msg);
        setMessages((prev) =>
          prev.map((m) => (m.id === thinkingId ? { ...m, text: `⚠ ${msg}` } : m))
        );
      } finally {
        setLoading(false);
      }
    },
    [loading, language, stadiumId, accessibilityMode]
  );

  const sendEmergency = useCallback(() => send('I need emergency assistance!'), [send]);

  const reset = useCallback(() => {
    setMessages([WELCOME]);
    setSuggestions(SUGGESTIONS.general ?? []);
    setError(null);
  }, []);

  return { messages, suggestions, loading, error, send, sendEmergency, reset, scrollRef };
}
