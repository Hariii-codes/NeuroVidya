// Dyslexia-First Design System - Theme & CSS Variables
// Research-backed colors and typography for dyslexic readers

import { DyslexiaCSSVars, type DyslexiaSettings, type DyslexiaTheme, type ContrastLevel } from './types/dyslexia'

// ============================================
// COLOR PALETTES (Research-Backed)
// ============================================

// Backgrounds - Cream is proven best for dyslexia
export const themeBackgrounds: Record<DyslexiaTheme, string> = {
  cream: '#F7F3E9',
  'pastel-blue': '#E8F4FC',
  'pastel-green': '#E8F8F0',
  'light-yellow': '#FEF9E7',
  dark: '#111827',
}

// Text colors based on contrast level
export const getTextColors = (contrast: ContrastLevel, theme: DyslexiaTheme) => {
  const isDark = theme === 'dark'

  if (contrast === 'normal') {
    return {
      primary: isDark ? '#F9FAFB' : '#1f2937',
      secondary: isDark ? '#D1D5DB' : '#4b5563',
      muted: isDark ? '#9CA3AF' : '#9ca3af',
    }
  }

  if (contrast === 'high') {
    return {
      primary: isDark ? '#FFFFFF' : '#000000',
      secondary: isDark ? '#E5E7EB' : '#374151',
      muted: isDark ? '#A3A3A3' : '#737373',
    }
  }

  // Very high contrast
  return {
    primary: isDark ? '#FFFFFF' : '#000000',
    secondary: isDark ? '#F3F4F6' : '#171717',
    muted: isDark ? '#737373' : '#525252',
  }
}

// Accent colors - Calm, focused
export const accentColors = {
  calmBlue: {
    primary: '#3b82f6',
    hover: '#2563eb',
    light: '#DBEAFE',
  },
  successGreen: {
    primary: '#059669',
    hover: '#047857',
    light: '#D1FAE5',
  },
  softOrange: {
    primary: '#f97316',
    hover: '#ea580c',
    light: '#FED7AA',
  },
  focusYellow: {
    primary: '#fbbf24',
    hover: '#f59e0b',
    light: '#FEF3C7',
  },
}

// Phonetic chunking colors (cycle through 4)
export const syllableColors = [
  '#DBEAFE', // Light blue
  '#D1FAE5', // Light green
  '#FEF3C7', // Light yellow
  '#EDE9FE', // Light purple
]

// ============================================
// DEFAULT SETTINGS
// ============================================

export const defaultDyslexiaSettings: DyslexiaSettings = {
  // Text Display - Research-backed defaults
  fontSize: 22,
  letterSpacing: 0.15,
  wordSpacing: 0.5,
  lineHeight: 1.8,
  fontFamily: 'Lexend',

  // Reading Aids
  lineFocusEnabled: false,
  lineFocusColor: '#fbbf24',
  lineDimIntensity: 0.3,
  lineFocusAutoScroll: false,
  phoneticChunkingEnabled: false,
  chunkStyle: 'syllables',
  useAIForChunking: false,

  // Audio
  ttsAlwaysVisible: true,
  speechSpeed: 1.0,
  wordByWordMode: false,
  voiceSelection: 'default',

  // Visual Theme
  theme: 'cream',
  accentColor: accentColors.calmBlue.primary,
  contrastLevel: 'normal',

  // Preset
  presetLevel: 'custom',
}

// ============================================
// PRESET CONFIGURATIONS
// ============================================

export const dyslexiaPresets: Record<string, Partial<DyslexiaSettings>> = {
  mild: {
    fontSize: 20,
    letterSpacing: 0.12,
    wordSpacing: 0.3,
    lineHeight: 1.6,
    lineFocusEnabled: false,
    phoneticChunkingEnabled: false,
    contrastLevel: 'normal',
    presetLevel: 'mild',
  },
  moderate: {
    fontSize: 22,
    letterSpacing: 0.15,
    wordSpacing: 0.5,
    lineHeight: 1.8,
    lineFocusEnabled: true,
    lineDimIntensity: 0.3,
    phoneticChunkingEnabled: true,
    chunkStyle: 'syllables',
    contrastLevel: 'high',
    presetLevel: 'moderate',
  },
  significant: {
    fontSize: 24,
    letterSpacing: 0.2,
    wordSpacing: 0.7,
    lineHeight: 2.0,
    lineFocusEnabled: true,
    lineDimIntensity: 0.5,
    phoneticChunkingEnabled: true,
    chunkStyle: 'both',
    useAIForChunking: true,
    ttsAlwaysVisible: true,
    contrastLevel: 'very-high',
    presetLevel: 'significant',
  },
}

// ============================================
// CSS VARIABLES APPLICATION
// ============================================

/**
 * Apply dyslexia settings as CSS variables to the document root
 * This allows all components to respond instantly to setting changes
 */
