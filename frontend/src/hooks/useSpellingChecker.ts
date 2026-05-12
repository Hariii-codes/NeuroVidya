import { useState, useCallback } from 'react'
import { apiClient } from '@/services/api'

export interface SpellingError {
  original: string
  correction: string
  errorType: string
  position: number
  suggestions: string[]
}

export interface SpellingCheckResult {
  errors: SpellingError[]
  userPattern: Record<string, number>
  correctedText: string
}

export interface ErrorPatternAnalysis {
  commonErrors: Array<{ type: string; count: number }>
  strugglingPatterns: string[]
  averageDifficulty: number
  recommendedExercises: string[]
}

export function useSpellingChecker() {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<SpellingCheckResult | null>(null)
  const [patterns, setPatterns] = useState<ErrorPatternAnalysis | null>(null)

  const checkSpelling = useCallback(async (text: string) => {
    if (!text.trim()) return null

    setIsChecking(true)
    try {
      const response = await apiClient.post('/spelling/check', { text })
      if (response.success) setResult(response.data as SpellingCheckResult)
      return response.success ? response.data as SpellingCheckResult : null
    } catch (error) {
      console.error('Failed to check spelling:', error)
      return null
    } finally {
      setIsChecking(false)
    }
  }, [])

  const getErrorPatterns = useCallback(async () => {
    try {
      const response = await apiClient.get('/spelling/patterns')
      if (response.success) setPatterns(response.data as ErrorPatternAnalysis)
      return response.success ? response.data as ErrorPatternAnalysis : null
    } catch (error) {
      console.error('Failed to get error patterns:', error)
      return null
    }
  }, [])

  const markWordMastered = useCallback(async (wordId: string) => {
    try {
      await apiClient.post(`/spelling/words/${wordId}/mark-mastered`, null)
      return true
    } catch (error) {
      console.error('Failed to mark word as mastered:', error)
      return false
    }
  }, [])

  const getSpellingHistory = useCallback(async () => {
    try {
      const response = await apiClient.get('/spelling/history')
      return (response.data as any)?.errors || []
    } catch (error) {
      console.error('Failed to get spelling history:', error)
      return []
    }
  }, [])

  return {
    isChecking,
    result,
    patterns,
    checkSpelling,
    getErrorPatterns,
    markWordMastered,
    getSpellingHistory
  }
}
