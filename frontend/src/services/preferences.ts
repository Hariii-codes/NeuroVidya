import { apiClient } from './api'
import type { ReadingPreferences } from '../types'

export const preferencesApi = {
  getPreferences: async (): Promise<ReadingPreferences> => {
    const response = await apiClient.get<ReadingPreferences>('/users/preferences')
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to fetch preferences')
  },

  updatePreferences: async (updates: Partial<ReadingPreferences>): Promise<ReadingPreferences> => {
    const response = await apiClient.put<ReadingPreferences>('/users/preferences', updates)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to update preferences')
  },
}
