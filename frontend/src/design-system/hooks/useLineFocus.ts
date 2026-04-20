import { useState, useCallback, useEffect, useRef } from 'react'
import { useDyslexiaSettings } from '../DyslexiaProvider'

export interface LineFocusState {
  currentLine: number
  totalLines: number
  isFocused: boolean
}

export interface LineFocusActions {
  setLine: (line: number) => void
  nextLine: () => void
  previousLine: () => void
  toggleFocus: () => void
  reset: () => void
}

/**
 * Hook for line-by-line reading focus
 * Highlights current line being read, dims others
 */
export const useLineFocus = (totalLines: number = 0) => {
  const { settings } = useDyslexiaSettings()
  const [currentLine, setCurrentLine] = useState(0)
  const [isFocused, setIsFocused] = useState(settings.lineFocusEnabled)
  const autoScrollRef = useRef<number | null>(null)

  // Update focus state when setting changes
  useEffect(() => {
    setIsFocused(settings.lineFocusEnabled)
  }, [settings.lineFocusEnabled])

  // Auto-scroll feature
  useEffect(() => {
    if (settings.lineFocusAutoScroll && isFocused && settings.lineFocusEnabled) {
      autoScrollRef.current = window.setInterval(() => {
        setCurrentLine((prev) => {
          if (prev >= totalLines - 1) {
            return 0 // Loop back to start
          }
          return prev + 1
        })
      }, 3000) // Change line every 3 seconds
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }
  }, [settings.lineFocusAutoScroll, isFocused, settings.lineFocusEnabled, totalLines])

  // Actions
  const setLine = useCallback((line: number) => {
    setCurrentLine(Math.max(0, Math.min(line, totalLines - 1)))
  }, [totalLines])

  const nextLine = useCallback(() => {
    setCurrentLine((prev) => Math.min(prev + 1, totalLines - 1))
  }, [totalLines])

  const previousLine = useCallback(() => {
    setCurrentLine((prev) => Math.max(prev - 1, 0))
  }, [])

  const toggleFocus = useCallback(() => {
    setIsFocused((prev) => !prev)
  }, [])

  const reset = useCallback(() => {
    setCurrentLine(0)
    setIsFocused(settings.lineFocusEnabled)
  }, [settings.lineFocusEnabled])

  // Get line styles
  const getLineStyle = useCallback((lineIndex: number) => {
    if (!isFocused || !settings.lineFocusEnabled) {
      return {}
    }

    if (lineIndex === currentLine) {
      return {
        backgroundColor: settings.lineFocusColor,
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        transition: 'all 0.15s ease',
      }
    }

    return {
      opacity: 1 - settings.lineDimIntensity,
      transition: 'opacity 0.15s ease',
    }
  }, [isFocused, settings.lineFocusEnabled, currentLine, settings.lineFocusColor, settings.lineDimIntensity])

  return {
    state: {
      currentLine,
      totalLines,
      isFocused,
    },
    actions: {
      setLine,
      nextLine,
      previousLine,
      toggleFocus,
      reset,
    },
    getLineStyle,
  }
}

/**
 * Hook for detecting which line is currently in viewport
 * Useful for scroll-following behavior
 */
export const useLineInView = (elementRef: React.RefObject<HTMLElement>) => {
  const [lineInView, setLineInView] = useState(0)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleScroll = () => {
      const rect = element.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const middle = viewportHeight / 2

      // Find which line/section is closest to center
      // This is a simplified version - in production would use line detection
      const relativePosition = middle - (rect.top)

      // Estimate line based on scroll position
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight) || 30
      const estimatedLine = Math.round(relativePosition / lineHeight)

      setLineInView(Math.max(0, estimatedLine))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [elementRef])

  return lineInView
}

/**
 * Hook for keyboard navigation through lines
 * Adds arrow key support for line-by-line navigation
 */
export const useLineNavigation = (currentLine: number, totalLines: number, onLineChange: (line: number) => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          onLineChange(Math.min(currentLine + 1, totalLines - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          onLineChange(Math.max(currentLine - 1, 0))
          break
        case 'Home':
          e.preventDefault()
          onLineChange(0)
          break
        case 'End':
          e.preventDefault()
          onLineChange(totalLines - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentLine, totalLines, onLineChange])

  return {
    supportedKeys: ['ArrowDown', 'ArrowUp', 'Home', 'End'],
  }
}
