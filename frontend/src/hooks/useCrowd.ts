// StadiumGPT — useCrowd hook
// Fetches and manages live crowd data with auto-refresh
import { useState, useCallback, useEffect } from "react";
import { CrowdZone, CrowdLevel } from "@/types";
import { crowdService } from "@/services/crowd.service";

interface UseCrowdOptions {
  stadiumId: string;
  autoRefreshMs?: number; // 0 = disabled
}

interface CrowdState {
  zones: CrowdZone[];
  overall: CrowdLevel;
  summary: string;
  loading: boolean;
  lastUpdated: Date | null;
}

export function useCrowd({ stadiumId, autoRefreshMs = 0 }: UseCrowdOptions) {
  const [state, setState] = useState<CrowdState>({
    zones: [],
    overall: "moderate",
    summary: "",
    loading: false,
    lastUpdated: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const data = await crowdService.get({ stadium_id: stadiumId });
      setState({
        zones: data.zones,
        overall: data.overall_level,
        summary: data.gemini_summary,
        loading: false,
        lastUpdated: new Date(),
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [stadiumId]);

  // Initial fetch on mount / stadiumId change
  useEffect(() => {
    void fetch();
  }, [fetch]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefreshMs) return;
    const timer = setInterval(() => void fetch(), autoRefreshMs);
    return () => clearInterval(timer);
  }, [fetch, autoRefreshMs]);

  return { ...state, refresh: fetch };
}
