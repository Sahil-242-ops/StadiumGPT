'use client';

import { useState, useCallback } from 'react';
import { NavigateResponse, Language } from '@/types';
import { getRoute } from '@/lib/api';

interface NavPanelProps {
  stadiumId: string;
  language: Language;
}

const GATES = ['A', 'B', 'C', 'D', 'E'];
const SECTIONS = ['A1','A2','A3','B1','B2','B3','C1','C2','C3','ACCESSIBLE'];

const I18N: Record<string, {
  title: string;
  fromGate: string;
  toSection: string;
  stepFree: string;
  getRoute: string;
  finding: string;
  capacity: string;
  gates: string;
  accessible: string;
  featuresTitle: string;
  wcag: string;
  gemini: string;
  rules: string;
  injection: string;
  liveCrowd: string;
  gateLabel: string;
  sectionLabel: string;
}> = {
  en: {
    title: 'Route Planner',
    fromGate: 'From Gate',
    toSection: 'To Section',
    stepFree: 'Step-free / Wheelchair',
    getRoute: 'Get Route',
    finding: 'Finding route…',
    capacity: 'Capacity',
    gates: 'Gates',
    accessible: 'Accessible',
    featuresTitle: 'Features',
    wcag: 'WCAG 2.1 AA compliant',
    gemini: 'Gemini AI powered',
    rules: 'Rules-before-LLM design',
    injection: 'Prompt-injection defence',
    liveCrowd: 'Real-time crowd guidance',
    gateLabel: 'Gate',
    sectionLabel: 'Section',
  },
  es: {
    title: 'Planificador de Rutas',
    fromGate: 'Desde la Puerta',
    toSection: 'A la Sección',
    stepFree: 'Sin escalones / Silla de ruedas',
    getRoute: 'Obtener Ruta',
    finding: 'Buscando ruta…',
    capacity: 'Capacidad',
    gates: 'Puertas',
    accessible: 'Accesible',
    featuresTitle: 'Características',
    wcag: 'Cumple con WCAG 2.1 AA',
    gemini: 'Potenciado por Gemini AI',
    rules: 'Diseño de Reglas antes de LLM',
    injection: 'Defensa contra inyección de prompts',
    liveCrowd: 'Guía de multitudes en tiempo real',
    gateLabel: 'Puerta',
    sectionLabel: 'Sección',
  },
  fr: {
    title: 'Planificateur d\'Itinéraire',
    fromGate: 'Depuis la Porte',
    toSection: 'Vers la Section',
    stepFree: 'Sans marche / Fauteuil roulant',
    getRoute: 'Obtenir l\'Itinéraire',
    finding: 'Recherche d\'itinéraire…',
    capacity: 'Capacité',
    gates: 'Portes',
    accessible: 'Accessible',
    featuresTitle: 'Fonctionnalités',
    wcag: 'Conforme WCAG 2.1 AA',
    gemini: 'Propulsé par Gemini AI',
    rules: 'Conception Règles-avant-LLM',
    injection: 'Défense contre l\'injection d\'instructions',
    liveCrowd: 'Guidage de la foule en temps réel',
    gateLabel: 'Porte',
    sectionLabel: 'Section',
  },
  hi: {
    title: 'मार्ग योजनाकार',
    fromGate: 'प्रवेश गेट',
    toSection: 'गंतव्य सेक्शन',
    stepFree: 'सीढ़ी-मुक्त / व्हीलचेयर',
    getRoute: 'मार्ग प्राप्त करें',
    finding: 'मार्ग खोजा जा रहा है…',
    capacity: 'दर्शक क्षमता',
    gates: 'प्रवेश द्वार',
    accessible: 'सुलभ प्रवेश',
    featuresTitle: 'विशेषताएं',
    wcag: 'WCAG 2.1 AA अनुपालन',
    gemini: 'जेमिनी एआई द्वारा संचालित',
    rules: 'एलएलएम से पहले नियम डिजाइन',
    injection: 'प्रॉम्प्ट-इंजेक्शन सुरक्षा',
    liveCrowd: 'रीअल-टाइम भीड़ मार्गदर्शन',
    gateLabel: 'गेट',
    sectionLabel: 'सेक्शन',
  },
};

