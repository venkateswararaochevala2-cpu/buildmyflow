import { create } from 'zustand';

export interface AppSettings {
  defaultZoom: number;
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  showMinimap: boolean;
  autosaveEnabled: boolean;
  autosaveDelayMs: number;
  confirmDelete: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultZoom: 1,
  snapToGrid: true,
  gridSize: 20,
  showGrid: true,
  showMinimap: true,
  autosaveEnabled: true,
  autosaveDelayMs: 2500,
  confirmDelete: true,
};

const STORAGE_KEY = 'flow_builder_user_settings';

function loadPersistedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface SettingsStore extends AppSettings {
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...loadPersistedSettings(),

  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save settings to localStorage', err);
      }
      return updated;
    });
  },

  resetSettings: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear settings from localStorage', err);
    }
    set({ ...DEFAULT_SETTINGS });
  },
}));
