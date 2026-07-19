"use client";
// StadiumGPT — AppStore (React Context)
// Global app-level state: language, stadium, accessibility mode
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Language } from "@/types";

interface AppState {
  language: Language;
  stadiumId: string;
  accessibilityMode: boolean;
  srMode: boolean;
}

interface AppActions {
  setLanguage: (lang: Language) => void;
  setStadiumId: (id: string) => void;
  toggleAccessibility: () => void;
  toggleSrMode: () => void;
}

const defaultState: AppState = {
  language: "en",
  stadiumId: "met_life",
  accessibilityMode: false,
  srMode: false,
};

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const setLanguage = useCallback(
    (language: Language) => setState((s) => ({ ...s, language })),
    [],
  );
  const setStadiumId = useCallback(
    (stadiumId: string) => setState((s) => ({ ...s, stadiumId })),
    [],
  );
  const toggleAccessibility = useCallback(
    () => setState((s) => ({ ...s, accessibilityMode: !s.accessibilityMode })),
    [],
  );
  const toggleSrMode = useCallback(
    () => setState((s) => ({ ...s, srMode: !s.srMode })),
    [],
  );

  return (
    <AppContext.Provider
      value={{
        ...state,
        setLanguage,
        setStadiumId,
        toggleAccessibility,
        toggleSrMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx)
    throw new Error("useAppStore must be used inside <AppStoreProvider>");
  return ctx;
}
