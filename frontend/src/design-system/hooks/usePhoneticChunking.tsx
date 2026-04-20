import { useCallback, useState } from 'react'
import { useDyslexiaSettings } from '../DyslexiaProvider'
import { chunkWordBySyllables } from '../utils/syllableRules'

export interface SyllableChunk {
  text: string
  colorIndex: number
  isPhonetic: boolean
}

export interface ChunkedText {
  chunks: SyllableChunk[]
  original: string
  processed: string
}

/**
 * Hook for phonetic/syllable chunking of text
 * Splits words into syllables and color-codes them
 */
export const usePhoneticChunking = () => {
  const { settings } = useDyslexiaSettings()
  const [aiChunkingInProgress, setAiChunkingInProgress] = useState(false)

  /**
   * Chunk a single word into syllables
   */
  const chunkWord = useCallback((word: string): SyllableChunk[] => {
    if (!settings.phoneticChunkingEnabled) {
      return [{ text: word, colorIndex: 0, isPhonetic: false }]
    }

    // Use rule-based chunking first (fast, no API)
    const syllables = chunkWordBySyllables(word)

    return syllables.map((syllable, index) => ({
      text: syllable,
      colorIndex: index % 4, // Cycle through 4 colors
      isPhonetic: settings.chunkStyle === 'sounds' || settings.chunkStyle === 'both',
    }))
  }, [settings.phoneticChunkingEnabled, settings.chunkStyle])

  /**
   * Chunk a full text into syllables
   * Preserves whitespace and punctuation
   */
  const chunkText = useCallback((text: string): ChunkedText => {
    if (!settings.phoneticChunkingEnabled) {
      return {
        chunks: [{ text, colorIndex: 0, isPhonetic: false }],
        original: text,
        processed: text,
      }
    }

    // Split into words and non-word tokens
    const tokens = text.split(/([a-zA-Z0-9']+)/g)
    const chunks: SyllableChunk[] = []

    for (const token of tokens) {
      // Check if token is a word (alphanumeric)
      if (/^[a-zA-Z0-9']+$/.test(token)) {
        chunks.push(...chunkWord(token))
      } else if (token.length > 0) {
        // Preserve whitespace and punctuation as-is
        chunks.push({ text: token, colorIndex: 0, isPhonetic: false })
      }
    }

    return {
      chunks,
      original: text,
      processed: chunks.map(c => c.text).join(''),
    }
  }, [settings.phoneticChunkingEnabled, chunkWord])

  /**
   * Apply AI enhancement for complex words
   * This would call the backend API for more accurate chunking
   */
  const enhanceWithAI = useCallback(async (text: string): Promise<ChunkedText> => {
    if (!settings.useAIForChunking) {
      return chunkText(text)
    }

    setAiChunkingInProgress(true)

    try {
      // Call backend API for AI chunking
      const response = await fetch('/api/text/chunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style: settings.chunkStyle }),
      })

      if (!response.ok) {
        throw new Error('AI chunking failed')
      }

      const result = await response.json()
      return result.data || chunkText(text)
    } catch (error) {
      console.error('AI chunking error, falling back to rules:', error)
      return chunkText(text)
    } finally {
      setAiChunkingInProgress(false)
    }
  }, [settings.useAIForChunking, settings.chunkStyle, chunkText])

  /**
   * Render chunked text as React elements with colors
   */
  const renderChunkedText = useCallback((chunked: ChunkedText) => {
    return chunked.chunks.map((chunk, index) => {
      const colorClass = chunk.colorIndex > 0 ? `color-${chunk.colorIndex}` : ''

      return (
        <span
          key={index}
          className={`syllable-chunk ${colorClass}`.trim()}
          style={{
            backgroundColor: chunk.colorIndex > 0 ? undefined : 'transparent',
          }}
        >
          {chunk.text}
        </span>
      )
    })
  }, [])

  /**
   * Get CSS for syllable colors
   */
  const getSyllableColors = useCallback(() => {
    return [
      'var(--syllable-color-1)',
      'var(--syllable-color-2)',
      'var(--syllable-color-3)',
      'var(--syllable-color-4)',
    ]
  }, [])

  return {
    // State
    isEnabled: settings.phoneticChunkingEnabled,
    chunkStyle: settings.chunkStyle,
    useAI: settings.useAIForChunking,
    aiInProgress: aiChunkingInProgress,

    // Methods
    chunkWord,
    chunkText,
    enhanceWithAI,
    renderChunkedText,
    getSyllableColors,

    // Helpers
    shouldChunk: settings.phoneticChunkingEnabled,
  }
}

/**
 * Hook for real-time chunking of input text
 * Useful for text areas where user types and sees chunking live
 */
export const useRealtimeChunking = (text: string, debounceMs: number = 300) => {
  const { chunkText, aiInProgress, shouldChunk, enhanceWithAI, useAI } = usePhoneticChunking()
  const [chunked, setChunked] = useState<ChunkedText>({
    chunks: [{ text, colorIndex: 0, isPhonetic: false }],
    original: text,
    processed: text,
  })

  // Debounced chunking
  useState(() => {
    const timeoutId = setTimeout(async () => {
      if (!shouldChunk || text.trim().length === 0) {
        setChunked({
          chunks: [{ text, colorIndex: 0, isPhonetic: false }],
          original: text,
          processed: text,
        })
        return
      }

      if (useAI) {
        const result = await enhanceWithAI(text)
        setChunked(result)
      } else {
        setChunked(chunkText(text))
      }
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  })

  return {
    chunked,
    aiInProgress,
  }
}

/**
 * Hook for cached chunking results
 * Stores chunked text in memory to avoid re-processing
 */
export const useCachedChunking = () => {
  const cache = useRef<Map<string, ChunkedText>>(new Map())
  const { chunkText, enhanceWithAI, useAI } = usePhoneticChunking()

  const getCached = useCallback(async (text: string): Promise<ChunkedText> => {
    // Check cache first
    const cached = cache.current.get(text)
    if (cached) {
      return cached
    }

    // Process and cache
    const result = useAI ? await enhanceWithAI(text) : chunkText(text)
    cache.current.set(text, result)

    return result
  }, [chunkText, enhanceWithAI, useAI])

  const clearCache = useCallback(() => {
    cache.current.clear()
  }, [])

  return {
    getCached,
    clearCache,
    cacheSize: cache.current.size,
  }
}

import { useRef } from 'react'
