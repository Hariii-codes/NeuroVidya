/**
 * AR Game Store
 *
 * Manages state for the AR Reading Game using Zustand.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../services/api';

const API_BASE = '/ar-game';

export interface LevelData {
  level: number;
  gameType: string;
  prompt: string;
  target: string;
  options: string[];
  difficulty: string;
  points: number;
}

export interface GameScore {
  base: number;
  timeBonus: number;
  streakBonus: number;
  total: number;
  streak: number;
}

interface ARGameState {
  // Current game state
  currentLevel: number;
  gameType: 'letter' | 'word' | 'sentence';
  score: number;
  streak: number;

  // Level data
  levelData: LevelData | null;
  isLoadingLevel: boolean;

  // Game state
  isPlaying: boolean;
  isCorrect: boolean | null;
  startTime: number | null;
  errorMessage: string | null;

  // AR availability
  arSupported: boolean;
  cameraGranted: boolean;

  // Actions
  startGame: (gameType: 'letter' | 'word' | 'sentence') => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  nextLevel: () => void;
  resetGame: () => void;
  checkARSupport: () => Promise<void>;
  requestCameraPermission: () => Promise<void>;
}

export const useARGameStore = create<ARGameState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLevel: 1,
      gameType: 'letter',
      score: 0,
      streak: 0,
      levelData: null,
      isLoadingLevel: false,
      isPlaying: false,
      isCorrect: null,
      startTime: null,
      errorMessage: null,
      arSupported: false,
      cameraGranted: false,

      // Start game
      startGame: async (gameType) => {
        set({ gameType, isLoadingLevel: true, errorMessage: null });

        try {
          const response = await apiClient.get<LevelData>(
            `${API_BASE}/level/${get().currentLevel}/${gameType}`
          );

          if (response.success && response.data) {
            set({
              levelData: response.data,
              isLoadingLevel: false,
              isPlaying: true,
              startTime: Date.now(),
              isCorrect: null
            });
          } else {
            throw new Error(response.error || 'Failed to load level');
          }
        } catch (error: any) {
          set({
            errorMessage: error?.message || 'Failed to start game',
            isLoadingLevel: false
          });
        }
      },

      // Submit answer
      submitAnswer: async (answer) => {
        const { levelData, startTime, currentLevel } = get();

        if (!levelData || !startTime) {
          set({ errorMessage: 'Game not started' });
          return;
        }

        const timeTaken = (Date.now() - startTime) / 1000;
        const isCorrect = answer === levelData.target;

        try {
          const response = await apiClient.post<GameScore>(`${API_BASE}/submit-score`, {
            level: currentLevel,
            gameType: levelData.gameType,
            correct: isCorrect,
            timeTaken
          });

          if (response.success && response.data) {
            set({
              isCorrect,
              isPlaying: false,
              score: get().score + response.data.total,
              streak: response.data.streak
            });
          }
        } catch (error) {
          set({ errorMessage: 'Failed to submit score' });
        }
      },

      // Move to next level
      nextLevel: () => {
        const { currentLevel } = get();
        set({
          currentLevel: currentLevel + 1,
          levelData: null,
          isCorrect: null,
          startTime: null
        });
      },

      // Reset game
      resetGame: () => {
        set({
          currentLevel: 1,
          score: 0,
          streak: 0,
          levelData: null,
          isPlaying: false,
          isCorrect: null,
          startTime: null,
          errorMessage: null
        });
      },

      // Check AR support
      checkARSupport: async () => {
        // Check for WebXR support
        const arSupported = 'xr' in navigator;

        set({ arSupported });
      },

      // Request camera permission
      requestCameraPermission: async () => {
        try {
          // Request camera access
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

          // Stop the stream immediately (we just wanted permission)
          stream.getTracks().forEach(track => track.stop());

          set({ cameraGranted: true });
        } catch (error) {
          set({ cameraGranted: false });
        }
      }
    }),
    {
      name: 'ar-game-storage',
      partialize: (state) => ({
        score: state.score,
        currentLevel: state.currentLevel,
        gameType: state.gameType
      })
    }
  )
);
