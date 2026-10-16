'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NasaqState, Project } from './seed';
import { getInitialState } from './seed';
import { BRAND } from './config';
import type { ModuleId } from './modules';

/* ==========================================================================
   Storage — same key/behaviour as the mockup's localStorage engine
   ========================================================================== */

export function readStorage(): NasaqState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BRAND.storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NasaqState & { schemaVersion?: number };
    if (parsed.schemaVersion !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStorage(state: NasaqState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BRAND.storageKey, JSON.stringify(state));
  } catch {
    // storage full/blocked — keep in-memory state
  }
}

/* ==========================================================================
   Store value contract — mutations shared by the provider (store.tsx)
   ========================================================================== */

export function useStoreMutations(state: NasaqState, set: (fn: (s: NasaqState) => NasaqState) => void) {
  const setActiveProject = useCallback(
    (id: string) => set((s) => ({ ...s, activeProjectId: id })),
    [set]
  );

  const patchProject = useCallback(
    (patch: Partial<Project>) =>
      set((s) => ({
        ...s,
        projects: s.projects.map((p) => (p.id === s.activeProjectId ? { ...p, ...patch } : p)),
      })),
    [set]
  );

  const patchProjectById = useCallback(
    (id: string, patch: Partial<Project>) =>
      set((s) => ({
        ...s,
        projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      })),
    [set]
  );

  const addProject = useCallback(
    (project: Project) =>
      set((s) => ({ ...s, projects: [...s.projects, project], activeProjectId: project.id })),
    [set]
  );

  const deleteProject = useCallback(
    (id: string) =>
      set((s) => {
        const projects = s.projects.filter((p) => p.id !== id);
        return {
          ...s,
          projects,
          activeProjectId: s.activeProjectId === id ? (projects[0]?.id ?? '') : s.activeProjectId,
        };
      }),
    [set]
  );

  const patchPlatform = useCallback((patch: Partial<NasaqState>) => set((s) => ({ ...s, ...patch })), [set]);

  const setUserSettings = useCallback(
    (patch: Partial<NasaqState['userSettings']>) =>
      set((s) => ({ ...s, userSettings: { ...s.userSettings, ...patch } })),
    [set]
  );

  const setPlatformSettings = useCallback(
    (patch: Partial<NasaqState['platformSettings']>) =>
      set((s) => ({ ...s, platformSettings: { ...s.platformSettings, ...patch } })),
    [set]
  );

  const resetAll = useCallback(() => set(getInitialState), [set]);

  return {
    setActiveProject,
    patchProject,
    patchProjectById,
    addProject,
    deleteProject,
    patchPlatform,
    setUserSettings,
    setPlatformSettings,
    resetAll,
  };
}

/* ==========================================================================
   UI state — theme density/font size + toasts (mirrors the mockup)
   ========================================================================== */

export function useUiPreferences() {
  const [density, setDensity] = useState<'normal' | 'compact' | 'spacious'>('normal');
  const [fontSize, setFontSize] = useState<'normal' | 'small' | 'large'>('normal');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.dataset.density = density;
    document.body.dataset.fontsize = fontSize;
  }, [density, fontSize]);

  return { density, fontSize, setDensity, setFontSize };
}

export type Toast = { id: string; type: 'success' | 'warning' | 'danger'; message: string };

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((type: Toast['type'], message: string) => {
    const id = `tst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((t) => [...t, { id, type, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return { toasts, push, dismiss };
}

/* ==========================================================================
   Enabled-module helpers (used by the sidebar and module-settings)
   ========================================================================== */

export function useEnabledModulesFor(enabledModules: string[] | undefined): ModuleId[] {
  return useMemo(() => (enabledModules ?? []) as ModuleId[], [enabledModules]);
}
