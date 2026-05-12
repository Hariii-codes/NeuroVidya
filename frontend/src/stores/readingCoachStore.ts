/**
 * Reading Coach Store
 *
 * Manages state for the Reading Coach feature using Zustand.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../services/api';
import type {
  ReadingPassage,
  ReadingSession,
  PronunciationError,
  SpeechRecognitionEvent
} from '../types/reading-coach';
import { speechService, ttsService } from '../services/speechService';

const API_BASE = '/reading-coach';

// AI feedback type from the new API
interface AIPronunciationFeedback {
  isCorrect: boolean;
  confidence: number;
  feedback: string;
  encouragement: string;
  tips?: string[];
}

/**
 * Get AI-powered pronunciation feedback for a single word
 * Uses the /api/reading-coach endpoint with dyslexia-friendly encouragement
 */
async function getAIPronunciationFeedback(
  word: string,
  userTranscription: string,
  context: string
): Promise<AIPronunciationFeedback> {
  const response = await fetch(`${window.location.origin}/api${API_BASE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      word,
      userTranscription,
      context
    })
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
  }

  return response.json();
}

interface ReadingCoachState {
  // Current session state
  currentPassage: ReadingPassage | null;
  isRecording: boolean;
  spokenText: string;
  errors: PronunciationError[];
  isProcessing: boolean;
  errorMessage: string | null;
  accuracyScore?: number;

  // Session history
  sessionHistory: ReadingSession[];

  // Audio state
  isPlaying: boolean;

  // Actions
  setCurrentPassage: (passage: ReadingPassage) => void;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  submitSession: () => Promise<void>;
  clearCurrentSession: () => void;
  loadHistory: () => Promise<void>;
  playWord: (word: string) => void;
  playSyllables: (syllables: string[]) => void;
  setError: (error: string | null) => void;
}

export const useReadingCoachStore = create<ReadingCoachState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPassage: null,
      isRecording: false,
      spokenText: '',
      errors: [],
      isProcessing: false,
      errorMessage: null,
      accuracyScore: undefined,
      sessionHistory: [],
      isPlaying: false,

      // Set current passage
      setCurrentPassage: (passage) => {
        set({
          currentPassage: passage,
          spokenText: '',
          errors: [],
          errorMessage: null
        });
      },

      // Start recording
      startRecording: async () => {
        const { currentPassage } = get();

        if (!currentPassage) {
          set({ errorMessage: 'Please select a passage first' });
          return false;
        }

        // Initialize speech service
        const initialized = speechService.initialize({
          continuous: true,
          interimResults: true,
          language: 'en-US'
        });

        if (!initialized) {
          set({ errorMessage: 'Speech recognition not supported in this browser' });
          return false;
        }

        // Set up result handler
        speechService.onResult((event: SpeechRecognitionEvent) => {
          set({ spokenText: event.transcript });
        });

        speechService.onError((error) => {
          set({ errorMessage: error, isRecording: false });
        });

        // Start listening
        const started = speechService.start();
        if (started) {
          set({ isRecording: true, errorMessage: null });
          return true;
        }

        set({ errorMessage: 'Failed to start recording' });
        return false;
      },

      // Stop recording
      stopRecording: () => {
        speechService.stop();
        set({ isRecording: false });
      },

      // Submit session for AI-powered analysis
      submitSession: async () => {
        const { currentPassage, spokenText } = get();

        if (!currentPassage || !spokenText) {
          set({ errorMessage: 'No reading to submit' });
          return;
        }

        set({ isProcessing: true, errorMessage: null });

        try {
          // Use backend API for pronunciation analysis
          const response = await fetch(
            `${window.location.origin}/api${API_BASE}/analyze`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                expectedText: currentPassage.text,
                spokenText: spokenText
              })
            }
          );

          if (!response.ok) {
            throw new Error(`Analysis failed: ${response.statusText}`);
          }

          const result = await response.json();
          
          // Map backend errors to frontend format
          const errors: PronunciationError[] = result.errors?.map((err: any, idx: number) => ({
            word: err.word || err.expected,
            expected: err.expected,
            actual: err.actual,
            position: err.position || idx,
            confidence: err.confidence,
            phoneticGuide: err.phoneticGuide
          })) || [];

          const accuracyScore = result.accuracyScore;
          set({
            errors,
            accuracyScore,
            isProcessing: false
          });

          // Note: Session saving is optional - would require authentication
          // TODO: Implement auth-based session persistence

        } catch (error: any) {
          set({
            errorMessage: error?.message || 'Failed to analyze pronunciation',
            isProcessing: false
          });
        }
      },

      // Clear current session
      clearCurrentSession: () => {
        speechService.stop();
        speechService.reset();
        set({
          currentPassage: null,
          spokenText: '',
          errors: [],
          isRecording: false,
          errorMessage: null
        });
      },

      // Load session history
      loadHistory: async () => {
        try {
          // Get user ID from auth (simplified - adjust based on your auth setup)
          const response = await apiClient.get<{ sessions: ReadingSession[] }>(`${API_BASE}/progress/me`);
          if (response.success && response.data) {
            set({ sessionHistory: response.data.sessions || [] });
          }
        } catch (error) {
          console.error('Failed to load history:', error);
        }
      },

      // Play word pronunciation
      playWord: (word: string) => {
        console.log('[Reading Coach] playWord called with:', word);
        const isSingleLetter = /^[A-Za-z]$/.test(word);
        console.log('[Reading Coach] Is single letter:', isSingleLetter);

        set({ isPlaying: true });

        // Check if it's a single letter - use phonics pronunciation
        if (isSingleLetter) {
          console.log('[Reading Coach] Using phonics for letter:', word);
          ttsService.speakLetterPhonics(word);
          // Shorter duration for single letters
          setTimeout(() => {
            set({ isPlaying: false });
          }, 1500);
        } else {
          // Use slower rate (0.5) for words
          ttsService.speak(word, 0.5, true);

          // Reset playing state after a reasonable time
          const wordCount = word.split(' ').length;
          const duration = Math.max(2000, wordCount * 800);
          setTimeout(() => {
            set({ isPlaying: false });
          }, duration);
        }
      },

      // Play syllables one by one for practice
      playSyllables: (syllables: string[]) => {
        set({ isPlaying: true });
        ttsService.speakSyllables(syllables);

        // Calculate duration based on number of syllables
        const duration = syllables.length * 1200;
        setTimeout(() => {
          set({ isPlaying: false });
        }, duration);
      },

      // Set error message
      setError: (error) => {
        set({ errorMessage: error });
      }
    }),
    {
      name: 'reading-coach-storage',
      partialize: (state) => ({
        sessionHistory: state.sessionHistory
      })
    }
  )
);
