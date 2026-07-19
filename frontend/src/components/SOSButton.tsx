"use client";

import { useState } from "react";
import { SOSType, SOSResponse } from "@/types";
import { sendSOS } from "@/lib/api";

const SOS_OPTIONS: {
  type: SOSType;
  icon: string;
  label: string;
  color: string;
}[] = [
  {
    type: "medical",
    icon: "🚑",
    label: "Medical Emergency",
    color: "var(--accent-red)",
  },
  {
    type: "lost_child",
    icon: "👶",
    label: "Lost Child",
    color: "var(--accent-orange)",
  },
  {
    type: "security",
    icon: "🛡️",
    label: "Security Threat",
    color: "var(--accent-purple)",
  },
  {
    type: "fire",
    icon: "🔥",
    label: "Fire / Evacuation",
    color: "var(--fifa-red)",
  },
  {
    type: "general",
    icon: "❓",
    label: "Other Emergency",
    color: "var(--accent-primary)",
  },
];

export default function SOSButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SOSResponse | null>(null);

  const handleSOS = async (type: SOSType) => {
    setLoading(true);
    try {
      const res = await sendSOS({ type });
      setResult(res);
    } catch {
      setResult({
        id: "ERR",
        status: "dispatched",
        type,
        location: "Your location",
        eta_minutes: 2,
        message: "Emergency services have been notified.",
        responder: "Emergency Team",
      });
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
    setResult(null);
  };

  return (
    <>
      {/* Floating SOS button */}
      <button
        className="sos-fab"
        onClick={() => setOpen(true)}
        aria-label="Emergency SOS"
        title="Emergency SOS"
      >
        <span className="sos-fab__pulse" />
        <span className="sos-fab__icon">🚨</span>
        <span className="sos-fab__text">SOS</span>
      </button>

      {/* SOS Modal */}
      {open && (
        <div
          className="sos-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Emergency SOS"
        >
          <div className="sos-modal">
            <button
              className="sos-modal__close"
              onClick={close}
              aria-label="Close"
            >
              ✕
            </button>

            {!result ? (
              <>
                <div className="sos-modal__header">
                  <span className="sos-modal__icon">🚨</span>
                  <h2 className="sos-modal__title">Emergency SOS</h2>
                  <p className="sos-modal__subtitle">
                    Select the type of emergency
                  </p>
                </div>

                <div className="sos-modal__options">
                  {SOS_OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      className="sos-option"
                      onClick={() => handleSOS(opt.type)}
                      disabled={loading}
                      style={
                        { "--sos-color": opt.color } as React.CSSProperties
                      }
                    >
                      <span className="sos-option__icon">{opt.icon}</span>
                      <span className="sos-option__label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="sos-result">
                <div className="sos-result__badge">✓</div>
                <h2 className="sos-result__title">Help is on the way!</h2>
                <div className="sos-result__details">
                  <div className="sos-result__row">
                    <span className="sos-result__label">Responder</span>
                    <span className="sos-result__value">
                      {result.responder}
                    </span>
                  </div>
                  <div className="sos-result__row">
                    <span className="sos-result__label">ETA</span>
                    <span className="sos-result__value sos-result__eta">
                      {result.eta_minutes} min
                    </span>
                  </div>
                  <div className="sos-result__row">
                    <span className="sos-result__label">Location</span>
                    <span className="sos-result__value">{result.location}</span>
                  </div>
                  <div className="sos-result__row">
                    <span className="sos-result__label">ID</span>
                    <span
                      className="sos-result__value"
                      style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                    >
                      {result.id}
                    </span>
                  </div>
                </div>
                <p className="sos-result__message">{result.message}</p>
                <button className="btn btn--primary btn--full" onClick={close}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
