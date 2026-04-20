// frontend/src/stores/progressStore.ts
import { create } from 'zustand';
import type { LearningProgress, ActivityType } from '@/types';

interface ProgressState extends Partial<LearningProgress> {
  isLoading: boolean;

  loadProgress: () => Promise<void>;
  logActivity: (type: ActivityType, data?: any) => Promise<void>;
  checkDailyGoal: () => boolean;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  isLoading: false,

  loadProgress: async () => {
    set({ isLoading: true });
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE}/progress/overview`);
      if (response.ok) {
        const progress = await response.json();
        set(progress);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  logActivity: async (type, data) => {
    try {
      await fetch(`${API_BASE}/progress/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityType: type, metadata: data }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  checkDailyGoal: () => {
    const { todayWordsRead = 0 } = get();
    return todayWordsRead >= 500; // 500 word daily goal
  },
}));
