"use client";

import { useState, useCallback, useEffect } from "react";
import { Language, CrowdZone, MapPOI } from "@/types";
import { getCrowd } from "@/lib/api";
import ChatPanel from "@/components/ChatPanel";
import CrowdPanel from "@/components/CrowdPanel";
import NavPanel from "@/components/NavPanel";
import StadiumMap from "@/components/StadiumMap";
import FloatingSuggestions from "@/components/FloatingSuggestions";
import StatsBar from "@/components/StatsBar";
import SOSButton from "@/components/SOSButton";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "../store/authContext";

const STADIUMS = [
  { id: "met_life", label: "MetLife Stadium, NJ" },
  { id: "sofi", label: "SoFi Stadium, CA" },
  { id: "dallas", label: "AT&T Stadium, TX" },
];

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [stadiumId, setStadiumId] = useState("met_life");
  const [accessibilityMode, setAccessibility] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "chat">("map");
  const [crowdZones, setCrowdZones] = useState<CrowdZone[]>([]);
  const [chatQuery, setChatQuery] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, logout } = useAuth();

  // Fetch crowd zones for the map heatmap
  useEffect(() => {
    const fetchCrowd = async () => {
      try {
        const data = await getCrowd({ stadium_id: stadiumId });
        setCrowdZones(data.zones);
      } catch {
        /* silent */
      }
    };
    void fetchCrowd();
    const timer = setInterval(() => void fetchCrowd(), 15000);
    return () => clearInterval(timer);
  }, [stadiumId]);

  // POI click → switch to chat and send query
  const handlePOIClick = useCallback((poi: MapPOI) => {
    const query = `Where is ${poi.label}? Tell me how to get there.`;
    setChatQuery(query);
    setActiveTab("chat");
  }, []);

  // Floating suggestion → send to chat
  const handleSuggestion = useCallback((query: string) => {
    setChatQuery(query);
    setActiveTab("chat");
  }, []);

  return (
    <div className={accessibilityMode ? "accessibility-mode" : ""}>
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="header" role="banner">
        <div className="header__inner">
          <div className="header__brand">
            <div className="header__logo" aria-hidden="true">
              ⚽
            </div>
            <div>
              <span className="header__title">StadiumGPT</span>
              <span className="header__subtitle">
                FIFA World Cup 2026 · AI Assistant
              </span>
            </div>
          </div>

          <nav
            className="header__controls"
            role="navigation"
            aria-label="Settings"
          >
            <div
              className="lang-select"
              role="group"
              aria-label="Select language"
            >
              {(["en", "es", "fr", "hi"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  id={`lang-${lang}`}
                  className={`lang-btn${language === lang ? " lang-btn--active" : ""}`}
                  aria-pressed={language === lang}
                  onClick={() => setLanguage(lang)}
                >
                  {lang === "en"
                    ? "🇺🇸 EN"
                    : lang === "es"
                      ? "🇪🇸 ES"
                      : lang === "fr"
                        ? "🇫🇷 FR"
                        : "🇮🇳 HI"}
                </button>
              ))}
            </div>

            <button
              id="access-toggle"
              className="icon-btn"
              aria-pressed={accessibilityMode}
              aria-label="Toggle accessibility mode"
              title="Accessibility mode"
              onClick={() => setAccessibility((v) => !v)}
            >
              ♿
            </button>

            {user ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "User"}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "1px solid var(--accent-primary)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--accent-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                    }}
                  >
                    {(user.displayName ?? user.email ?? "U")
                      .substring(0, 1)
                      .toUpperCase()}
                  </div>
                )}
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => logout()}
                  aria-label="Sign out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="btn btn--primary btn--sm"
                onClick={() => setLoginOpen(true)}
                aria-label="Sign in"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main id="main-content" className="main" role="main">
        <div className="layout">
          {/* ── Left panel ─────────────────────────────────────────────── */}
          <aside className="panel panel--left" aria-label="Stadium status">
            <CrowdPanel stadiumId={stadiumId} language={language} />

            <section className="card" aria-labelledby="stadium-heading">
              <h2 id="stadium-heading" className="card__title">
                <span aria-hidden="true">🏟️</span> Venue
              </h2>
              <select
                id="stadium-select"
                className="select"
                aria-label="Select stadium"
                value={stadiumId}
                onChange={(e) => setStadiumId(e.target.value)}
              >
                {STADIUMS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </section>
          </aside>

          {/* ── Center panel (Map + Chat tabs) ─────────────────────────── */}
          <div className="panel panel--center">
            {/* Tab bar */}
            <div className="tab-bar" role="tablist" aria-label="Main view">
              <button
                role="tab"
                aria-selected={activeTab === "map"}
                className={`tab-btn${activeTab === "map" ? " tab-btn--active" : ""}`}
                onClick={() => setActiveTab("map")}
              >
                <span aria-hidden="true">🗺️</span> Stadium Map
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "chat"}
                className={`tab-btn${activeTab === "chat" ? " tab-btn--active" : ""}`}
                onClick={() => setActiveTab("chat")}
              >
                <span aria-hidden="true">💬</span> AI Chat
              </button>
            </div>

            {/* Tab content */}
            <div className="tab-content" role="tabpanel">
              {activeTab === "map" ? (
                <div className="map-view">
                  <StadiumMap zones={crowdZones} onPOIClick={handlePOIClick} />
                  <FloatingSuggestions onSend={handleSuggestion} />
                </div>
              ) : (
                <ChatPanel
                  stadiumId={stadiumId}
                  language={language}
                  accessibilityMode={accessibilityMode}
                  externalQuery={chatQuery}
                  onQueryConsumed={() => setChatQuery("")}
                />
              )}
            </div>
          </div>

          {/* ── Right panel ────────────────────────────────────────────── */}
          <aside className="panel panel--right" aria-label="Navigation planner">
            <NavPanel stadiumId={stadiumId} language={language} />
          </aside>
        </div>
      </main>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <StatsBar />

      {/* ── SOS Button ─────────────────────────────────────────────────── */}
      <SOSButton />

      {/* ── Login Modal ────────────────────────────────────────────────── */}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="footer" role="contentinfo">
        <p>
          StadiumGPT &copy; 2026 &nbsp;&middot;&nbsp; Powered by{" "}
          <strong>Google Gemini</strong> &nbsp;&middot;&nbsp;
          <a href="/google-services" className="footer__link">
            Google Services
          </a>{" "}
          &nbsp;&middot;&nbsp;
          <a href="/admin" className="footer__link">
            Admin
          </a>{" "}
          &nbsp;&middot;&nbsp;
          <a href="/api/health" className="footer__link">
            Health
          </a>
        </p>
      </footer>
    </div>
  );
}
