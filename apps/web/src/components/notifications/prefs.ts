/**
 * DIVINI exo — Préférences de notification (LOT 04 §2.2.4)
 *
 * Persistées **localement** uniquement (interdit n°4 : aucune donnée sensible dans
 * le navigateur). Le stockage est un simple réglage d'interface ; il n'est jamais
 * présenté comme une donnée critique.
 *
 * SSR-sûr : l'état initial est la valeur par défaut côté serveur ET client ; la
 * lecture de `localStorage` se fait dans un effet, après l'hydratation (même motif
 * que `AppearanceProvider`).
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  type NotificationCategory,
  type NotificationChannel
} from './types';

export const NOTIFICATION_PREFS_KEY = 'divini.notifications.prefs';

export type NotificationPrefs = {
  channels: Record<NotificationChannel, boolean>;
  categories: Record<NotificationCategory, boolean>;
};

export const DEFAULT_PREFS: NotificationPrefs = {
  channels: { 'in-app': true, email: false, push: false, whatsapp: false, sms: false },
  categories: Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c, true])) as Record<
    NotificationCategory,
    boolean
  >
};

function readStored(): NotificationPrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    return {
      channels: { ...DEFAULT_PREFS.channels, ...(parsed.channels ?? {}) },
      categories: { ...DEFAULT_PREFS.categories, ...(parsed.categories ?? {}) }
    };
  } catch {
    return null;
  }
}

function writeStored(prefs: NotificationPrefs): boolean {
  try {
    window.localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}

export type PrefsStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [status, setStatus] = useState<PrefsStatus>('idle');
  const timer = useRef<number | undefined>(undefined);
  // Réflecteur pour éviter les fermetures périmées dans les callbacks.
  const prefsRef = useRef(prefs);

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  useEffect(() => {
    const stored = readStored();
    if (stored) setPrefs(stored);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const persist = useCallback((next: NotificationPrefs) => {
    setPrefs(next);
    setStatus('saving');
    // Écriture locale synchrone, mais on laisse un battement pour l'état « enregistré ».
    timer.current = window.setTimeout(() => {
      setStatus(writeStored(next) ? 'saved' : 'error');
    }, 250);
  }, []);

  const setChannel = useCallback(
    (channel: NotificationChannel, enabled: boolean) =>
      persist({ ...prefsRef.current, channels: { ...prefsRef.current.channels, [channel]: enabled } }),
    [persist]
  );

  const setCategory = useCallback(
    (category: NotificationCategory, enabled: boolean) =>
      persist({
        ...prefsRef.current,
        categories: { ...prefsRef.current.categories, [category]: enabled }
      }),
    [persist]
  );

  const reset = useCallback(() => persist(DEFAULT_PREFS), [persist]);

  return useMemo(
    () => ({ prefs, status, setChannel, setCategory, reset }),
    [prefs, status, setChannel, setCategory, reset]
  );
}
