'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserSettings } from '@/types/settings'

interface SettingsStore {
  settings: UserSettings
  updateSettings: (settings: Partial<UserSettings>) => void
  resetSettings: () => void
}

const defaultSettings: UserSettings = {
  export: {
    format: 'epub',
    includeCover: true,
    includeTableOfContents: true,
    defaultLanguage: 'en',
  },
  defaultMetadata: {
    author: 'neilmcardle',
    language: 'en',
  },
  theme: 'system',
  autosaveInterval: 5,
  lastModified: '2025-05-21 12:52:31'
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) => 
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
            lastModified: '2025-05-21 12:52:31'
          }
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'user-settings'
    }
  )
)