import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { DyslexiaSettings, DyslexiaContextValue, PresetLevel } from './types/dyslexia'
import { defaultDyslexiaSettings, dyslexiaPresets, applyDyslexiaTheme, injectDyslexiaGlobalStyles } from './DyslexiaTheme'
import { dyslexiaSettingsApi, type DyslexiaSettingsUpdate } from '@/services/dyslexiaSettings'

// ============================================
// CONTEXT CREATION
// ============================================

const DyslexiaContext = createContext<DyslexiaContextValue | null>(null)

// ============================================
// PROVIDER COMPONENT
// ============================================

interface DyslexiaProviderProps {
  children: ReactNode
  initialSettings?: Partial<DyslexiaSettings>
}

export const DyslexiaProvider = ({ children, initialSettings }: DyslexiaProviderProps) => {
  // Initialize settings with defaults, then apply any initial settings (from DB/API)
  const [settings, setSettings] = useState<DyslexiaSettings>(() => ({
    ...defaultDyslexiaSettings,
    ...initialSettings,
  }))

  // ============================================
  // EFFECTS
  // ============================================

  // Inject global styles on mount
  useEffect(() => {
    injectDyslexiaGlobalStyles()
  }, [])

  // Apply theme whenever settings change
  useEffect(() => {
    applyDyslexiaTheme(settings)
  }, [settings])

  // Persist to localStorage for offline support
  useEffect(() => {
    const saveToLocal = () => {
      try {
        localStorage.setItem('dyslexia-settings', JSON.stringify(settings))
      } catch (error) {
        console.error('Failed to save dyslexia settings to localStorage:', error)
      }
    }

    // Debounce localStorage writes
    const timeoutId = setTimeout(saveToLocal, 500)
    return () => clearTimeout(timeoutId)
  }, [settings])

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Update a single dyslexia setting
   * Immediately updates UI and schedules persistence
   */
  const updateSetting = <K extends keyof DyslexiaSettings>(
    key: K,
    value: DyslexiaSettings[K]
  ): void => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
      presetLevel: 'custom', // Reset to custom when manually changing
    }))
  }

  /**
   * Update multiple settings at once
   * Useful for applying presets or bulk changes
   */
  const updateMultipleSettings = (updates: Partial<DyslexiaSettings>): void => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  /**
   * Apply a preset configuration
   */
  const applyPreset = (preset: PresetLevel): void => {
    if (preset === 'custom') return

    const presetSettings = dyslexiaPresets[preset]
    if (presetSettings) {
      setSettings((prev) => ({
        ...prev,
        ...presetSettings,
        presetLevel: preset,
      }))
    }
  }

  /**
   * Reset all settings to defaults
   */
  const resetToDefaults = (): void => {
    setSettings(defaultDyslexiaSettings)
  }

  // ============================================
  // API PERSISTENCE
  // ============================================

  /**
   * Load settings from the backend API
   * Falls back to localStorage if API fails
   */
  const loadSettingsFromAPI = useCallback(async (): Promise<void> => {
    try {
      const apiSettings = await dyslexiaSettingsApi.getSettings()
      // Map API response to DyslexiaSettings format
      // Note: The API uses 'font' but frontend uses 'fontFamily'
      const mappedSettings: DyslexiaSettings = {
        fontSize: apiSettings.fontSize,
        letterSpacing: apiSettings.letterSpacing,
        wordSpacing: apiSettings.wordSpacing,
        lineHeight: apiSettings.lineHeight,
        fontFamily: apiSettings.font as DyslexiaSettings['fontFamily'],
        theme: apiSettings.theme as DyslexiaSettings['theme'],
        accentColor: apiSettings.accentColor,
        contrastLevel: apiSettings.contrastLevel as DyslexiaSettings['contrastLevel'],
        lineFocusEnabled: apiSettings.lineFocusEnabled,
        lineFocusColor: apiSettings.lineFocusColor,
        lineDimIntensity: apiSettings.lineDimIntensity,
        lineFocusAutoScroll: apiSettings.lineFocusAutoScroll,
        phoneticChunkingEnabled: apiSettings.phoneticChunkingEnabled,
        chunkStyle: apiSettings.chunkStyle as DyslexiaSettings['chunkStyle'],
        useAIForChunking: apiSettings.useAIForChunking,
        ttsAlwaysVisible: apiSettings.ttsAlwaysVisible,
        speechSpeed: apiSettings.speechSpeed,
        wordByWordMode: apiSettings.wordByWordMode,
        voiceSelection: apiSettings.voiceSelection,
        presetLevel: apiSettings.presetLevel as DyslexiaSettings['presetLevel'],
      }
      setSettings(mappedSettings)
    } catch (error) {
      console.error('Failed to load settings from API:', error)
      // Fall back to localStorage settings (already loaded)
    }
  }, [])

  /**
   * Save settings to the backend API
   * Does not affect UI on failure - settings remain in localStorage
   */
  const saveSettingsToAPI = useCallback(async (currentSettings: DyslexiaSettings): Promise<void> => {
    try {
      // Map DyslexiaSettings to API format
      const apiData: DyslexiaSettingsUpdate = {
        fontSize: currentSettings.fontSize,
        letterSpacing: currentSettings.letterSpacing,
        wordSpacing: currentSettings.wordSpacing,
        lineHeight: currentSettings.lineHeight,
        font: currentSettings.fontFamily,
        theme: currentSettings.theme,
        accentColor: currentSettings.accentColor,
        contrastLevel: currentSettings.contrastLevel,
        lineFocusEnabled: currentSettings.lineFocusEnabled,
        lineFocusColor: currentSettings.lineFocusColor,
        lineDimIntensity: currentSettings.lineDimIntensity,
        lineFocusAutoScroll: currentSettings.lineFocusAutoScroll,
        phoneticChunkingEnabled: currentSettings.phoneticChunkingEnabled,
        chunkStyle: currentSettings.chunkStyle,
        useAIForChunking: currentSettings.useAIForChunking,
        ttsAlwaysVisible: currentSettings.ttsAlwaysVisible,
        speechSpeed: currentSettings.speechSpeed,
        wordByWordMode: currentSettings.wordByWordMode,
        voiceSelection: currentSettings.voiceSelection,
        presetLevel: currentSettings.presetLevel,
      }
      await dyslexiaSettingsApi.updateSettings(apiData)
    } catch (error) {
      console.error('Failed to save settings to API:', error)
      // Settings remain in localStorage
    }
  }, [])

  // Load from API on mount when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      loadSettingsFromAPI()
    }
  }, [loadSettingsFromAPI])

  // Auto-save to API when settings change (debounced)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      const token = localStorage.getItem('auth_token')
      // Only save to API if user is authenticated
      if (token) {
        saveSettingsToAPI(settings)
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(saveTimer)
  }, [settings, saveSettingsToAPI])

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const contextValue: DyslexiaContextValue = {
    settings,
    updateSetting,
    updateMultipleSettings,
    applyPreset,
    resetToDefaults,
  }

  return (
    <DyslexiaContext.Provider value={contextValue}>
      {children}
    </DyslexiaContext.Provider>
  )
}

