import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
export interface Preferences { textSize: 'standard' | 'large' | 'extra-large'; highContrast: boolean; reduceMotion: boolean }
export const defaultPreferences: Preferences = { textSize: 'standard', highContrast: false, reduceMotion: false };
const storageKey = 'alaga-accessibility-v1';
export function readPreferences(): Preferences {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    return { textSize: ['standard', 'large', 'extra-large'].includes(data?.textSize) ? data.textSize : 'standard', highContrast: data?.highContrast === true, reduceMotion: data?.reduceMotion === true };
  } catch { return defaultPreferences; }
}
const Context = createContext<{ preferences: Preferences; update: (values: Partial<Preferences>) => void } | null>(null);
export function usePreferences() { const state = useContext(Context); if (!state) throw new Error('Preferences provider is missing'); return state; }
export default function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = preferences.textSize;
    root.dataset.contrast = String(preferences.highContrast);
    root.dataset.reduceMotion = String(preferences.reduceMotion);
    try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch { /* Preferences still work when browser storage is unavailable. */ }
  }, [preferences]);
  return <Context.Provider value={{ preferences, update: values => setPreferences(previous => ({ ...previous, ...values })) }}>{children}</Context.Provider>;
}
