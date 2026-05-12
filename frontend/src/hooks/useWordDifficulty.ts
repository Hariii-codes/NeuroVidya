import { useState, useCallback } from 'react'
import { apiClient } from '@/services/api'

export interface WordDifficultyInfo {
  word: string
  difficultyScore: number
  length: number
  syllableCount: number
  syllables: string[]
  pronunciation: string | null
  simpleMeaning: string | null
  userHistory: {
    timesSeen: number
    timesCorrect: number
    timesErrored: number
    lastSeenAt: string | null
  } | null
}

export interface TextComplexityInfo {
  averageWordLength: number
  averageSyllablesPerWord: number
  difficultWords: WordDifficultyInfo[]
  overallDifficulty: number
  readingLevel: string
}

export interface PersonalizedRecommendations {
  focusWords: Array<{
    word: string
    errorRate: number
    timesSeen: number
    difficulty: number
  }>
  masteredWords: string[]
  trendingWords: string[]
}

export function useWordDifficulty() {
  const [isLoading, setIsLoading] = useState(false)
  const [wordInfo, setWordInfo] = useState<WordDifficultyInfo | null>(null)
  const [textComplexity, setTextComplexity] = useState<TextComplexityInfo | null>(null)
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations | null>(null)

  const getWordDifficulty = useCallback(async (word: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/words/${encodeURIComponent(word)}`)
      if (response.success) setWordInfo(response.data as WordDifficultyInfo)
      return response.success ? response.data as WordDifficultyInfo : null
    } catch (error) {
      console.error('Failed to get word difficulty:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getBatchDifficulty = useCallback(async (words: string[]) => {
    try {
      const response = await apiClient.post('/words/batch', { words })
      return (response.data as any)?.results || []
    } catch (error) {
      console.error('Failed to get batch difficulty:', error)
      return []
    }
  }, [])

  const analyzeTextComplexity = useCallback(async (text: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/words/analyze-text', { text })
      if (response.success) setTextComplexity(response.data as TextComplexityInfo)
      return response.success ? response.data as TextComplexityInfo : null
    } catch (error) {
      console.error('Failed to analyze text complexity:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getPersonalizedRecommendations = useCallback(async () => {
    try {
      const response = await apiClient.get('/words/recommendations/personalized')
      if (response.success) setRecommendations(response.data as PersonalizedRecommendations)
      return response.success ? response.data as PersonalizedRecommendations : null
    } catch (error) {
      console.error('Failed to get recommendations:', error)
      return null
    }
  }, [])

  const trackWordInteraction = useCallback(async (word: string, correct: boolean) => {
    try {
      await apiClient.post(`/words/${encodeURIComponent(word)}/track`, null, {
        params: { correct }
      })
      return true
    } catch (error) {
      console.error('Failed to track word interaction:', error)
      return false
    }
  }, [])

  const getReadingLevelColor = (level: string) => {
    switch (level) {
      case 'Elementary': return 'text-green-600'
      case 'Middle School': return 'text-blue-600'
      case 'High School': return 'text-yellow-600'
      case 'College/Advanced': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getDifficultyColor = (score: number) => {
    if (score < 3) return 'bg-green-100 text-green-800'
    if (score < 5) return 'bg-blue-100 text-blue-800'
    if (score < 7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return {
    isLoading,
    wordInfo,
    textComplexity,
    recommendations,
    getWordDifficulty,
    getBatchDifficulty,
    analyzeTextComplexity,
    getPersonalizedRecommendations,
    trackWordInteraction,
    getReadingLevelColor,
    getDifficultyColor
  }
}
