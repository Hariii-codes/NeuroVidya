import { useMemo } from 'react'
import { useDyslexiaSettings } from '../DyslexiaProvider'

/**
 * Hook for applying word spacing to text
 * Returns CSS style object with word spacing
 */
export const useWordSpacing = () => {
  const { settings } = useDyslexiaSettings()

  const textStyle = useMemo(() => ({
    wordSpacing: `${settings.wordSpacing}em`,
  }), [settings.wordSpacing])

  return {
    wordSpacing: settings.wordSpacing,
    textStyle,
  }
}

/**
 * Hook to process text with enhanced word spacing
 * Returns text with non-breaking spaces for better control
 */
export const useEnhancedWordSpacing = (text: string) => {
  const { wordSpacing } = useWordSpacing()

  const enhancedText = useMemo(() => {
    // If word spacing is very low, return normal text
    if (wordSpacing < 0.2) return text

    // Split words and add enhanced spacing
    return text
      .split(' ')
      .filter(word => word.length > 0)
      .join('\u2009') // Thin space character for better control
  }, [text, wordSpacing])

  return {
    enhancedText,
    cssSpacing: `${wordSpacing}em`,
  }
}

/**
 * Hook to calculate optimal word spacing based on font size
 * Follows dyslexia design guidelines: spacing should be 3-5% of font size
 */
export const useOptimalWordSpacing = () => {
  const { settings } = useDyslexiaSettings()

  const optimalSpacing = useMemo(() => {
    // Base recommendation: 0.35em for most dyslexic readers
    // Adjust based on font size
    const baseSpacing = 0.35
    const fontSizeAdjustment = (settings.fontSize - 22) * 0.01

    return Math.max(0, Math.min(1, baseSpacing + fontSizeAdjustment))
  }, [settings.fontSize])

  return {
    optimalSpacing,
    isOptimal: Math.abs(settings.wordSpacing - optimalSpacing) < 0.1,
    applyOptimal: () => {
      // This would need to be connected to updateSetting
      return optimalSpacing
    },
  }
}
