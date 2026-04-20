import { DyslexiaText } from '@/components/common/DyslexiaText'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { useReadingStore } from '@/stores/readingStore'
import { clsx } from 'clsx'

interface ReadingDisplayProps {
  text: string
  highlightedWordIndex: number
  onWordClick?: (index: number) => void
}

export function ReadingDisplay({ text, highlightedWordIndex, onWordClick }: ReadingDisplayProps) {
  const { isFocusMode } = useReadingStore()
  const { fontSize, lineHeight } = usePreferenceStore()

  // Split text into sentences and words
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const words = text.split(/\s+/)

  // Find which sentence contains the highlighted word
  let currentSentenceIndex = -1
  if (highlightedWordIndex >= 0) {
    let wordCount = 0
    for (let i = 0; i < sentences.length; i++) {
      const sentenceWords = sentences[i].split(/\s+/).length
      if (highlightedWordIndex < wordCount + sentenceWords) {
        currentSentenceIndex = i
        break
      }
      wordCount += sentenceWords
    }
  }

  if (isFocusMode) {
    // Focus mode: highlight current sentence, dim others
    return (
      <div
        className="max-w-3xl mx-auto py-8"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
        }}
      >
        {sentences.map((sentence, sentIndex) => {
          const isHighlighted = sentIndex === currentSentenceIndex
          const isAdjacent = Math.abs(sentIndex - currentSentenceIndex) <= 1

          return (
            <p
              key={sentIndex}
              className={clsx(
                'mb-6 transition-all duration-300',
                isHighlighted
                  ? 'bg-dyslexia-pastelBlue px-4 py-2 -mx-4 rounded'
                  : !isAdjacent && 'opacity-30'
              )}
            >
              {sentence}
            </p>
          )
        })}
      </div>
    )
  }

  // Normal mode: highlight individual words
  return (
    <div
      className="max-w-3xl mx-auto py-8"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
      }}
    >
      <DyslexiaText as="p" size="md">
        {words.map((word, index) => (
          <span
            key={index}
            onClick={() => onWordClick?.(index)}
            className={clsx(
              'inline cursor-pointer transition-colors',
              index === highlightedWordIndex && 'bg-dyslexia-calmBlue bg-opacity-30 rounded px-1',
              'hover:bg-dyslexia-pastelBlue rounded px-1'
            )}
          >
            {word}{' '}
          </span>
        ))}
      </DyslexiaText>
    </div>
  )
}
