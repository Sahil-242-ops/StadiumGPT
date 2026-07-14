// StadiumGPT — API client (typed fetch wrappers for the Express backend)
import {
  ChatResponse,
  NavigateResponse,
  CrowdResponse,
  SOSRequest,
  SOSResponse,
  StadiumStats,
  AIInsight,
  Language,
} from '@/types';

const API_BASE =
  typeof window !== 'undefined'
    ? '' // use Next.js proxy rewrite in browser
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080');

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Chat ───────────────────────────────────────────────────────────────────

export async function sendChat(params: {
  message: string;
  language?: Language;
  stadium_id?: string;
  section?: string;
  accessibility_mode?: boolean;
}): Promise<ChatResponse> {
  return post<ChatResponse>('/api/chat', {
    language: 'en',
    stadium_id: 'met_life',
    accessibility_mode: false,
    ...params,
  });
}

// ── Navigate ───────────────────────────────────────────────────────────────

export async function getRoute(params: {
  from_gate: string;
  to_section: string;
  stadium_id?: string;
  step_free?: boolean;
  language?: Language;
}): Promise<NavigateResponse> {
  return post<NavigateResponse>('/api/navigate', {
    stadium_id: 'met_life',
    step_free: false,
    language: 'en',
    ...params,
  });
}

// ── Crowd ──────────────────────────────────────────────────────────────────

export async function getCrowd(params: {
  stadium_id?: string;
  section?: string;
}): Promise<CrowdResponse> {
  return post<CrowdResponse>('/api/crowd', {
    stadium_id: 'met_life',
    ...params,
  });
}

// ── SOS ────────────────────────────────────────────────────────────────────

export async function sendSOS(params: SOSRequest): Promise<SOSResponse> {
  return post<SOSResponse>('/api/sos', {
    stadium_id: 'met_life',
    ...params,
  });
}

// ── Stats ──────────────────────────────────────────────────────────────────

export async function getStats(): Promise<StadiumStats> {
  return get<StadiumStats>('/api/stats');
}

// ── Insights ───────────────────────────────────────────────────────────────

export async function getInsight(): Promise<AIInsight> {
  return get<AIInsight>('/api/insights');
}

// ── Health ─────────────────────────────────────────────────────────────────

export async function getHealth(): Promise<{
  status: string;
  version: string;
  gemini_available: boolean;
}> {
  return get('/health');
}
