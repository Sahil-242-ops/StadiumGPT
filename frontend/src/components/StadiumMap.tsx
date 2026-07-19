"use client";

import { useState } from "react";
import { CrowdZone, CrowdLevel, MapPOI } from "@/types";

interface StadiumMapProps {
  zones: CrowdZone[];
  pois?: MapPOI[];
  activeRoute?: { from: string; to: string } | null;
  onPOIClick?: (poi: MapPOI) => void;
}

const ZONE_COLORS: Record<CrowdLevel, string> = {
  low: "hsla(152, 70%, 45%, 0.35)",
  moderate: "hsla(45, 100%, 55%, 0.30)",
  high: "hsla(25, 100%, 58%, 0.35)",
  critical: "hsla(4, 90%, 58%, 0.40)",
};

const DEFAULT_POIS: MapPOI[] = [
  {
    id: "gate_a",
    type: "gate",
    label: "Gate A",
    x: 50,
    y: 4,
    icon: "🚪",
    accessible: true,
  },
  { id: "gate_b", type: "gate", label: "Gate B", x: 93, y: 50, icon: "🚪" },
  {
    id: "gate_c",
    type: "gate",
    label: "Gate C",
    x: 50,
    y: 96,
    icon: "🚪",
    accessible: true,
  },
  {
    id: "gate_d",
    type: "gate",
    label: "Gate D",
    x: 7,
    y: 50,
    icon: "🚪",
    accessible: true,
  },
  { id: "med_1", type: "medical", label: "Medical", x: 22, y: 20, icon: "🏥" },
  {
    id: "med_2",
    type: "medical",
    label: "First Aid",
    x: 78,
    y: 80,
    icon: "🏥",
  },
  {
    id: "rest_1",
    type: "restroom",
    label: "Restroom",
    x: 20,
    y: 75,
    icon: "🚻",
    accessible: true,
  },
  {
    id: "rest_2",
    type: "restroom",
    label: "Restroom",
    x: 80,
    y: 25,
    icon: "🚻",
    accessible: true,
  },
  { id: "food_1", type: "food", label: "Food Court", x: 30, y: 88, icon: "🍔" },
  {
    id: "food_2",
    type: "food",
    label: "Concessions",
    x: 70,
    y: 12,
    icon: "🍕",
  },
  {
    id: "park_1",
    type: "parking",
    label: "Parking A",
    x: 12,
    y: 12,
    icon: "🅿",
    accessible: true,
  },
  {
    id: "park_2",
    type: "parking",
    label: "Parking B",
    x: 88,
    y: 88,
    icon: "🅿",
  },
  {
    id: "pray_1",
    type: "prayer",
    label: "Prayer Room",
    x: 15,
    y: 45,
    icon: "🕌",
  },
  { id: "info_1", type: "info", label: "Info Desk", x: 50, y: 15, icon: "ℹ️" },
];

// Zone SVG sections of the stadium
const ZONE_PATHS: { name: string; path: string }[] = [
  { name: "North Stand", path: "M 25 15 Q 50 5 75 15 L 70 30 Q 50 22 30 30 Z" },
  {
    name: "South Stand",
    path: "M 25 85 Q 50 95 75 85 L 70 70 Q 50 78 30 70 Z",
  },
  {
    name: "East Stand",
    path: "M 75 15 Q 90 30 90 50 Q 90 70 75 85 L 70 70 Q 80 60 80 50 Q 80 40 70 30 Z",
  },
  {
    name: "West Stand",
    path: "M 25 15 Q 10 30 10 50 Q 10 70 25 85 L 30 70 Q 20 60 20 50 Q 20 40 30 30 Z",
  },
  { name: "VIP Lounge", path: "M 38 38 L 62 38 L 62 50 L 38 50 Z" },
  { name: "Concourse A", path: "M 38 50 L 62 50 L 62 62 L 38 62 Z" },
];

