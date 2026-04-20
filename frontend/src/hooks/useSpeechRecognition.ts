import { useState, useEffect, useRef } from 'react'

interface SpeechRecognitionConfig {
  continuous?: boolean
  interimResults?: boolean
  language?: string
}

interface SpeechRecognitionState {
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function useSpeechRecognition(config: SpeechRecognitionConfig = {}): SpeechRecognitionState {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    // Only initialize once
    if (isInitializedRef.current) {
      return
    }

    // Check if browser supports speech recognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser. Try Chrome.')
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = config.continuous ?? false
    recognition.interimResults = config.interimResults ?? true
    recognition.lang = config.language ?? 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscriptText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText + ' '
        } else {
          interimTranscriptText += transcriptText
        }
      }

      setTranscript(finalTranscript)
      setInterimTranscript(interimTranscriptText)
    }

    recognition.onerror = (event: any) => {
      setError(`Error: ${event.error}`)
      setIsListening(false)
    }

    recognitionRef.current = recognition
    isInitializedRef.current = true

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, []) // Empty dependency array - only run once

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('')
      setInterimTranscript('')
      setError(null)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const resetTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
  }

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript
  }
}
