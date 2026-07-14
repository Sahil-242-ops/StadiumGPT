'use client';

import { useState, useEffect, useRef } from 'react';
import { StadiumStats } from '@/types';
import { getStats } from '@/lib/api';

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display.toLocaleString()}{suffix}</>;
}

export default function StatsBar() {
  const [stats, setStats] = useState<StadiumStats | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch { /* silent */ }
    };
    void fetch();
    const timer = setInterval(() => void fetch(), 30000);
    return () => clearInterval(timer);
  }, []);

  if (!stats) return null;

  const items = [
    { icon: '👥', label: 'Visitors Today',  value: stats.visitors_today, suffix: '' },
    { icon: '⏱',  label: 'Avg Wait',        value: stats.avg_wait_minutes, suffix: ' min' },
    { icon: '🅿', label: 'Parking',          value: stats.parking_pct, suffix: '%' },
    { icon: '🌱', label: 'Carbon Saved',     value: stats.carbon_saved_tons, suffix: ' T' },
    { icon: '💧', label: 'Water Saved',      value: stats.water_saved_litres, suffix: ' L' },
  ];

  return (
    <div className="stats-bar" role="region" aria-label="Stadium statistics">
      {items.map((item) => (
        <div key={item.label} className="stats-bar__item">
          <span className="stats-bar__icon" aria-hidden="true">{item.icon}</span>
          <div className="stats-bar__content">
            <span className="stats-bar__value">
              <AnimatedNumber value={item.value} suffix={item.suffix} />
            </span>
            <span className="stats-bar__label">{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
