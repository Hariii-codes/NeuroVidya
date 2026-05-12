import { useState, useCallback } from 'react'
import { apiClient } from '@/services/api'

export interface DailyStats {
  date: string
  readingTime: number
  wordsRead: number
  spellingAccuracy: number
  gamesCompleted: number
  studyTime: number
}

export interface WeeklyProgress {
  weekStart: string
  weekEnd: string
  dailyStats: DailyStats[]
  totals: {
    readingTime: number
    wordsRead: number
    gamesCompleted: number
    studyTime: number
  }
  averages: {
    dailyReadingTime: number
    dailyWords: number
    dailyGames: number
    dailyStudy: number
  }
}

export interface SkillMastery {
  skillType: string
  skillName: string
  masteryLevel: number
  practicedAt: string
  trend: string
}

export interface LearningInsights {
  overallProgress: number
  strongAreas: string[]
  areasForImprovement: string[]
  recommendedActivities: string[]
  streak: number
  longestStreak: number
}

export interface DashboardData {
  today: {
    readingTime: number
    wordsRead: number
    gamesPlayed: number
    studyTime: number
  }
  week: {
    totalReadingTime: number
    totalWordsRead: number
    averageDaily: {
      readingTime: number
      wordsRead: number
    }
  }
  skills: Array<{
    name: string
    level: number
    type: string
  }>
  recentErrors: Array<{
    word: string
    correct: string
    type: string
    timesSeen: number
  }>
}

export function useLearningAnalytics() {
  const [isLoading, setIsLoading] = useState(false)
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null)
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null)
  const [skills, setSkills] = useState<SkillMastery[]>([])
  const [insights, setInsights] = useState<LearningInsights | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  const getDailyStats = useCallback(async (date: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/learning/daily/${date}`)
      if (response.success) setDailyStats(response.data as DailyStats)
      return response.success ? response.data as DailyStats : null
    } catch (error) {
      console.error('Failed to get daily stats:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateDailyStats = useCallback(async (
    date: string,
    updates: Partial<{
      readingTime: number
      wordsRead: number
      spellingAccuracy: number
      gamesCompleted: number
      studyTime: number
    }>
  ) => {
    try {
      const params = new URLSearchParams()
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value))
        }
      })

      await apiClient.post(`/learning/daily/${date}/update`, null, { params: Object.fromEntries(params) })
      return true
    } catch (error) {
      console.error('Failed to update daily stats:', error)
      return false
    }
  }, [])

  const getWeeklyProgress = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/learning/weekly')
      if (response.success && response.data) {
        setWeeklyProgress(response.data as WeeklyProgress)
        return response.success ? response.data as WeeklyProgress : null
      }
      return null
    } catch (error) {
      console.error('Failed to get weekly progress:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSkillMastery = useCallback(async() => {
    try {
      const response = await apiClient.get('/learning/skills')
      if (response.success) setSkills(response.data as SkillMastery[])
      return response.success ? response.data as SkillMastery[] : null
    } catch (error) {
      console.error('Failed to get skill mastery:', error)
      return []
    }
  }, [])

  const updateSkillMastery = useCallback(async(
    skillName: string,
    skillType: string,
    correct: boolean
  ) => {
    try {
      const response = await apiClient.post(
        `/learning/skills/${encodeURIComponent(skillName)}/update`,
        null,
        { params: { skill_type: skillType, correct: String(correct) } }
      )
      return response.data
    } catch (error) {
      console.error('Failed to update skill mastery:', error)
      return null
    }
  }, [])

  const getLearningInsights = useCallback(async() => {
    try {
      const response = await apiClient.get('/learning/insights')
      if (response.success) setInsights(response.data as LearningInsights)
      return response.success ? response.data as LearningInsights : null
    } catch (error) {
      console.error('Failed to get learning insights:', error)
      return null
    }
  }, [])

  const getDashboardData = useCallback(async() => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/learning/dashboard')
      if (response.success) setDashboardData(response.data as DashboardData)
      return response.success ? response.data as DashboardData : null
    } catch (error) {
      console.error('Failed to get dashboard data:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Helper functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getMasteryColor = (level: number) => {
    if (level >= 0.8) return 'bg-green-500'
    if (level >= 0.5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your streak today!'
    if (streak < 7) return `${streak} day streak - keep going!`
    if (streak < 30) return `${streak} days - you\'re on fire!`
    return `${streak} days - incredible dedication!`
  }

  return {
    isLoading,
    dailyStats,
    weeklyProgress,
    skills,
    insights,
    dashboardData,
    getDailyStats,
    updateDailyStats,
    getWeeklyProgress,
    getSkillMastery,
    updateSkillMastery,
    getLearningInsights,
    getDashboardData,
    formatTime,
    getMasteryColor,
    getStreakMessage
  }
}
