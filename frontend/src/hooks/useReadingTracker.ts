import { useRef, useCallback, useState } from 'react'
import { apiClient } from '@/services/api'

export interface ReadingEvent {
  eventType: 'WORD_CLICK' | 'PAUSE' | 'COMPLETION' | 'REREAD'
  wordIndex?: number
  paragraphIndex?: number
  duration?: number
  text?: string
}

export interface ReadingMetrics {
  wpm: number
  difficultyScore: number
  wordCount: number
  duration: number
  hesitations: number
}

export function useReadingTracker(textId: string, textContent: string) {
  const sessionIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [metrics, setMetrics] = useState<ReadingMetrics | null>(null)

  // Start tracking session
  const startSession = useCallback(async () => {
    try {
      const response = await apiClient.post('/reading/session/start', {
        textId,
        textContent
      })
      if (response.success) sessionIdRef.current = (response.data as any).sessionId
      startTimeRef.current = Date.now()
      setIsTracking(true)
      setMetrics(null)
      return (response.data as any)?.sessionId || null
    } catch (error) {
      console.error('Failed to start reading session:', error)
      return null
    }
  }, [textId, textContent])

  // Track an event
  const trackEvent = useCallback(async (event: ReadingEvent) => {
    const sessionId = sessionIdRef.current
    if (!sessionId) return

    try {
      await apiClient.post(`/reading/session/${sessionId}/track`, event)
    } catch (error) {
      console.error('Failed to track reading event:', error)
    }
  }, [])

  // Track word click
  const trackWordClick = useCallback((wordIndex: number, word: string) => {
    trackEvent({
      eventType: 'WORD_CLICK',
      wordIndex,
      text: word
    })
  }, [trackEvent])

  // Track pause
  const trackPause = useCallback((duration: number, paragraphIndex?: number) => {
    trackEvent({
      eventType: 'PAUSE',
      duration,
      paragraphIndex
    })
  }, [trackEvent])

  // Track re-read
  const trackReread = useCallback((paragraphIndex: number) => {
    trackEvent({
      eventType: 'REREAD',
      paragraphIndex
    })
  }, [trackEvent])

  // Complete session
  const completeSession = useCallback(async () => {
    const sessionId = sessionIdRef.current
    if (!sessionId) return null

    try {
      const response = await apiClient.post(`/reading/session/${sessionId}/complete`, null)
      if (response.success) setMetrics(response.data as ReadingMetrics)
      setIsTracking(false)
      sessionIdRef.current = null
      startTimeRef.current = null
      return response.success ? response.data as ReadingMetrics : null
    } catch (error) {
      console.error('Failed to complete reading session:', error)
      return null
    }
  }, [])

  // Analyze difficulty directly
  const analyzeDifficulty = useCallback(async (readingTimeSeconds: number, wordClicks: number[], pauses: number[]) => {
    try {
      const response = await apiClient.post('/reading/analyze', {
        text: textContent,
        readingTimeSeconds,
        wordClicks,
        pauses
      })
      return response.data
    } catch (error) {
      console.error('Failed to analyze difficulty:', error)
      return null
    }
  }, [textContent])

  // Get word difficulty
  const getWordDifficulty = useCallback(async (word: string) => {
    try {
      const response = await apiClient.get(`/reading/words/difficulty/${encodeURIComponent(word)}`)
      return response.data
    } catch (error) {
      console.error('Failed to get word difficulty:', error)
      return null
    }
  }, [])

  // Get elapsed time since session started
  const getElapsedTime = useCallback(() => {
    if (!startTimeRef.current) return 0
    return (Date.now() - startTimeRef.current) / 1000
  }, [])

  return {
    isTracking,
    metrics,
    startSession,
    trackEvent,
    trackWordClick,
    trackPause,
    trackReread,
    completeSession,
    analyzeDifficulty,
    getWordDifficulty,
    getElapsedTime
  }
}
