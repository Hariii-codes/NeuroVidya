import { useCallback } from 'react'
import { useReadingStore } from '../stores/readingStore'

export function useFocusMode() {
  const { isFocusMode, toggleFocus } = useReadingStore()

  const enable = useCallback(() => {
    if (!isFocusMode) {
      toggleFocus()
    }
  }, [isFocusMode, toggleFocus])

  const disable = useCallback(() => {
    if (isFocusMode) {
      toggleFocus()
    }
  }, [isFocusMode, toggleFocus])

  return {
    isFocusMode,
    toggle: toggleFocus,
    enable,
    disable,
  }
}
