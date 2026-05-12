import React, { useMemo, useState } from 'react'
import { useDyslexiaSettings } from '../DyslexiaProvider'
import { usePhoneticChunking } from '../hooks/usePhoneticChunking'
import { chunkWordBySyllables, getWordDifficulty, shouldUseAIForWord } from '../utils/syllableRules'
import './PhoneticHighlighter.css'

export interface PhoneticHighlighterProps {
  text: string
  interactive?: boolean
  showSyllableCount?: boolean
  showWordDifficulty?: boolean
  onSyllableClick?: (syllable: string, index: number) => void
  className?: string
  style?: React.CSSProperties
}

export interface SyllableInfo {
  word: string
  syllables: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  needsAI: boolean
}

/**
 * Dyslexia-First Phonetic Highlighter
 *
 * Features:
 * - Color-coded syllable chunking
 * - Visual word difficulty indicators
 * - Interactive syllable clicking
 * - AI enhancement for complex words
 */
export const PhoneticHighlighter: React.FC<PhoneticHighlighterProps> = ({
  text,
  interactive = false,
  showSyllableCount = false,
  showWordDifficulty = false,
  onSyllableClick,
  className = '',
  style,
}) => {
  const { settings } = useDyslexiaSettings()
  const { chunkText, renderChunkedText } = usePhoneticChunking()
  const [hoveredSyllable, setHoveredSyllable] = useState<string | null>(null)

  // Process text into words
  const processedText = useMemo(() => {
    if (!text) {
      return { chunks: [{ text: '', colorIndex: 0, isPhonetic: false }], original: '', processed: '' }
    }
    if (!settings.phoneticChunkingEnabled) {
      return { chunks: [{ text, colorIndex: 0, isPhonetic: false }], original: text, processed: text }
    }

    return chunkText(text)
  }, [text, settings.phoneticChunkingEnabled, chunkText])

  // Extract words for analysis
  const words = useMemo(() => {
    if (!text) return []
    const wordRegex = /[a-zA-Z0-9']+/g
    const matches = text.match(wordRegex) || []
    return matches.map(word => ({
      word,
      syllables: chunkWordBySyllables(word),
      difficulty: getWordDifficulty(word),
      needsAI: shouldUseAIForWord(word),
    })) as SyllableInfo[]
  }, [text])

  // Render interactive syllable highlighting
  const renderInteractive = () => {
    if (!text) return null
    const tokens = text.split(/([a-zA-Z0-9']+|[\s\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000]+)/g)

    return tokens.map((token, tokenIndex) => {
      // Check if token is a word
      if (!/^[a-zA-Z0-9']+$/.test(token)) {
        return <span key={tokenIndex}>{token}</span>
      }

      // It's a word - chunk it
      const syllables = chunkWordBySyllables(token)
      const wordInfo = words.find(w => w.word.toLowerCase() === token.toLowerCase())
      const difficultyColor = wordInfo?.difficulty === 'hard' ? 'var(--dyslexia-accent, #3b82f6)' :
                             wordInfo?.difficulty === 'medium' ? 'var(--dyslexia-focus-yellow, #fbbf24)' :
                             undefined

      return (
        <span
          key={tokenIndex}
          className={`phonetic-word ${difficultyColor ? 'phonetic-word--marked' : ''}`.trim()}
          style={{ borderBottom: difficultyColor ? `3px solid ${difficultyColor}` : undefined }}
          title={wordInfo ? `${wordInfo.syllables.length} syllables • ${wordInfo.difficulty} difficulty` : undefined}
        >
          {syllables.map((syllable, syllableIndex) => {
            const colorClass = `color-${(syllableIndex % 4) + 1}`
            const isHovered = hoveredSyllable === `${tokenIndex}-${syllableIndex}`

            return (
              <span
                key={syllableIndex}
                className={`phonetic-syllable ${colorClass} ${isHovered ? 'phonetic-syllable--hovered' : ''}`.trim()}
                onClick={() => interactive && onSyllableClick?.(syllable, syllableIndex)}
                onMouseEnter={() => setHoveredSyllable(`${tokenIndex}-${syllableIndex}`)}
                onMouseLeave={() => setHoveredSyllable(null)}
              >
                {syllable}
              </span>
            )
          })}
          {showSyllableCount && (
            <sup className="phonetic-syllable-count">{syllables.length}</sup>
          )}
        </span>
      )
    })
  }

  const containerStyle = {
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    wordSpacing: `${settings.wordSpacing}em`,
    letterSpacing: `${settings.letterSpacing}em`,
    ...style,
  }

  const classes = [
    'phonetic-highlighter',
    interactive && 'phonetic-highlighter--interactive',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} style={containerStyle}>
      {settings.phoneticChunkingEnabled && interactive ? (
        renderInteractive()
      ) : (
        renderChunkedText(processedText)
      )}

      {showWordDifficulty && settings.phoneticChunkingEnabled && (
        <div className="phonetic-legend">
          <span className="phonetic-legend-item">
            <span className="phonetic-legend-dot phonetic-legend-dot--easy"></span>
            Easy (1-2 syllables)
          </span>
          <span className="phonetic-legend-item">
            <span className="phonetic-legend-dot phonetic-legend-dot--medium"></span>
            Medium (3-4 syllables)
          </span>
          <span className="phonetic-legend-item">
            <span className="phonetic-legend-dot phonetic-legend-dot--hard"></span>
            Hard (5+ syllables)
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Syllable Counter - Shows syllable count for words
 */
export const SyllableCounter: React.FC<{
  word: string
  showBreakdown?: boolean
}> = ({ word, showBreakdown = false }) => {
  const syllables = chunkWordBySyllables(word)
  const difficulty = getWordDifficulty(word)

  return (
    <span className={`syllable-counter syllable-counter--${difficulty}`}>
      {syllables.length}
      {showBreakdown && (
        <span className="syllable-counter__breakdown">
          {syllables.join('•')}
        </span>
      )}
    </span>
  )
}

/**
 * Word Difficulty Badge
 */
export const WordDifficultyBadge: React.FC<{
  word: string
  showSyllableCount?: boolean
}> = ({ word, showSyllableCount = true }) => {
  const syllables = chunkWordBySyllables(word)
  const difficulty = getWordDifficulty(word)

  const badges = {
    easy: { label: 'Easy', color: 'var(--syllable-color-2, #D1FAE5)' },
    medium: { label: 'Medium', color: 'var(--syllable-color-3, #FEF3C7)' },
    hard: { label: 'Hard', color: 'var(--syllable-color-4, #FEE2E2)' },
  }

  const badge = badges[difficulty]

  return (
    <span
      className="word-difficulty-badge"
      style={{ backgroundColor: badge.color }}
      title={`${syllables.length} syllables`}
    >
      {badge.label}
      {showSyllableCount && ` (${syllables.length})`}
    </span>
  )
}

/**
 * Chunk Style Selector
 */
export const ChunkStyleSelector: React.FC<{
  value: 'syllables' | 'sounds' | 'both'
  onChange: (value: 'syllables' | 'sounds' | 'both') => void
  disabled?: boolean
}> = ({ value, onChange, disabled = false }) => {
  return (
    <div className="chunk-style-selector">
      <label className="chunk-style-selector__label">Chunking Style:</label>

      <div className="chunk-style-selector__options">
        {[
          { value: 'syllables', label: 'Syllables', icon: '📝' },
          { value: 'sounds', label: 'Sounds', icon: '🔊' },
          { value: 'both', label: 'Both', icon: '📝🔊' },
        ].map((option) => (
          <button
            key={option.value}
            className={`chunk-style-option ${value === option.value ? 'chunk-style-option--active' : ''}`}
            onClick={() => onChange(option.value as any)}
            disabled={disabled}
            aria-pressed={value === option.value}
          >
            <span className="chunk-style-option__icon">{option.icon}</span>
            <span className="chunk-style-option__label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Interactive Word Builder
 * Allows users to build words from syllables
 */
export const InteractiveWordBuilder: React.FC<{
  words: string[]
  onComplete?: (builtWords: string[]) => void
}> = ({ words, onComplete: _onComplete }) => {
  const [builtWords, setBuiltWords] = useState<string[]>([])

  const availableWords = words.filter(w => !builtWords.includes(w))

  return (
    <div className="interactive-word-builder">
      <h3>Build Words from Syllables</h3>

      <div className="word-builder__pool">
        {availableWords.map((word) => {
          const syllables = chunkWordBySyllables(word)
          return (
            <div key={word} className="word-builder-word">
              {syllables.map((syllable, index) => (
                <span
                  key={index}
                  className={`phonetic-syllable color-${(index % 4) + 1}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('syllable', syllable)
                    e.dataTransfer.setData('word', word)
                  }}
                >
                  {syllable}
                </span>
              ))}
            </div>
          )
        })}
      </div>

      <div className="word-builder__built">
        {builtWords.map((word) => (
          <div key={word} className="built-word">
            {word}
            <button onClick={() => setBuiltWords(bw => bw.filter(w => w !== word))}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PhoneticHighlighter
