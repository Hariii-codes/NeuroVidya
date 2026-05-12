/**
 * Color Generator for Dyslexia Design System
 * Generates accessible, dyslexia-friendly color schemes
 */

import type { DyslexiaTheme, ContrastLevel } from '../types/dyslexia'

// ============================================
// COLOR PALETTES
// ============================================

/**
 * Research-backed background colors for dyslexic readers
 * Cream tones are proven to reduce visual stress
 */
export const themeColors: Record<DyslexiaTheme, { bg: string; text: string; accent: string }> = {
  cream: {
    bg: '#F7F3E9',
    text: '#1f2937',
    accent: '#3b82f6',
  },
  'pastel-blue': {
    bg: '#E8F4FC',
    text: '#1e3a5f',
    accent: '#0284c7',
  },
  'pastel-green': {
    bg: '#E8F8F0',
    text: '#1a4d2e',
    accent: '#059669',
  },
  'light-yellow': {
    bg: '#FEF9E7',
    text: '#423c08',
    accent: '#d97706',
  },
  dark: {
    bg: '#111827',
    text: '#F9FAFB',
    accent: '#60a5fa',
  },
}

/**
 * Syllable chunking colors - carefully chosen for dyslexia
 * Soft, distinguishable colors that don't clash
 */
export const syllableColors = [
  { bg: '#DBEAFE', name: 'light blue' },
  { bg: '#D1FAE5', name: 'light green' },
  { bg: '#FEF3C7', name: 'light yellow' },
  { bg: '#EDE9FE', name: 'light purple' },
  { bg: '#FEE2E2', name: 'light red' },
  { bg: '#E0E7FF', name: 'light indigo' },
]

/**
 * High contrast colors for accessibility
 */
export const contrastColors = {
  yellow: '#fbbf24',
  orange: '#f97316',
  green: '#059669',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
}

// ============================================
// COLOR GENERATORS
// ============================================

/**
 * Generate a color scheme based on theme and contrast level
 */
export function generateColorScheme(
  theme: DyslexiaTheme,
  contrast: ContrastLevel
): {
  primary: string
  secondary: string
  background: string
  text: string
  accent: string
  focus: string
  success: string
  warning: string
  error: string
} {
  const base = themeColors[theme]
  const isDark = theme === 'dark'

  // Adjust based on contrast level
  if (contrast === 'high') {
    return {
      primary: isDark ? '#FFFFFF' : '#000000',
      secondary: isDark ? '#E5E7EB' : '#374151',
      background: base.bg,
      text: isDark ? '#FFFFFF' : '#000000',
      accent: base.accent,
      focus: contrastColors.yellow,
      success: contrastColors.green,
      warning: contrastColors.orange,
      error: '#DC2626',
    }
  }

  if (contrast === 'very-high') {
    return {
      primary: isDark ? '#FFFFFF' : '#000000',
      secondary: isDark ? '#F3F4F6' : '#171717',
      background: base.bg,
      text: isDark ? '#FFFFFF' : '#000000',
      accent: base.accent,
      focus: contrastColors.yellow,
      success: contrastColors.green,
      warning: contrastColors.orange,
      error: '#B91C1C',
    }
  }

  // Normal contrast
  return {
    primary: base.text,
    secondary: isDark ? '#9CA3AF' : '#6B7280',
    background: base.bg,
    text: base.text,
    accent: base.accent,
    focus: contrastColors.yellow,
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  }
}

/**
 * Get syllable color by index
 * Cycles through the available colors
 */
export function getSyllableColor(index: number): string {
  return syllableColors[index % syllableColors.length].bg
}

/**
 * Generate a color map for syllable chunking
 * Maps syllable indices to colors
 */
export function generateSyllableColorMap(count: number): Map<number, string> {
  const map = new Map<number, string>()

  for (let i = 0; i < count; i++) {
    map.set(i, getSyllableColor(i))
  }

  return map
}

/**
 * Check if two colors have sufficient contrast
 * Returns true if contrast ratio >= 4.5:1 (WCAG AA)
 */
export function hasSufficientContrast(color1: string, color2: string): boolean {
  const luminance1 = getLuminance(color1)
  const luminance2 = getLuminance(color2)
  const ratio = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05)
  return ratio >= 4.5
}

/**
 * Calculate relative luminance of a color
 * Used for contrast calculations
 */
function getLuminance(hex: string): number {
  // Remove # if present
  hex = hex.replace('#', '')

  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  // Apply gamma correction
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

  const rLinear = toLinear(r)
  const gLinear = toLinear(g)
  const bLinear = toLinear(b)

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * Generate focus ring colors for keyboard navigation
 */
export function generateFocusRing(accentColor: string): {
  outer: string
  inner: string
} {
  return {
    outer: accentColor,
    inner: '#FFFFFF',
  }
}

/**
 * Generate dyslexia-friendly gradient
 * Subtle gradients only - avoid visual overwhelm
 */
export function generateSubtleGradient(
  baseColor: string,
  direction: 'horizontal' | 'vertical' = 'vertical'
): string {
  const lightVariant = adjustBrightness(baseColor, 5)
  const dir = direction === 'horizontal' ? 'to right' : 'to bottom'

  return `linear-gradient(${dir}, ${baseColor} 0%, ${lightVariant} 100%)`
}

/**
 * Adjust color brightness
 * Positive amount lightens, negative darkens
 */
function adjustBrightness(hex: string, amount: number): string {
  hex = hex.replace('#', '')

  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  r = Math.max(0, Math.min(255, r + amount))
  g = Math.max(0, Math.min(255, g + amount))
  b = Math.max(0, Math.min(255, b + amount))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Get text color that will be readable on a given background
 */
export function getReadableTextColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor)
  return luminance > 0.5 ? '#1f2937' : '#F9FAFB'
}

// ============================================
// COLOR VALIDATION
// ============================================

/**
 * Validate if a color is dyslexia-friendly
 * Checks for:
 * - Not too saturated
 * - Good contrast ratios
 * - Not jarring combinations
 */
export function isDyslexiaFriendlyColor(
  color: string,
  background: string = '#FFFFFF'
): {
  friendly: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  let friendly = true

  // Check contrast
  if (!hasSufficientContrast(color, background)) {
    friendly = false
    reasons.push('Insufficient contrast ratio (should be >= 4.5:1)')
  }

  // Check for neon colors (high saturation can be overwhelming)
  const rgb = parseRgb(color)
  if (rgb) {
    const max = Math.max(rgb.r, rgb.g, rgb.b)
    const min = Math.min(rgb.r, rgb.g, rgb.b)
    const saturation = max === 0 ? 0 : (max - min) / max

    if (saturation > 0.9) {
      friendly = false
      reasons.push('Color is too saturated/neon')
    }
  }

  return { friendly, reasons }
}

function parseRgb(hex: string): { r: number; g: number; b: number } | null {
  hex = hex.replace('#', '')

  if (hex.length !== 6) return null

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return { r, g, b }
}