export default function StadiumMap({
  zones,
  pois,
  activeRoute,
  onPOIClick,
}: StadiumMapProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);

  const allPois = pois ?? DEFAULT_POIS;

  const getZoneColor = (zoneName: string) => {
    const zone = zones.find((z) => z.zone === zoneName);
    return zone ? ZONE_COLORS[zone.level] : "hsla(215, 20%, 40%, 0.15)";
  };

  const getZoneInfo = (zoneName: string) => {
    return zones.find((z) => z.zone === zoneName);
  };

  return (
    <div
      className="stadium-map"
      role="img"
      aria-label="Interactive stadium map showing crowd levels and facilities"
    >
      <svg
        viewBox="0 0 100 100"
        className="stadium-map__svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Stadium outer shape */}
        <ellipse
          cx="50"
          cy="50"
          rx="45"
          ry="46"
          fill="var(--bg-card)"
          stroke="var(--glass-border)"
          strokeWidth="0.5"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="42"
          ry="43"
          fill="none"
          stroke="var(--glass-border)"
          strokeWidth="0.3"
          strokeDasharray="1,1"
        />

        {/* Zone sections with crowd heatmap */}
        {ZONE_PATHS.map(({ name, path }) => {
          const info = getZoneInfo(name);
          return (
            <g key={name}>
              <path
                d={path}
                fill={getZoneColor(name)}
                stroke={
                  hoveredZone === name
                    ? "var(--accent-primary)"
                    : "var(--glass-border)"
                }
                strokeWidth={hoveredZone === name ? "0.6" : "0.3"}
                className="stadium-map__zone"
                onMouseEnter={(e) => {
                  setHoveredZone(name);
                  const rect = (e.target as SVGElement).getBoundingClientRect();
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                    label: info
                      ? `${name}: ${info.occupancy_pct}% (${info.level})`
                      : name,
                  });
                }}
                onMouseLeave={() => {
                  setHoveredZone(null);
                  setTooltip(null);
                }}
              />
              {/* Zone label */}
              {info && (
                <text
                  x={
                    name === "North Stand"
                      ? 50
                      : name === "South Stand"
                        ? 50
                        : name === "East Stand"
                          ? 82
                          : name === "West Stand"
                            ? 18
                            : name === "VIP Lounge"
                              ? 50
                              : 50
                  }
                  y={
                    name === "North Stand"
                      ? 23
                      : name === "South Stand"
                        ? 78
                        : name === "East Stand"
                          ? 50
                          : name === "West Stand"
                            ? 50
                            : name === "VIP Lounge"
                              ? 45
                              : 57
                  }
                  textAnchor="middle"
                  className="stadium-map__zone-label"
                  fontSize="2.2"
                  fill="var(--text-secondary)"
                >
                  {info.occupancy_pct}%
                </text>
              )}
            </g>
          );
        })}

        {/* Playing field */}
        <rect
          x="35"
          y="35"
          width="30"
          height="30"
          rx="3"
          fill="hsla(120, 40%, 25%, 0.3)"
          stroke="hsla(120, 60%, 40%, 0.4)"
          strokeWidth="0.3"
        />
        <line
          x1="50"
          y1="35"
          x2="50"
          y2="65"
          stroke="hsla(120, 60%, 40%, 0.3)"
          strokeWidth="0.2"
        />
        <circle
          cx="50"
          cy="50"
          r="4"
          fill="none"
          stroke="hsla(120, 60%, 40%, 0.3)"
          strokeWidth="0.2"
        />
        <text
          x="50"
          y="51"
          textAnchor="middle"
          fontSize="2"
          fill="hsla(120, 60%, 40%, 0.6)"
          fontWeight="600"
        >
          PITCH
        </text>

        {/* Active route line */}
        {activeRoute && (
          <line
            x1="50"
            y1="4"
            x2="50"
            y2="50"
            stroke="var(--accent-primary)"
            strokeWidth="0.8"
            strokeDasharray="2,1"
            className="stadium-map__route-line"
          />
        )}

        {/* POI markers */}
        {allPois.map((poi) => (
          <g
            key={poi.id}
            className="stadium-map__poi"
            onClick={() => onPOIClick?.(poi)}
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={poi.x}
              cy={poi.y}
              r="2.5"
              fill="var(--bg-surface)"
              stroke={
                poi.accessible ? "var(--accent-green)" : "var(--glass-border)"
              }
              strokeWidth="0.4"
              className="stadium-map__poi-bg"
            />
            <text
              x={poi.x}
              y={poi.y + 0.8}
              textAnchor="middle"
              fontSize="2.5"
              className="stadium-map__poi-icon"
            >
              {poi.icon}
            </text>
            {poi.accessible && (
              <circle
                cx={poi.x + 2}
                cy={poi.y - 2}
                r="0.8"
                fill="var(--accent-green)"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip overlay */}
      {tooltip && (
        <div
          className="stadium-map__tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}

      {/* Legend */}
      <div className="stadium-map__legend">
        <span className="legend-item">
          <span
            className="legend-dot"
            style={{ background: "var(--crowd-low)" }}
          />{" "}
          Low
        </span>
        <span className="legend-item">
          <span
            className="legend-dot"
            style={{ background: "var(--crowd-moderate)" }}
          />{" "}
          Medium
        </span>
        <span className="legend-item">
          <span
            className="legend-dot"
            style={{ background: "var(--crowd-high)" }}
          />{" "}
          High
        </span>
        <span className="legend-item">
          <span
            className="legend-dot"
            style={{ background: "var(--crowd-critical)" }}
          />{" "}
          Critical
        </span>
      </div>
    </div>
  );
}