export default function NavPanel({ stadiumId, language }: NavPanelProps) {
  const t = I18N[language] ?? I18N.en;
  const [fromGate, setFromGate]     = useState('A');
  const [toSection, setToSection]   = useState('B2');
  const [stepFree, setStepFree]     = useState(false);
  const [result, setResult]         = useState<NavigateResponse | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        const data = await getRoute({
          from_gate: fromGate,
          to_section: toSection,
          stadium_id: stadiumId,
          step_free: stepFree,
          language,
        });
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get route');
      } finally {
        setLoading(false);
      }
    },
    [fromGate, toSection, stadiumId, stepFree, language]
  );

  return (
    <>
      <section className="card" aria-labelledby="nav-heading">
        <h2 id="nav-heading" className="card__title">
          <span aria-hidden="true">🗺️</span> {t.title}
        </h2>
        <form id="nav-form" aria-label="Plan your route" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="from-gate" className="form-label">{t.fromGate}</label>
            <select
              id="from-gate"
              className="select"
              value={fromGate}
              onChange={(e) => setFromGate(e.target.value)}
              aria-label="Select starting gate"
            >
              {GATES.map((g) => (
                <option key={g} value={g}>{t.gateLabel} {g}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="to-section" className="form-label">{t.toSection}</label>
            <select
              id="to-section"
              className="select"
              value={toSection}
              onChange={(e) => setToSection(e.target.value)}
              aria-label="Select destination section"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>{t.sectionLabel} {s}</option>
              ))}
            </select>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              id="step-free-check"
              checked={stepFree}
              onChange={(e) => setStepFree(e.target.checked)}
            />
            <span>{t.stepFree}</span>
          </label>
          <button
            type="submit"
            className="btn btn--primary btn--full"
            id="nav-submit"
            disabled={loading}
          >
            <span aria-hidden="true">🗺️</span>{' '}
            {loading ? t.finding : t.getRoute}
          </button>
        </form>

        {error && (
          <p style={{ color: 'var(--accent-red)', fontSize: '0.83rem', marginTop: 8 }}>
            ⚠ {error}
          </p>
        )}

        {result && (
          <div className="nav-result" aria-live="polite" role="region" aria-label="Navigation result">
            {result.accessible && (
              <div className="nav-accessible-badge">♿ {t.stepFree}</div>
            )}
            {result.steps.map((step, i) => (
              <div key={i} className="nav-step">
                <span className="nav-step__num">{i + 1}</span>
                <span className="nav-step__text">{step.instruction}</span>
              </div>
            ))}
            <div className="nav-meta">
              <span>📏 {result.distance_metres}m</span>
              <span>⏱ ~{result.estimated_minutes} min</span>
            </div>
          </div>
        )}
      </section>

      <section className="card card--stats" aria-label="Stadium statistics">
        <div className="stat">
          <span className="stat__value">82,500</span>
          <span className="stat__label">{t.capacity}</span>
        </div>
        <div className="stat">
          <span className="stat__value">5</span>
          <span className="stat__label">{t.gates}</span>
        </div>
        <div className="stat">
          <span className="stat__value">3</span>
          <span className="stat__label">{t.accessible}</span>
        </div>
      </section>

      <section className="card" aria-labelledby="features-heading">
        <h2 id="features-heading" className="card__title">
          <span aria-hidden="true">✨</span> {t.featuresTitle}
        </h2>
        <ul className="feature-list" role="list">
          {[
            { dot: 'green',  label: t.wcag },
            { dot: 'blue',   label: t.gemini },
            { dot: 'purple', label: t.rules },
            { dot: 'orange', label: t.injection },
            { dot: 'green',  label: t.liveCrowd },
          ].map(({ dot, label }) => (
            <li key={label} className="feature-item">
              <span className={`feature-item__dot feature-item__dot--${dot}`} aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
