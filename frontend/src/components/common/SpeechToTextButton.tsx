import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

interface SpeechToTextButtonProps {
  onTranscript: (text: string) => void
  placeholder?: string
  className?: string
}

export function SpeechToTextButton({
  onTranscript,
  placeholder = 'Speak now...',
  className = ''
}: SpeechToTextButtonProps) {
  // Memoize config to prevent re-creating recognition
  const config = useMemo(() => ({
    continuous: false,
    interimResults: true,
    language: 'en-US'
  }), [])

  const { isListening, transcript, interimTranscript, error, startListening, stopListening, resetTranscript } = useSpeechRecognition(config)

  const hasSubmittedRef = useRef(false)
  const lastTranscriptRef = useRef('')

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      hasSubmittedRef.current = false
      lastTranscriptRef.current = ''
      resetTranscript()
      startListening()
    }
  }, [isListening, startListening, stopListening, resetTranscript])

  // Only submit once when speech ends with new transcript
  useEffect(() => {
    if (transcript && !isListening && !hasSubmittedRef.current && transcript !== lastTranscriptRef.current) {
      hasSubmittedRef.current = true
      lastTranscriptRef.current = transcript
      onTranscript(transcript.trim())
    }
  }, [transcript, isListening, onTranscript])

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {error && (
        <span className="text-xs text-orange-600">
          {error}
        </span>
      )}

      {/* Microphone button */}
      <button
        onClick={handleToggleListening}
        disabled={!!error}
        className={`
          flex items-center justify-center
          w-12 h-12 rounded-full
          transition-all duration-200
          ${isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-dyslexia-calmBlue hover:bg-blue-600'
          }
          ${error ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          text-white
          shadow-md hover:shadow-lg
        `}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        title={
          error
            ? error
            : isListening
            ? 'Click to stop recording'
            : 'Click to speak your description'
        }
      >
        {isListening ? (
          // Stop icon (square)
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        ) : (
          // Microphone icon
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>

      {/* Status indicator */}
      {isListening && (
        <div className="flex items-center gap-2 text-sm">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-dyslexia-calmBlue font-medium">Listening...</span>
          {interimTranscript && (
            <span className="text-gray-500 italic">"{interimTranscript}"</span>
          )}
        </div>
      )}

      {/* Show what was captured when done */}
      {!isListening && transcript && !error && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-600">✓ Captured:</span>
          <span className="text-gray-700 italic">"{transcript}"</span>
          <button
            onClick={() => {
              resetTranscript()
              hasSubmittedRef.current = false
              lastTranscriptRef.current = ''
            }}
            className="text-xs text-dyslexia-calmBlue hover:underline ml-2"
          >
            Clear
          </button>
        </div>
      )}

      {/* Instructions tooltip */}
      {!isListening && !error && !transcript && (
        <div className="text-xs text-gray-500">
          Click the mic to speak
        </div>
      )}
    </div>
  )
}
