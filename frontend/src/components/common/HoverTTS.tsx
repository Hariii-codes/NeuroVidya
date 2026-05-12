// frontend/src/components/common/HoverTTS.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { useAudioSettings } from '@/design-system/DyslexiaProvider'
import './HoverTTS.css'

interface HoverTTSProps {
  children: React.ReactNode
  className?: string
}

// Global state to prevent multiple simultaneous speeches
let globalIsSpeaking = false
const speakingListeners = new Set<(speaking: boolean) => void>()

export function HoverTTS({ children, className = '' }: HoverTTSProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)
  const { speechSpeed } = useAudioSettings()
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isSpeakingRef = useRef(false)

  // Keep ref in sync with state
  useEffect(() => {
    isSpeakingRef.current = isSpeaking
  }, [isSpeaking])

  // Sync with global speaking state
  useEffect(() => {
    const listener = (speaking: boolean) => {
      if (speaking !== isSpeaking) {
        setIsSpeaking(speaking)
      }
    }
    speakingListeners.add(listener)
    return () => { speakingListeners.delete(listener) }
  }, [isSpeaking])

  // Load voices on mount
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        utteranceRef.current.onend = null
        utteranceRef.current.onerror = null
      }
      if (window.speechSynthesis && isSpeakingRef.current) {
        window.speechSynthesis.cancel()
        globalIsSpeaking = false
        speakingListeners.forEach(fn => fn(false))
      }
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    console.log('HoverTTS: Stopping speech')
    window.speechSynthesis.cancel()
    globalIsSpeaking = false
    utteranceRef.current = null
    speakingListeners.forEach(fn => fn(false))
  }, [])

  const speakText = (text: string) => {
    if (!window.speechSynthesis || !text.trim()) return

    console.log('HoverTTS: Speaking text:', text.substring(0, 50) + '...')

    // Stop any current speech
    stopSpeaking()

    // Delay to ensure cancel takes effect
    setTimeout(() => {
      if (globalIsSpeaking) return

      const utterance = new SpeechSynthesisUtterance(text)

      // Settings to reduce "loudness" perception
      utterance.rate = Math.min(speechSpeed, 0.7) // Even slower = less aggressive
      utterance.pitch = 0.9 // Slightly lower pitch = less piercing
      utterance.volume = 0.3 // 30% volume (much quieter)

      // Try to find a calm, clear voice
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Samantha') || v.name.includes('Google UK') || v.name.includes('Daniel'))
      ) || voices.find(v =>
        v.lang.startsWith('en') && v.localService === true
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0]

      if (preferredVoice) {
        console.log('HoverTTS: Using voice:', preferredVoice.name)
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        console.log('HoverTTS: Speech started')
        globalIsSpeaking = true
        speakingListeners.forEach(fn => fn(true))
      }

      utterance.onend = () => {
        console.log('HoverTTS: Speech ended')
        globalIsSpeaking = false
        utteranceRef.current = null
        speakingListeners.forEach(fn => fn(false))
      }

      utterance.onerror = (e) => {
        console.log('HoverTTS: Speech error:', e)
        globalIsSpeaking = false
        utteranceRef.current = null
        speakingListeners.forEach(fn => fn(false))
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }, 100)
  }

  const getTextContent = (element: HTMLElement): string => {
    return element.innerText || element.textContent || ''
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (globalIsSpeaking) {
      stopSpeaking()
      return
    }

    const text = getTextContent(elementRef.current!)
    if (text.trim()) {
      speakText(text)
    }
  }

  return (
    <span
      ref={elementRef as any}
      className={`hover-tts-container ${className}`}
    >
      {children}
      {/* Speaker icon - visible on hover */}
      <button
        onClick={handleClick}
        className={`hover-tts-icon ${isSpeaking ? 'speaking' : ''}`}
        aria-label="Read aloud"
        type="button"
        title={isSpeaking ? "Stop reading" : "Read aloud"}
      >
        {isSpeaking ? '🔇' : '🔊'}
      </button>
    </span>
  )
}
