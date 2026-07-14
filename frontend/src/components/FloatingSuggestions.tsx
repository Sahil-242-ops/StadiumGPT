'use client';

interface FloatingSuggestionsProps {
  onSend: (query: string) => void;
}

const SUGGESTIONS = [
  { icon: '⚽', label: 'My Match',            query: 'When does my match start and where is my seat?' },
  { icon: '🍔', label: 'Find Burger',          query: 'Where is the nearest burger or food concession?' },
  { icon: '🚻', label: 'Nearest Washroom',     query: 'Where is the nearest accessible restroom?' },
  { icon: '🚇', label: 'Exit Fastest Route',   query: 'What is the fastest exit route from the stadium?' },
  { icon: '🚑', label: 'Medical Help',         query: 'Where is the nearest medical centre or first aid?' },
  { icon: '♿', label: 'Wheelchair Route',      query: 'Show me wheelchair accessible step-free routes' },
];

export default function FloatingSuggestions({ onSend }: FloatingSuggestionsProps) {
  return (
    <div className="floating-suggestions" aria-label="Quick AI suggestions">
      {SUGGESTIONS.map((s, i) => (
        <button
          key={s.label}
          className="floating-chip"
          onClick={() => onSend(s.query)}
          aria-label={s.label}
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <span className="floating-chip__icon" aria-hidden="true">{s.icon}</span>
          <span className="floating-chip__label">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
