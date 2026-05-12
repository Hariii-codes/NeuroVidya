import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useDyslexiaSettings } from '../DyslexiaProvider'
import { useLineFocus, useLineNavigation } from '../hooks/useLineFocus'
import './ReadingGuide.css'

export interface ReadingGuideProps {
  children: string | string[]
  autoScroll?: boolean
  keyboardNav?: boolean
  showControls?: boolean
  lineByLine?: boolean
  className?: string
  onLineChange?: (lineIndex: number) => void
}

export interface ReadingGuideControlsProps {
  currentLine: number
  totalLines: number
  onPrevious: () => void
  onNext: () => void
  onReset: () => void
  onToggleFocus: () => void
  isFocused: boolean
}

/**
 * Dyslexia-First Reading Guide Component
 *
 * Features:
 * - Line-by-line reading focus
 * - Highlights current line, dims others
 * - Keyboard navigation (arrow keys)
 * - Auto-scroll option
 * - Reading ruler visual guide
 */
export const ReadingGuide: React.FC<ReadingGuideProps> = ({
  children,
  showControls = true,
  lineByLine = false,
  className = '',
  onLineChange,
}) => {
  const { settings } = useDyslexiaSettings()
  const contentRef = useRef<HTMLDivElement>(null)

  // Normalize content to array of lines
  const lines = useMemo(() => {
    if (Array.isArray(children)) {
      return children.flatMap(c =>
        String(c).split(/\n/).filter(l => l.trim().length > 0)
      )
    }
    return String(children).split(/\n/).filter(l => l.trim().length > 0)
  }, [children])

  // Line focus hook
  const {
    state: { currentLine, isFocused },
    actions: { setLine, nextLine, previousLine, reset, toggleFocus },
    getLineStyle,
  } = useLineFocus(lines.length)

  // Keyboard navigation
  useLineNavigation(currentLine, lines.length, (line) => {
    setLine(line)
    onLineChange?.(line)
  })

  // Scroll current line into view
  useEffect(() => {
    if (contentRef.current) {
      const lineElements = contentRef.current.querySelectorAll('.reading-guide__line')
      const currentLineEl = lineElements[currentLine] as HTMLElement

      if (currentLineEl) {
        currentLineEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [currentLine])

  // Handle line change
  const handleLineChange = useCallback((lineIndex: number) => {
    setLine(lineIndex)
    onLineChange?.(lineIndex)
  }, [setLine, onLineChange])

  // Handle line click
  const handleLineClick = useCallback((index: number) => {
    if (settings.lineFocusEnabled) {
      handleLineChange(index)
    }
  }, [settings.lineFocusEnabled, handleLineChange])

  const guideClasses = [
    'reading-guide',
    lineByLine && 'reading-guide--line-by-line',
    isFocused && 'reading-guide--focused',
    className,
  ].filter(Boolean).join(' ')

  const contentStyle = {
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    wordSpacing: `${settings.wordSpacing}em`,
    letterSpacing: `${settings.letterSpacing}em`,
  }

  return (
    <div className={guideClasses}>
      {showControls && (
        <ReadingGuideControls
          currentLine={currentLine}
          totalLines={lines.length}
          onPrevious={previousLine}
          onNext={nextLine}
          onReset={reset}
          onToggleFocus={toggleFocus}
          isFocused={isFocused}
        />
      )}

      <div
        ref={contentRef}
        className="reading-guide__content"
        style={contentStyle}
      >
        {lines.map((line, index) => (
          <div
            key={index}
            className={`reading-guide__line ${index === currentLine && isFocused ? 'reading-guide__line--focused' : ''}`}
            style={{
              ...getLineStyle(index),
              cursor: settings.lineFocusEnabled ? 'pointer' : 'default',
            }}
            onClick={() => handleLineClick(index)}
            role="button"
            tabIndex={settings.lineFocusEnabled ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleLineClick(index)
              }
            }}
            aria-label={`Line ${index + 1}${index === currentLine && isFocused ? ' (currently reading)' : ''}`}
          >
            <span className="reading-guide__line-number">{index + 1}</span>
            <span className="reading-guide__line-text">{line}</span>
          </div>
        ))}

        {/* Reading ruler - follows current line */}
        {isFocused && (
          <div
            className="reading-guide__ruler"
            style={{
              top: `calc(${currentLine * (settings.fontSize * settings.lineHeight)}px + ${settings.fontSize * 0.5}px)`,
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Progress indicator */}
      {isFocused && (
        <div className="reading-guide__progress">
          Line {currentLine + 1} of {lines.length}
        </div>
      )}
    </div>
  )
}

/**
 * Reading Guide Controls
 * Buttons for navigation and toggling focus
 */
export const ReadingGuideControls: React.FC<ReadingGuideControlsProps> = ({
  currentLine,
  totalLines,
  onPrevious,
  onNext,
  onReset,
  onToggleFocus,
  isFocused,
}) => {
  return (
    <div className="reading-guide__controls">
      <button
        className="reading-guide__control-btn"
        onClick={onToggleFocus}
        aria-pressed={isFocused}
        title={isFocused ? 'Disable focus' : 'Enable focus'}
      >
        {isFocused ? '🔍 Focus On' : '🔍 Focus Off'}
      </button>

      <button
        className="reading-guide__control-btn"
        onClick={onReset}
        title="Go to start"
        disabled={!isFocused}
      >
        ⏮
      </button>

      <button
        className="reading-guide__control-btn"
        onClick={onPrevious}
        title="Previous line"
        disabled={!isFocused || currentLine === 0}
      >
        ↑
      </button>

      <button
        className="reading-guide__control-btn"
        onClick={onNext}
        title="Next line"
        disabled={!isFocused || currentLine >= totalLines - 1}
      >
        ↓
      </button>

      <span className="reading-guide__position">
        {currentLine + 1} / {totalLines}
      </span>
    </div>
  )
}

/**
 * Reading Mask - Reveals text line by line
 * For focused reading exercises
 */
export const ReadingMask: React.FC<{
  lines: string[]
  onReveal?: (lineIndex: number) => void
  className?: string
}> = ({ lines, onReveal, className = '' }) => {
  const [revealedLines, setRevealedLines] = useState<Set<number>>(new Set())
  const [_currentLine, setCurrentLine] = useState(0)

  const revealLine = useCallback((index: number) => {
    setRevealedLines((prev) => new Set(prev).add(index))
    setCurrentLine(index + 1)
    onReveal?.(index)
  }, [onReveal])

  const reset = useCallback(() => {
    setRevealedLines(new Set())
    setCurrentLine(0)
  }, [])

  return (
    <div className={`reading-mask ${className}`.trim()}>
      <div className="reading-mask__content">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`reading-mask__line ${revealedLines.has(index) ? 'reading-mask__line--revealed' : 'reading-mask__line--hidden'}`}
            onClick={() => revealLine(index)}
          >
            {revealedLines.has(index) ? line : '••• Click to reveal •••'}
          </div>
        ))}
      </div>

      <div className="reading-mask__controls">
        <button onClick={reset} className="reading-mask__reset-btn">
          Reset
        </button>
        <span className="reading-mask__progress">
          {revealedLines.size} / {lines.length} revealed
        </span>
      </div>
    </div>
  )
}

/**
 * Reading Ruler - Horizontal guide that follows mouse/cursor
 */
export const ReadingRuler: React.FC<{
  children: React.ReactNode
  color?: string
  height?: string
  className?: string
}> = ({ children, color = 'rgba(251, 191, 36, 0.3)', height = '2px', className = '' }) => {
  const [position, setPosition] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition(e.clientY - rect.top)
  }, [])

  const handleMouseEnter = useCallback(() => setIsVisible(true), [])
  const handleMouseLeave = useCallback(() => setIsVisible(false), [])

  return (
    <div
      ref={containerRef}
      className={`reading-ruler ${className}`.trim()}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className="reading-ruler__line"
          style={{
            top: `${position}px`,
            backgroundColor: color,
            height,
          }}
        />
      )}
    </div>
  )
}

export default ReadingGuide
