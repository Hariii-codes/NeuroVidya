// frontend/src/stores/gameStore.ts
import { create } from 'zustand';
import type { GameType } from '@/types';

interface GameState {
  currentGame: GameType | null;
  score: number;
  streak: number;
  gamesPlayed: number;

  startGame: (type: GameType) => void;
  endGame: (score: number, accuracy: number) => Promise<void>;
  addPoints: (points: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: null,
  score: 0,
  streak: 0,
  gamesPlayed: 0,

  startGame: (type) => {
    set({
      currentGame: type,
      score: 0,
      streak: 0,
    });
  },

  endGame: async (score, accuracy) => {
    const { currentGame } = get();
    if (!currentGame) return;

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      await fetch(`${API_BASE}/games/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: currentGame,
          score,
          accuracy,
        }),
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }

    set((state) => ({
      gamesPlayed: state.gamesPlayed + 1,
      currentGame: null,
    }));
  },

  addPoints: (points) => {
    set((state) => ({
      score: state.score + points,
      streak: state.streak + 1,
    }));
  },

  reset: () => {
    set({
      score: 0,
      streak: 0,
    });
  },
}));
