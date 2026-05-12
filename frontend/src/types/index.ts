// User Types
export interface User {
  id: string
  email: string
  name: string
  learningProfile: LearningProfile
  createdAt: string
  updatedAt: string
}

export interface LearningProfile {
  id: string
  userId: string
  dyslexiaType: string[]
  preferredLearningStyle: string
  difficulties: string[]
  strengths: string[]
  accommodations: Accommodation[]
  createdAt: string
  updatedAt: string
}

export interface Accommodation {
  id: string
  type: string
  settings: Record<string, any>
  isActive: boolean
}

// Auth Types
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  message: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Content Types
export interface Content {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz' | 'interactive'
  difficultyLevel: number
  estimatedDuration: number
  dyslexiaOptimized: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface LearningPath {
  id: string
  userId: string
  title: string
  description: string
  contents: Content[]
  progress: number
  status: 'active' | 'completed' | 'paused'
  createdAt: string
  updatedAt: string
}

// Progress Types
export interface UserProgress {
  id: string
  userId: string
  contentId: string
  completionPercentage: number
  timeSpent: number
  lastAccessedAt: string
  interactions: Interaction[]
}

export interface Interaction {
  id: string
  type: string
  timestamp: string
  data: Record<string, any>
}

// Reading Preferences Types
export type FontFamily = 'Lexend' | 'OpenDyslexic'
export type Theme = 'cream' | 'dark' | 'pastel-blue' | 'pastel-green' | 'light-yellow'

export interface ReadingPreferences {
  id: string
  userId: string
  font: FontFamily
  fontSize: number
  letterSpacing: number
  lineHeight: number
  theme: Theme
  focusMode: boolean
  speechSpeed: number
}

// Game Types
export type GameType =
  | 'WORD_IMAGE_MATCHING'
  | 'LETTER_RECOGNITION'
  | 'SYLLABLE_BUILDER'
  | 'SENTENCE_BUILDER'
  | 'ILLUSTRATED_STORY'
  | 'VISUAL_CONCEPT'

export type ActivityType =
  | 'reading'
  | 'game'
  | 'ocr_scan'
  | 'ai_chat'
  | 'spelling_check'

// Progress Types
export interface LearningProgress {
  userId: string
  readingSpeed: number
  spellingAccuracy: number
  gamesCompleted: number
  totalTimeMinutes: number
  currentStreak: number
  todayWordsRead: number
  weeklyGoalProgress: number
}

// Reading Coach Types
export * from './reading-coach'
