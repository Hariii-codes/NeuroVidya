// Dyslexia-First Design System Types

export type DyslexiaTheme =
  | 'cream'
  | 'pastel-blue'
  | 'pastel-green'
  | 'light-yellow'
  | 'dark'

export type DyslexiaFont = 'Lexend' | 'OpenDyslexic' | 'Arial'

export type ChunkStyle = 'syllables' | 'sounds' | 'both'

export type ContrastLevel = 'normal' | 'high' | 'very-high'

export type PresetLevel = 'mild' | 'moderate' | 'significant' | 'custom'

export interface DyslexiaSettings {
  // Text Display
  fontSize: number
  letterSpacing: number
  wordSpacing: number
  lineHeight: number
  fontFamily: DyslexiaFont

  // Reading Aids
  lineFocusEnabled: boolean
  lineFocusColor: string
  lineDimIntensity: number
  lineFocusAutoScroll: boolean
  phoneticChunkingEnabled: boolean
  chunkStyle: ChunkStyle
  useAIForChunking: boolean

  // Audio
  ttsAlwaysVisible: boolean
  speechSpeed: number
  wordByWordMode: boolean
  voiceSelection: string

  // Visual Theme
  theme: DyslexiaTheme
  accentColor: string
  contrastLevel: ContrastLevel

  // Preset
  presetLevel: PresetLevel
}

export interface DyslexiaContextValue {
  settings: DyslexiaSettings
  updateSetting: <K extends keyof DyslexiaSettings>(
    key: K,
    value: DyslexiaSettings[K]
  ) => void
  updateMultipleSettings: (updates: Partial<DyslexiaSettings>) => void
  applyPreset: (preset: PresetLevel) => void
  resetToDefaults: () => void
}

export interface SyllableChunk {
  text: string
  colorIndex: number
}

export interface LineFocusState {
  currentLine: number
  isVisible: boolean
}

// Preset configurations for different dyslexia support levels
export interface DyslexiaPreset {
  name: string
  description: string
  settings: Partial<DyslexiaSettings>
}

// CSS Variable names for dyslexia settings
export const DyslexiaCSSVars = {
  // Typography
  fontSize: '--dyslexia-font-size',
  letterSpacing: '--dyslexia-letter-spacing',
  wordSpacing: '--dyslexia-word-spacing',
  lineHeight: '--dyslexia-line-height',
  fontFamily: '--dyslexia-font-family',

  // Colors
  bgPrimary: '--dyslexia-bg-primary',
  bgSecondary: '--dyslexia-bg-secondary',
  textPrimary: '--dyslexia-text-primary',
  textSecondary: '--dyslexia-text-secondary',
  textMuted: '--dyslexia-text-muted',
  accent: '--dyslexia-accent',
  accentHover: '--dyslexia-accent-hover',

  // Line focus
  lineHighlight: '--dyslexia-line-highlight',
  lineDim: '--dyslexia-line-dim',

  // Phonetic chunking colors
  syllable1: '--syllable-color-1',
  syllable2: '--syllable-color-2',
  syllable3: '--syllable-color-3',
  syllable4: '--syllable-color-4',
} as const

export type DyslexiaCSSVar = typeof DyslexiaCSSVars[keyof typeof DyslexiaCSSVars]
