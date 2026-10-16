'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { NasaqState, Project } from './seed';
import { getInitialState } from './seed';
import {
  readStorage,
  useStoreMutations,
  writeStorage,
} from './store-core';
import type { ModuleId } from './modules';

export { useUiPreferences, useToasts } from './store-core';
export type { Toast } from './store-core';

type StoreValue = {
  state: NasaqState;
  /** Active project, or null while on the landing / admin screens. */
  project: Project | null;
  setActiveProject: (id: string) => void;
  /** Patch the active project. */
  patchProject: (patch: Partial<Project>) => void;
  /** Patch any project by id. */
  patchProjectById: (id: string, patch: Partial<Project>) => void;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  /** Platform-level patches (settings, plans, subscribers, providers, …). */
  patchPlatform: (patch: Partial<NasaqState>) => void;
  setUserSettings: (patch: Partial<NasaqState['userSettings']>) => void;
  setPlatformSettings: (patch: Partial<NasaqState['platformSettings']>) => void;
  resetAll: () => void;
  enabledModules: ModuleId[];
};

const StoreContext = createContext<StoreValue | null>(null);

export function NasaqProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NasaqState>(() => getInitialState());
  const [hydrated, setHydrated] = useState(false);

  const set = useMemo(
    () => (fn: (s: NasaqState) => NasaqState) => setState((s) => fn(s)),
    []
  );

  // Hydrate from localStorage once on mount (client only).
  useEffect(() => {
    const stored = readStorage();
    if (stored) setState(stored);
    setHydrated(true);
  }, []);

  // Persist after hydration, not on the very first server-ish render.
  useEffect(() => {
    if (hydrated) writeStorage(state);
  }, [state, hydrated]);

  const mutations = useStoreMutations(state, set);

  const value = useMemo<StoreValue>(() => {
    const project = state.projects.find((p) => p.id === state.activeProjectId) ?? null;
    return {
      state,
      project,
      enabledModules: (project?.enabledModules ?? []) as ModuleId[],
      ...mutations,
    };
  }, [state, mutations]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useNasaq(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useNasaq must be used inside <NasaqProvider>');
  return ctx;
}
