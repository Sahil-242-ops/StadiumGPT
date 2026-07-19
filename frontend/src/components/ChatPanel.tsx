"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage, Language, Intent } from "@/types";
import { sendChat } from "@/lib/api";

const I18N: Record<
  string,
  {
    placeholder: string;
    thinking: string;
    error: string;
    emergency: string;
    welcomeTitle: string;
    welcomeSub: string;
    welcomeItem1: string;
    welcomeItem2: string;
    welcomeItem3: string;
    welcomeItem4: string;
    welcomeHint: string;
  }
> = {
  en: {
    placeholder:
      "Ask me anything… e.g. 'Nearest step-free route to Section B2'",
    thinking: "StadiumGPT is thinking…",
    error: "Sorry, I encountered an error. Please try again.",
    emergency: "I need emergency assistance!",
    welcomeTitle: "Welcome to StadiumGPT! 🌟",
    welcomeSub: "I'm your AI guide for FIFA World Cup 2026.",
    welcomeItem1: "🗺️ Navigate to your seat or any facility",
    welcomeItem2: "📊 Check live crowd levels at every gate",
    welcomeItem3: "♿ Get accessible step-free routes",
    welcomeItem4: "🚑 Emergency assistance anytime",
    welcomeHint: "Try clicking a suggestion below or asking a question!",
  },
  es: {
    placeholder: "Pregúntame cualquier cosa…",
    thinking: "StadiumGPT está pensando…",
    error: "Lo siento, encontré un error.",
    emergency: "¡Necesito asistencia de emergencia!",
    welcomeTitle: "¡Bienvenido a StadiumGPT! 🌟",
    welcomeSub: "Soy tu guía de IA para la Copa Mundial de la FIFA 2026.",
    welcomeItem1: "🗺️ Navega a tu asiento o cualquier instalación",
    welcomeItem2: "📊 Consulta los niveles de multitud en vivo en cada puerta",
    welcomeItem3: "♿ Consigue rutas accesibles libres de escalones",
    welcomeItem4: "🚑 Asistencia de emergencia en cualquier momento",
    welcomeHint:
      "¡Intenta hacer clic en una sugerencia a continuación o haz una pregunta!",
  },
  fr: {
    placeholder: "Posez-moi n'importe quelle question…",
    thinking: "StadiumGPT réfléchit…",
    error: "Désolé, j'ai rencontré une erreur.",
    emergency: "J'ai besoin d'une assistance d'urgence !",
    welcomeTitle: "Bienvenue sur StadiumGPT ! 🌟",
    welcomeSub:
      "Je suis votre guide IA pour la Coupe du Monde de la FIFA 2026.",
    welcomeItem1: "🗺️ Naviguez vers votre siège ou n'importe quel service",
    welcomeItem2: "📊 Vérifiez les niveaux de foule en direct à chaque porte",
    welcomeItem3: "♿ Obtenez des itinéraires accessibles et sans marche",
    welcomeItem4: "🚑 Assistance d'urgence à tout moment",
    welcomeHint:
      "Essayez de cliquer sur une suggestion ci-dessous ou de poser une question !",
  },
  hi: {
    placeholder: "मुझसे कुछ भी पूछें… जैसे 'सेक्शन B2 का निकटतम सुलभ मार्ग'",
    thinking: "StadiumGPT सोच रहा है…",
    error: "क्षमा करें, मुझे कोई त्रुटि मिली। कृपया पुन: प्रयास करें।",
    emergency: "मुझे आपातकालीन सहायता चाहिए!",
    welcomeTitle: "StadiumGPT में आपका स्वागत है! 🌟",
    welcomeSub: "मैं फीफा विश्व कप 2026 के लिए आपका एआई गाइड हूँ।",
    welcomeItem1: "🗺️ अपनी सीट या किसी भी सुविधा तक मार्ग खोजें",
    welcomeItem2: "📊 हर गेट पर भीड़ के स्तर की लाइव जाँच करें",
    welcomeItem3: "♿ व्हीलचेयर सुलभ सीढ़ी-मुक्त मार्ग प्राप्त करें",
    welcomeItem4: "🚑 किसी भी समय आपातकालीन सहायता",
    welcomeHint:
      "नीचे दिए गए सुझाव पर क्लिक करने का प्रयास करें या प्रश्न पूछें!",
  },
};