export const applyDyslexiaTheme = (settings: DyslexiaSettings): void => {
  const root = document.documentElement
  const body = document.body

  // Get colors based on theme and contrast
  const bgPrimary = themeBackgrounds[settings.theme]
  const textColors = getTextColors(settings.contrastLevel, settings.theme)

  // Find accent color
  const accentColor = Object.values(accentColors).find(
    (c) => c.primary === settings.accentColor
  ) || accentColors.calmBlue

  // Background colors
  root.style.setProperty(DyslexiaCSSVars.bgPrimary, bgPrimary)
  root.style.setProperty(
    DyslexiaCSSVars.bgSecondary,
    settings.theme === 'dark' ? '#1f2937' : '#ffffff'
  )

  // Text colors
  root.style.setProperty(DyslexiaCSSVars.textPrimary, textColors.primary)
  root.style.setProperty(DyslexiaCSSVars.textSecondary, textColors.secondary)
  root.style.setProperty(DyslexiaCSSVars.textMuted, textColors.muted)

  // Accent colors
  root.style.setProperty(DyslexiaCSSVars.accent, accentColor.primary)
  root.style.setProperty(DyslexiaCSSVars.accentHover, accentColor.hover)

  // Typography
  root.style.setProperty(DyslexiaCSSVars.fontSize, `${settings.fontSize}px`)
  root.style.setProperty(DyslexiaCSSVars.letterSpacing, `${settings.letterSpacing}em`)
  root.style.setProperty(DyslexiaCSSVars.wordSpacing, `${settings.wordSpacing}em`)
  root.style.setProperty(DyslexiaCSSVars.lineHeight, settings.lineHeight.toString())
  root.style.setProperty(DyslexiaCSSVars.fontFamily, settings.fontFamily)

  // Line focus colors
  root.style.setProperty(DyslexiaCSSVars.lineHighlight, settings.lineFocusColor)
  root.style.setProperty(
    DyslexiaCSSVars.lineDim,
    `rgba(0, 0, 0, ${settings.lineDimIntensity})`
  )

  // Syllable chunking colors
  root.style.setProperty(DyslexiaCSSVars.syllable1, syllableColors[0])
  root.style.setProperty(DyslexiaCSSVars.syllable2, syllableColors[1])
  root.style.setProperty(DyslexiaCSSVars.syllable3, syllableColors[2])
  root.style.setProperty(DyslexiaCSSVars.syllable4, syllableColors[3])

  // Apply to body
  body.style.backgroundColor = bgPrimary
  body.style.color = textColors.primary

  // Remove old theme classes and add new one
  root.classList.remove(
    'theme-cream',
    'theme-pastel-blue',
    'theme-pastel-green',
    'theme-light-yellow',
    'theme-dark'
  )
  root.classList.add(`theme-${settings.theme}`)
}

// ============================================
// GLOBAL CSS STYLES
// ============================================

/**
 * Inject global CSS for dyslexia features
 * Call this once at app initialization
 */
export const injectDyslexiaGlobalStyles = (): void => {
  // Check if already injected
  if (document.getElementById('dyslexia-global-styles')) return

  const style = document.createElement('style')
  style.id = 'dyslexia-global-styles'
  style.textContent = `
    /* Dyslexia-First Base Styles */
    :root {
      /* Default values, will be overridden by JS */
      --dyslexia-bg-primary: #F7F3E9;
      --dyslexia-bg-secondary: #ffffff;
      --dyslexia-text-primary: #1f2937;
      --dyslexia-text-secondary: #4b5563;
      --dyslexia-text-muted: #9ca3af;
      --dyslexia-accent: #3b82f6;
      --dyslexia-accent-hover: #2563eb;

      /* Typography */
      --dyslexia-font-size: 22px;
      --dyslexia-letter-spacing: 0.15em;
      --dyslexia-word-spacing: 0.5em;
      --dyslexia-line-height: 1.8;
      --dyslexia-font-family: 'Lexend', sans-serif;

      /* Line focus */
      --dyslexia-line-highlight: #fbbf24;
      --dyslexia-line-dim: rgba(0, 0, 0, 0.3);

      /* Syllable colors */
      --syllable-color-1: #DBEAFE;
      --syllable-color-2: #D1FAE5;
      --syllable-color-3: #FEF3C7;
      --syllable-color-4: #EDE9FE;
    }

    /* Apply dyslexia typography globally */
    body {
      font-family: var(--dyslexia-font-family);
      font-size: var(--dyslexia-font-size);
      letter-spacing: var(--dyslexia-letter-spacing);
      line-height: var(--dyslexia-line-height);
      word-spacing: var(--dyslexia-word-spacing);
      background-color: var(--dyslexia-bg-primary);
      color: var(--dyslexia-text-primary);
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    /* Dyslexia text enhancement class */
    .dyslexia-text {
      font-family: var(--dyslexia-font-family);
      font-size: var(--dyslexia-font-size);
      letter-spacing: var(--dyslexia-letter-spacing);
      word-spacing: var(--dyslexia-word-spacing);
      line-height: var(--dyslexia-line-height);
    }

    /* Line focus styles */
    .dyslexia-line-focused {
      background-color: var(--dyslexia-line-highlight);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      transition: background-color 0.15s ease;
    }

    .dyslexia-line-dimmed {
      opacity: calc(1 - var(--dyslexia-line-dim-intensity, 0.3));
    }

    /* Phonetic syllable chunking */
    .syllable-chunk {
      display: inline-block;
      padding: 0.1em 0.2em;
      border-radius: 0.15em;
      margin: 0 0.05em;
      transition: background-color 0.15s ease;
    }

    .syllable-chunk.color-1 { background-color: var(--syllable-color-1); }
    .syllable-chunk.color-2 { background-color: var(--syllable-color-2); }
    .syllable-chunk.color-3 { background-color: var(--syllable-color-3); }
    .syllable-chunk.color-4 { background-color: var(--syllable-color-4); }

    /* Focus states - larger, more visible */
    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    textarea:focus-visible,
    [tabindex]:focus-visible {
      outline: 3px solid var(--dyslexia-accent);
      outline-offset: 2px;
    }

    /* Smooth transitions for theme changes */
    * {
      transition-property: color, background-color, border-color;
      transition-duration: 0.2s;
      transition-timing-function: ease;
    }

    /* Prevent transitions on initial load */
    .no-transition * {
      transition: none !important;
    }
  `

  document.head.appendChild(style)
}
