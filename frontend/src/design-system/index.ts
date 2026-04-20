// Dyslexia-First Design System - Main Export File
//
// This design system provides fully dyslexia-optimized components
// with research-backed colors, typography, and accessibility features.
//
// Usage:
//   import { DyslexiaProvider, DyslexiaText, DyslexiaButton } from '@/design-system'
//

// ============================================
// PROVIDER & HOOKS
// ============================================

export { DyslexiaProvider } from './DyslexiaProvider'
export {
  useDyslexiaSettings,
  useDyslexiaSettingsValue,
  useTypographySettings,
  useReadingAidSettings,
  useAudioSettings,
  useThemeSettings,
} from './DyslexiaProvider'

export { useWordSpacing, useEnhancedWordSpacing, useOptimalWordSpacing } from './hooks/useWordSpacing'
export { useLineFocus, useLineInView, useLineNavigation } from './hooks/useLineFocus'
export { usePhoneticChunking, useRealtimeChunking, useCachedChunking } from './hooks/usePhoneticChunking'

// ============================================
// THEME & UTILITIES
// ============================================

export {
  defaultDyslexiaSettings,
  dyslexiaPresets,
  applyDyslexiaTheme,
  injectDyslexiaGlobalStyles,
  themeBackgrounds,
  accentColors,
  syllableColors,
} from './DyslexiaTheme'

export {
  generateColorScheme,
  getSyllableColor,
  hasSufficientContrast,
  isDyslexiaFriendlyColor,
  themeColors,
} from './utils/colorGenerator'

export {
  chunkWordBySyllables,
  countSyllables,
  getWordDifficulty,
  shouldUseAIForWord,
  phoneticPatterns,
} from './utils/syllableRules'

// ============================================
// CORE COMPONENTS
// ============================================

export { DyslexiaText, DyslexiaHeading, DyslexiaParagraph, DyslexiaLabel } from './components/DyslexiaText'
export {
  DyslexiaButton,
  DyslexiaButtonGroup,
  DyslexiaIconButton,
  DyslexiaLinkButton,
} from './components/DyslexiaButton'
export {
  DyslexiaCard,
  DyslexiaCardGrid,
  DyslexiaStatsCard,
  DyslexiaActionCard,
} from './components/DyslexiaCard'
export { DyslexiaInput, DyslexiaTextarea, DyslexiaSelect } from './components/DyslexiaInput'

// ============================================
// ADVANCED COMPONENTS
// ============================================

export {
  ReadingGuide,
  ReadingGuideControls,
  ReadingMask,
  ReadingRuler,
} from './components/ReadingGuide'

export {
  PhoneticHighlighter,
  SyllableCounter,
  WordDifficultyBadge,
  ChunkStyleSelector,
  InteractiveWordBuilder,
} from './components/PhoneticHighlighter'

// ============================================
// SETTINGS COMPONENTS
// ============================================

export { QuickSettingsToolbar } from './components/QuickSettingsToolbar'
export { TextDisplaySettings } from './components/settings/TextDisplaySettings'
export { ReadingAidsSettings } from './components/settings/ReadingAidsSettings'
export { AudioSettings } from './components/settings/AudioSettings'
export { VisualThemeSettings } from './components/settings/VisualThemeSettings'
export { PresetSelector } from './components/settings/PresetSelector'

// ============================================
// TYPES
// ============================================

export type {
  DyslexiaTheme,
  DyslexiaFont,
  ChunkStyle,
  ContrastLevel,
  PresetLevel,
  DyslexiaSettings,
  DyslexiaContextValue,
  SyllableChunk,
  LineFocusState,
  DyslexiaPreset,
} from './types/dyslexia'

// Re-export component prop types
export type { DyslexiaTextProps } from './components/DyslexiaText'
export type { DyslexiaButtonProps } from './components/DyslexiaButton'
export type { DyslexiaCardProps } from './components/DyslexiaCard'
export type { DyslexiaInputProps, DyslexiaTextareaProps } from './components/DyslexiaInput'
export type { ReadingGuideProps, ReadingGuideControlsProps } from './components/ReadingGuide'
export type { PhoneticHighlighterProps, SyllableInfo } from './components/PhoneticHighlighter'
