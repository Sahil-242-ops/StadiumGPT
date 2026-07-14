// StadiumGPT — useNavigate hook
// Manages route planning form state and API calls
import { useState, useCallback } from 'react';
import { NavigateResponse, Language } from '@/types';
import { navigateService } from '@/services/navigate.service';

interface UseNavigateOptions {
  stadiumId: string;
  language: Language;
}

export function useNavigate({ stadiumId, language }: UseNavigateOptions) {
  const [fromGate, setFromGate]   = useState('A');
  const [toSection, setToSection] = useState('B2');
  const [stepFree, setStepFree]   = useState(false);
  const [result, setResult]       = useState<NavigateResponse | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const getRoute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await navigateService.getRoute({
        from_gate: fromGate,
        to_section: toSection,
        stadium_id: stadiumId,
        step_free: stepFree,
        language,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get route');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [fromGate, toSection, stadiumId, stepFree, language]);

  return {
    fromGate, setFromGate,
    toSection, setToSection,
    stepFree, setStepFree,
    result, loading, error,
    getRoute,
  };
}
