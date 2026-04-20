// frontend/src/services/dyslexiaSettings.ts
// API service for dyslexia settings persistence

import { apiClient } from './api'
import type { ApiResponse } from '@/types'

export interface DyslexiaSettingsResponse {
  id: string
  userId: string
  font: string
  fontSize: number
  letterSpacing: number
  wordSpacing: number
  lineHeight: number
  theme: string
  accentColor: string
  contrastLevel: 'normal' | 'high' | 'very-high'
  lineFocusEnabled: boolean
  lineFocusColor: string
  lineDimIntensity: number
  lineFocusAutoScroll: boolean
  phoneticChunkingEnabled: boolean
  chunkStyle: 'syllables' | 'sounds' | 'both'
  useAIForChunking: boolean
  focusMode: boolean
  ttsAlwaysVisible: boolean
  speechSpeed: number
  wordByWordMode: boolean
  voiceSelection: string
  presetLevel: 'mild' | 'moderate' | 'significant' | 'custom'
  createdAt: string
  updatedAt: string
}

export type DyslexiaSettingsUpdate = Partial<Omit<DyslexiaSettingsResponse, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>

/**
 * Dyslexia Settings API
 *
 * Provides methods to load and save dyslexia settings from/to the backend.
 */
export const dyslexiaSettingsApi = {
  /**
   * Get user's dyslexia settings from the backend
   */
  getSettings: async (): Promise<DyslexiaSettingsResponse> => {
    const response: ApiResponse<DyslexiaSettingsResponse> = await apiClient.get('/users/me/dyslexia-settings')
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch dyslexia settings')
    }
    return response.data
  },

  /**
   * Update user's dyslexia settings on the backend
   * @param settings - Partial settings object with only fields to update
   */
  updateSettings: async (
    settings: DyslexiaSettingsUpdate
  ): Promise<DyslexiaSettingsResponse> => {
    const response: ApiResponse<DyslexiaSettingsResponse> = await apiClient.put('/users/me/dyslexia-settings', settings)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update dyslexia settings')
    }
    return response.data
  },
}