// ============================================
// HOOK
// ============================================

/**
 * Hook to access dyslexia settings and controls
 * Must be used within a DyslexiaProvider
 */
export const useDyslexiaSettings = (): DyslexiaContextValue => {
  const context = useContext(DyslexiaContext)

  if (!context) {
    throw new Error('useDyslexiaSettings must be used within a DyslexiaProvider')
  }

  return context
}

// ============================================
// CONVENIENCE HOOKS
// ============================================

/**
 * Hook for just accessing settings (read-only)
 * Useful for components that only need to read values
 */
export const useDyslexiaSettingsValue = (): DyslexiaSettings => {
  const { settings } = useDyslexiaSettings()
  return settings
}

/**
 * Hook for typography settings specifically
 */
export const useTypographySettings = () => {
  const { settings } = useDyslexiaSettings()
  return {
    fontSize: settings.fontSize,
    letterSpacing: settings.letterSpacing,
    wordSpacing: settings.wordSpacing,
    lineHeight: settings.lineHeight,
    fontFamily: settings.fontFamily,
  }
}

/**
 * Hook for reading aid settings
 */
export const useReadingAidSettings = () => {
  const { settings } = useDyslexiaSettings()
  return {
    lineFocusEnabled: settings.lineFocusEnabled,
    lineFocusColor: settings.lineFocusColor,
    lineDimIntensity: settings.lineDimIntensity,
    lineFocusAutoScroll: settings.lineFocusAutoScroll,
    phoneticChunkingEnabled: settings.phoneticChunkingEnabled,
    chunkStyle: settings.chunkStyle,
    useAIForChunking: settings.useAIForChunking,
  }
}

/**
 * Hook for audio settings
 */
export const useAudioSettings = () => {
  const { settings } = useDyslexiaSettings()
  return {
    ttsAlwaysVisible: settings.ttsAlwaysVisible,
    speechSpeed: settings.speechSpeed,
    wordByWordMode: settings.wordByWordMode,
    voiceSelection: settings.voiceSelection,
  }
}

/**
 * Hook for visual theme settings
 */
export const useThemeSettings = () => {
  const { settings } = useDyslexiaSettings()
  return {
    theme: settings.theme,
    accentColor: settings.accentColor,
    contrastLevel: settings.contrastLevel,
    presetLevel: settings.presetLevel,
  }
}
