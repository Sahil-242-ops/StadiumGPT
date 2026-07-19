"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CrowdZone, CrowdLevel } from "@/types";
import { getCrowd } from "@/lib/api";

interface CrowdPanelProps {
  stadiumId: string;
  language: string;
}

const LEVEL_ICON: Record<CrowdLevel, string> = {
  low: "🟢",
  moderate: "🟡",
  high: "🔴",
  critical: "🔴",
};

const REFRESH_INTERVAL = 15; // seconds

const I18N: Record<
  string,
  {
    title: string;
    refresh: string;
    loading: string;
    updateLabel: string;
  }
> = {
  en: {
    title: "Live Crowd",
    refresh: "Refresh Now",
    loading: "Loading…",
    updateLabel: "Updates in",
  },
  es: {
    title: "Multitud en Vivo",
    refresh: "Actualizar Ahora",
    loading: "Cargando…",
    updateLabel: "Actualizaciones en",
  },
  fr: {
    title: "Foule en Direct",
    refresh: "Rafraîchir Maintenant",
    loading: "Chargement…",
    updateLabel: "Mises à jour dans",
  },
  hi: {
    title: "लाइव भीड़",
    refresh: "अभी अपडेट करें",
    loading: "लोड हो रहा है…",
    updateLabel: "अपडेट समय",
  },
};

export default function CrowdPanel({ stadiumId, language }: CrowdPanelProps) {
  const t = I18N[language] ?? I18N.en;
  const [zones, setZones] = useState<CrowdZone[]>([]);
  const [overall, setOverall] = useState<CrowdLevel>("moderate");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCrowd({ stadium_id: stadiumId });
      setZones(data.zones);
      setOverall(data.overall_level);
      setSummary(data.gemini_summary);
      setCountdown(REFRESH_INTERVAL);
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }, [stadiumId]);

  // Initial fetch
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Auto-refresh countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          void refresh();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refresh]);

  return (
    <section className="card card--crowd" aria-labelledby="crowd-heading">
      <div className="crowd-header">
        <h2 id="crowd-heading" className="card__title">
          <span aria-hidden="true">📊</span> {t.title}
        </h2>
        <span
          className="crowd-timer"
          aria-label={`${t.updateLabel} ${countdown} seconds`}
        >
          {loading ? "⟳" : `${countdown}s`}
        </span>
      </div>

      <div
        className={`crowd-badge crowd-badge--${overall}`}
        role="status"
        aria-live="polite"
      >
        <span className="crowd-badge__dot" />
        <span>{overall.charAt(0).toUpperCase() + overall.slice(1)}</span>
      </div>

      {zones.length > 0 && (
        <div className="crowd-zones" aria-label="Crowd levels by gate/zone">
          {zones.map((z) => (
            <div key={z.zone} className="crowd-zone">
              <div className="crowd-zone__label">
                <span>
                  <span className="crowd-zone__icon" aria-hidden="true">
                    {LEVEL_ICON[z.level]}
                  </span>
                  {z.zone}
                </span>
                <span className="crowd-zone__pct">{z.occupancy_pct}%</span>
              </div>
              <div className="crowd-zone__bar-track">
                <div
                  className={`crowd-zone__bar-fill crowd-zone__bar-fill--${z.level}`}
                  style={{ width: `${z.occupancy_pct}%` }}
                  role="progressbar"
                  aria-valuenow={z.occupancy_pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${z.zone}: ${z.occupancy_pct}% occupancy`}
                />
              </div>
              {z.alert && <p className="crowd-zone__alert">⚠ {z.alert}</p>}
            </div>
          ))}
        </div>
      )}

      {summary && <p className="crowd-summary">{summary}</p>}

      <button
        className="btn btn--ghost btn--sm"
        aria-label="Refresh crowd data"
        onClick={() => void refresh()}
        disabled={loading}
      >
        <span aria-hidden="true">{loading ? "⟳" : "↻"}</span>{" "}
        {loading ? t.loading : t.refresh}
      </button>
    </section>
  );
}