const SUGGESTED: Partial<Record<Intent, string[]>> = {
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
  crowd: ["Which gate is least busy?", "Avoid congestion"],
  facility: ["Find accessible restroom", "Where is the medical centre?"],
  general: ["Navigate to my seat", "Find facilities", "Check crowd levels"],
};

interface ChatPanelProps {
  stadiumId: string;
  language: Language;
  accessibilityMode: boolean;
  externalQuery?: string;
  onQueryConsumed?: () => void;
}

let msgCounter = 0;
function uid() {
  return `msg_${++msgCounter}_${Date.now()}`;
}

export default function ChatPanel({
  stadiumId,
  language,
  accessibilityMode,
  externalQuery,
  onQueryConsumed,
}: ChatPanelProps) {
  const t = I18N[language] ?? I18N.en;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "bot", text: "__welcome__", timestamp: new Date() },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(
    SUGGESTED.general ?? [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    historyRef.current?.scrollTo({
      top: historyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = useCallback(
    async (message: string) => {
      if (!message.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        text: message,
        timestamp: new Date(),
      };
      const thinkingId = uid();
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: thinkingId,
          role: "bot",
          text: "__typing__",
          timestamp: new Date(),
        },
      ]);
      setInput("");
      setLoading(true);

      try {
        const data = await sendChat({
          message,
          language,
          stadium_id: stadiumId,
          accessibility_mode: accessibilityMode,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  ...m,
                  text: data.message,
                  intent: data.intent,
                  urgency: data.urgency,
                }
              : m,
          ),
        );
        setSuggestions(SUGGESTED[data.intent] ?? SUGGESTED.general ?? []);
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m.id === thinkingId ? { ...m, text: t.error } : m)),
        );
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [loading, language, stadiumId, accessibilityMode, t.error],
  );

  // Handle external query from map/suggestions
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      void send(externalQuery);
      onQueryConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <section className="panel panel--chat" aria-labelledby="chat-heading">
      <h1 id="chat-heading" className="sr-only">
        StadiumGPT AI Chat Assistant
      </h1>

      <div
        ref={historyRef}
        className="chat-history"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.map((msg) => {
          const isTyping = msg.text === "__typing__";
          const isWelcome = msg.id === "welcome";
          const isEmergency = msg.urgency === "emergency";

          return (
            <div
              key={msg.id}
              className={`msg msg--${msg.role}${isEmergency ? " msg--emergency" : ""}${isTyping ? " msg--typing" : ""}`}
              role="article"
            >
              <div className="msg__avatar" aria-hidden="true">
                {msg.role === "bot" ? "⚽" : "👤"}
              </div>
              <div className="msg__bubble">
                {isTyping ? (
                  <div className="typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                ) : isWelcome ? (
                  <>
                    <p className="msg__text">
                      <strong>{t.welcomeTitle}</strong>
                      <br />
                      {t.welcomeSub}
                    </p>
                    <ul className="msg__list">
                      <li>{t.welcomeItem1}</li>
                      <li>{t.welcomeItem2}</li>
                      <li>{t.welcomeItem3}</li>
                      <li>{t.welcomeItem4}</li>
                    </ul>
                    <p
                      className="msg__text"
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {t.welcomeHint}
                    </p>
                  </>
                ) : (
                  <p className="msg__text">{msg.text}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="suggestions" aria-label="Suggested questions">
        {suggestions.map((s) => (
          <button
            key={s}
            className="suggestion-chip"
            onClick={() => send(s)}
            disabled={loading}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="chat-input"
        role="search"
        aria-label="Ask StadiumGPT"
        onSubmit={handleSubmit}
      >
        <input
          ref={inputRef}
          type="text"
          className="chat-input__field"
          placeholder={t.placeholder}
          maxLength={500}
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />

        <button
          type="button"
          className="btn btn--emergency"
          aria-label="Emergency help"
          onClick={() => send(t.emergency)}
        >
          🚨
        </button>

        <button
          type="submit"
          className="btn btn--primary"
          aria-label="Send message"
          disabled={loading}
        >
          <span className="btn__icon" aria-hidden="true">
            ➤
          </span>
        </button>
      </form>
    </section>
  );
}
