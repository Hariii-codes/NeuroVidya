import { create } from 'zustand'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

interface SpellCorrection {
  original: string
  correction: string
  confidence: string
  position: { start: number; end: number }
}

interface ReadingState {
  // Text state
  currentText: string
  simplifiedText: string

  // Focus mode
  isFocusMode: boolean
  highlightedWordIndex: number

  // TTS state (managed by useTTS but tracked here)
  isPlaying: boolean

  // Spell check state
  spellCorrections: SpellCorrection[]
  isCheckingSpelling: boolean
  showSpellCorrections: boolean

  // Actions
  setText: (text: string) => void
  simplify: () => Promise<void>
  toggleFocus: () => void
  setHighlightedWord: (index: number) => void
  clearText: () => void
  checkSpelling: () => Promise<void>
  applyCorrection: (index: number) => void
  toggleSpellCorrections: () => void
  clearSpellCorrections: () => void
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  currentText: '',
  simplifiedText: '',
  isFocusMode: false,
  highlightedWordIndex: -1,
  isPlaying: false,
  spellCorrections: [],
  isCheckingSpelling: false,
  showSpellCorrections: false,

  setText: (text: string) => {
    set({ currentText: text, simplifiedText: '', spellCorrections: [], showSpellCorrections: false })
  },

  simplify: async () => {
    const { currentText } = get()
    if (!currentText) return

    try {
      const response = await fetch(`${API_BASE}/text/simplify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, readingLevel: 'elementary' }),
      })

      if (!response.ok) throw new Error('Simplification failed')

      const data = await response.json()
      set({ simplifiedText: data.simplifiedText })
    } catch (error) {
      console.error('Simplification error:', error)
      throw error
    }
  },

  toggleFocus: () => {
    set((state) => ({ isFocusMode: !state.isFocusMode }))
  },

  setHighlightedWord: (index: number) => {
    set({ highlightedWordIndex: index })
  },

  checkSpelling: async () => {
    const { currentText } = get()
    if (!currentText) return

    set({ isCheckingSpelling: true })

    try {
      const response = await fetch(`${API_BASE}/text/spell-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText }),
      })

      if (!response.ok) throw new Error('Spell check failed')

      const data = await response.json()
      set({ spellCorrections: data.corrections, showSpellCorrections: true })
    } catch (error) {
      console.error('Spell check error:', error)
      throw error
    } finally {
      set({ isCheckingSpelling: false })
    }
  },

  applyCorrection: (index: number) => {
    const { spellCorrections, currentText } = get()
    const correction = spellCorrections[index]

    if (!correction) return

    // Find the word in the text and replace it
    const words = currentText.split(/(\s+)/)
    let charCount = 0

    for (let i = 0; i < words.length; i++) {
      const wordLength = words[i].length
      if (charCount >= correction.position.start && charCount + wordLength <= correction.position.end) {
        words[i] = correction.correction
        break
      }
      charCount += wordLength
    }

    const newText = words.join('')
    const newCorrections = spellCorrections.filter((_, idx) => idx !== index)

    set({
      currentText: newText,
      spellCorrections: newCorrections,
      simplifiedText: '', // Clear simplified text as original changed
    })
  },

  toggleSpellCorrections: () => {
    set((state) => ({ showSpellCorrections: !state.showSpellCorrections }))
  },

  clearSpellCorrections: () => {
    set({ spellCorrections: [], showSpellCorrections: false })
  },

  clearText: () => {
    set({
      currentText: '',
      simplifiedText: '',
      isFocusMode: false,
      highlightedWordIndex: -1,
      spellCorrections: [],
      showSpellCorrections: false,
    })
  },
}))
