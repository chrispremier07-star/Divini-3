/**
 * DIVINI exo — Apparence (thème + densité)
 *
 * Thème sombre par défaut au premier chargement (décision 2026-08-28).
 * Le thème clair est une bascule, pas une autre direction artistique.
 *
 * La préférence est persistée dans localStorage et posée sur <html> avant
 * le premier paint pour éviter tout flash de thème.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import {
  defaultDensity,
  defaultTheme,
  themeNames,
  type DensityName,
  type ThemeName
} from '@divini/design-tokens';

const STORAGE_KEY = 'divini.appearance';

type Appearance = {
  theme: ThemeName;
  density: DensityName;
};

type AppearanceContextValue = Appearance & {
  setTheme: (theme: ThemeName) => void;
  setDensity: (density: DensityName) => void;
  toggleTheme: () => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

const FALLBACK: Appearance = {
  theme: defaultTheme as ThemeName,
  density: defaultDensity as DensityName
};

function readStored(): Appearance {
  if (typeof window === 'undefined') return FALLBACK;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return FALLBACK;
    const parsed = JSON.parse(raw) as Partial<Appearance>;
    const theme = themeNames.includes(parsed.theme as ThemeName)
      ? (parsed.theme as ThemeName)
      : FALLBACK.theme;
    const density =
      parsed.density === 'compact' || parsed.density === 'comfortable'
        ? parsed.density
        : FALLBACK.density;
    return { theme, density };
  } catch {
    return FALLBACK;
  }
}

/**
 * Applique les attributs sur <html>. Séparé du provider pour pouvoir être
 * appelé aussi depuis le script anti-flash.
 */
export function applyAppearance({ theme, density }: Appearance) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-density', density);
}

/**
 * Script injecté dans <head> : lit la préférence avant le premier paint.
 * Écrit en JS brut volontairement — il s'exécute avant l'hydratation React.
 */
export const ANTI_FLASH_SCRIPT = `(function(){try{var k='divini.appearance';var s=localStorage.getItem(k);var t='dark';var d='comfortable';if(s){var p=JSON.parse(s);if(p.theme==='light'||p.theme==='dark')t=p.theme;if(p.density==='compact'||p.density==='comfortable')d=p.density;}var r=document.documentElement;r.setAttribute('data-theme',t);r.setAttribute('data-density',d);}catch(e){var r=document.documentElement;r.setAttribute('data-theme','dark');r.setAttribute('data-density','comfortable');}})();`;

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance>(FALLBACK);

  useEffect(() => {
    const stored = readStored();
    setAppearance(stored);
    applyAppearance(stored);
  }, []);

  const persist = useCallback((next: Appearance) => {
    setAppearance(next);
    applyAppearance(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* stockage indisponible : la préférence ne sera pas mémorisée */
    }
  }, []);

  const value = useMemo<AppearanceContextValue>(
    () => ({
      theme: appearance.theme,
      density: appearance.density,
      setTheme: (theme) => persist({ ...appearance, theme }),
      setDensity: (density) => persist({ ...appearance, density }),
      toggleTheme: () =>
        persist({ ...appearance, theme: appearance.theme === 'dark' ? 'light' : 'dark' })
    }),
    [appearance, persist]
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error('useAppearance doit être utilisé dans <AppearanceProvider>.');
  }
  return ctx;
}
