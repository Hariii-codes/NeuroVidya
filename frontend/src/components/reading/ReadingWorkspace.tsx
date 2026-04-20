import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useReadingStore } from '@/stores/readingStore'
import { useReadingTracker } from '@/hooks/useReadingTracker'
import { TextInputArea } from './TextInputArea'
import { ReadingDisplay } from './ReadingDisplay'
import { AssistiveToolbar } from './AssistiveToolbar'
import { TTSControl } from './TTSControl'
import { ReadingMetrics } from './ReadingMetrics'

function generateTextId(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

export function ReadingWorkspace() {
  const { currentText, highlightedWordIndex, setHighlightedWord } = useReadingStore()
  const wordClicksRef = useRef<number[]>([])
  const textIdRef = useRef<string>('')

  // Generate a unique ID for this text
  const textId = currentText ? generateTextId(currentText.substring(0, 50)) : 'unknown'

  const tracker = useReadingTracker(textId, currentText || '')

  // Start tracking session when text loads
  useEffect(() => {
    if (currentText && textId !== textIdRef.current) {
      textIdRef.current = textId
      wordClicksRef.current = []
      tracker.startSession()
    }
  }, [currentText, textId, tracker])

  // Complete session on unmount
  useEffect(() => {
    return () => {
      if (tracker.isTracking) {
        tracker.completeSession()
      }
    }
  }, [tracker])

  const handleWordClick = (index: number) => {
    setHighlightedWord(index)
    wordClicksRef.current.push(index)

    // Track the click
    const words = currentText?.split(/\s+/) || []
    if (words[index]) {
      tracker.trackWordClick(index, words[index])
    }
  }

  const handleCompleteReading = async () => {
    const metrics = await tracker.completeSession()
    if (metrics) {
      console.log('Reading session completed:', metrics)
    }
  }

  return (
    <div className="min-h-screen bg-dyslexia-cream">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-dyslexia-calmBlue hover:underline">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-dyslexia-calmBlue">
                Reading Workspace
              </h1>
            </div>
            {tracker.isTracking && (
              <span className="text-sm text-green-600">
                Recording... {Math.floor(tracker.getElapsedTime())}s
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!currentText ? (
          <TextInputArea />
        ) : (
          <>
            <AssistiveToolbar />
            <TTSControl />
            <ReadingDisplay
              text={currentText}
              highlightedWordIndex={highlightedWordIndex}
              onWordClick={handleWordClick}
            />
            {tracker.metrics && (
              <ReadingMetrics metrics={tracker.metrics} />
            )}
            {tracker.isTracking && (
              <button
                onClick={handleCompleteReading}
                className="mt-4 px-6 py-3 bg-dyslexia-calmBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Complete Reading
              </button>
            )}
          </>
        )}
      </main>
    </div>
  )
}
