import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReadingPreferences } from '../types'
import { preferencesApi } from '../services/preferences'

interface PreferenceState extends ReadingPreferences {
  isLoading: boolean

  updatePreference: <K extends keyof ReadingPreferences>(
    key: K,
    value: ReadingPreferences[K]
  ) => Promise<void>
  applyTheme: () => void
  resetToDefaults: () => void
  loadPreferences: () => Promise<void>
}

const defaultPreferences: ReadingPreferences = {
  id: '',
  userId: '',
  font: 'Lexend',
  fontSize: 20,
  letterSpacing: 0.12,
  lineHeight: 1.6,
  theme: 'cream',
  focusMode: false,
  speechSpeed: 1.0,
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,
      isLoading: false,

      updatePreference: async (key, value) => {
        // Optimistic update
        const oldValue = get()[key]
        set({ [key]: value })

        // Apply theme immediately if changed
        if (key === 'theme') {
          get().applyTheme()
        }

        try {
          const updated = await preferencesApi.updatePreferences({ [key]: value })
          set(updated)
        } catch (error) {
          console.error('Failed to save preference:', error)
          // Revert on error
          set({ [key]: oldValue })
        }
      },

      applyTheme: () => {
        const { theme } = get()
        const root = document.documentElement

        // Remove all theme classes
        root.classList.remove('theme-cream', 'theme-dark', 'theme-pastel-blue', 'theme-pastel-green', 'theme-light-yellow')

        // Add current theme class
        const themeClass = `theme-${theme}` as `theme-${string}`
        root.classList.add(themeClass)

        // Update body background
        const themeColors: Record<string, string> = {
          cream: '#F7F3E9',
          dark: '#111827',
          'pastel-blue': '#E8F4FC',
          'pastel-green': '#E8F8F0',
          'light-yellow': '#FEF9E7',
        }

        document.body.style.backgroundColor = themeColors[theme] || themeColors.cream
      },

      resetToDefaults: () => {
        set(defaultPreferences)
        get().applyTheme()
      },

      loadPreferences: async () => {
        set({ isLoading: true })
        try {
          const prefs = await preferencesApi.getPreferences()
          set(prefs)
          get().applyTheme()
        } catch (error) {
          console.error('Failed to load preferences:', error)
          // Use defaults on error
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'neurovidya-preferences',
      partialize: (state) => ({
        font: state.font,
        fontSize: state.fontSize,
        letterSpacing: state.letterSpacing,
        lineHeight: state.lineHeight,
        theme: state.theme,
        focusMode: state.focusMode,
        speechSpeed: state.speechSpeed,
      }),
    }
  )
)
