import { useState, useCallback, useEffect } from 'react'
import { ttsService, type TTSConfig } from '../services/tts'
import { usePreferenceStore } from '../stores/preferenceStore'

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentWord, setCurrentWord] = useState('')
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const { speechSpeed } = usePreferenceStore()

  useEffect(() => {
    setAvailableVoices(ttsService.availableVoices)

    // Update voices when they change
    const handleVoicesChanged = () => {
      setAvailableVoices(ttsService.availableVoices)
    }

    speechSynthesis.onvoiceschanged = handleVoicesChanged

    return () => {
      speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const speak = useCallback((text: string, config?: Partial<TTSConfig>) => {
    const fullConfig: TTSConfig = {
      rate: config?.rate ?? speechSpeed,
      pitch: config?.pitch ?? 1.0,
      volume: config?.volume ?? 1.0,
      voice: config?.voice,
    }

    setIsPlaying(true)
    setIsPaused(false)

    ttsService.speak(
      text,
      fullConfig,
      (index, word) => {
        setCurrentWordIndex(index)
        setCurrentWord(word)
      },
      () => {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentWord('')
        setCurrentWordIndex(0)
      }
    )
  }, [speechSpeed])

  const pause = useCallback(() => {
    ttsService.pause()
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    ttsService.resume()
    setIsPaused(false)
  }, [])

  const stop = useCallback(() => {
    ttsService.stop()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentWord('')
    setCurrentWordIndex(0)
  }, [])

  return {
    isPlaying,
    isPaused,
    currentWord,
    currentWordIndex,
    availableVoices,
    speak,
    pause,
    resume,
    stop,
    isSupported: ttsService.isSupported,
  }
}
