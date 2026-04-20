/**
 * Story Summariser Store
 *
 * Manages state for the Story Summariser feature using Zustand.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../services/api';

const API_BASE = '/api/summarize';

export interface ComicPanel {
  panelNumber: number;
  caption: string;
  narration: string;
  illustration: string;
  category: string;
}

export interface StorySummary {
  title: string;
  panels: ComicPanel[];
  panelCount: number;
  originalLength: number;
  level: string;
}

interface StorySummariserState {
  // Current summary state
  currentSummary: StorySummary | null;
  currentPanelIndex: number;
  isGenerating: boolean;
  errorMessage: string | null;

  // Illustration library
  illustrationCategories: string[];

  // Actions
  generateFromText: (text: string, title?: string, level?: string) => Promise<void>;
  nextPanel: () => void;
  previousPanel: () => void;
  goToPanel: (index: number) => void;
  resetSummary: () => void;
  playNarration: (panelIndex: number, onStart?: () => void, onEnd?: () => void) => void;
  loadCategories: () => Promise<void>;
}

export const useStorySummariserStore = create<StorySummariserState>()(
  (set, get) => ({
    // Initial state
    currentSummary: null,
    currentPanelIndex: 0,
    isGenerating: false,
    errorMessage: null,
    illustrationCategories: [],

    // Generate summary from text using AI
    generateFromText: async (text, title, level = 'moderate') => {
      set({ isGenerating: true, errorMessage: null });

      try {
        const response = await apiClient.post<{ summary: string }>(`${API_BASE}`, {
          text,
          difficulty: level
        });

        // Parse the AI summary into comic panels (simple split by paragraphs)
        const summaryText = response.summary || text;
        const panels = summaryText
          .split(/\n\n+/)
          .filter(p => p.trim())
          .map((caption, index) => ({
            panelNumber: index + 1,
            caption: caption.trim(),
            narration: caption.trim(),
            illustration: 'story', // Category for illustration selection
            category: 'story'
          }));

        const storySummary: StorySummary = {
          title: title || 'Story Summary',
          panels: panels.length > 0 ? panels : [{
            panelNumber: 1,
            caption: summaryText,
            narration: summaryText,
            illustration: 'story',
            category: 'story'
          }],
          panelCount: panels.length || 1,
          originalLength: text.split(/\s+/).length,
          level
        };

        set({
          currentSummary: storySummary,
          currentPanelIndex: 0,
          isGenerating: false
        });
      } catch (error: any) {
        set({
          errorMessage: error?.message || 'Failed to generate story summary',
          isGenerating: false
        });
      }
    },

    // Navigate to next panel
    nextPanel: () => {
      const { currentSummary, currentPanelIndex } = get();
      if (currentSummary && currentPanelIndex < currentSummary.panels.length - 1) {
        set({ currentPanelIndex: currentPanelIndex + 1 });
      }
    },

    // Navigate to previous panel
    previousPanel: () => {
      const { currentPanelIndex } = get();
      if (currentPanelIndex > 0) {
        set({ currentPanelIndex: currentPanelIndex - 1 });
      }
    },

    // Go to specific panel
    goToPanel: (index: number) => {
      const { currentSummary } = get();
      if (currentSummary && index >= 0 && index < currentSummary.panels.length) {
        set({ currentPanelIndex: index });
      }
    },

    // Reset summary
    resetSummary: () => {
      set({
        currentSummary: null,
        currentPanelIndex: 0,
        errorMessage: null
      });
    },

    // Play narration (uses Web Speech API)
    playNarration: async (panelIndex: number, onStart?, onEnd?) => {
      const { currentSummary } = get();
      if (!currentSummary) return;

      // Convert 1-indexed panel number to 0-indexed array position
      const panel = currentSummary.panels[panelIndex - 1];
      if (!panel) return;

      // Debug: Log what we're about to speak
      console.log('[TTS] Panel', panelIndex + 1, '- Playing narration:', panel.narration);
      console.log('[TTS] Text length:', panel.narration.length, 'characters');
      console.log('[TTS] First 50 chars:', panel.narration.substring(0, 50));

      // Use Web Speech Synthesis
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Add a small pause at the beginning to prevent cutting off
        const textToSpeak = '. ' + panel.narration.trim();

        // Create utterance with premium audio quality
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.85;  // Slightly slower but more natural
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';
        utterance.volume = 1.0;

        // Debug log when speech actually starts
        utterance.onstart = () => {
          console.log('[TTS] Speech started, utterance text length:', utterance.text.length);
          if (onStart) onStart();
        };

        // Log when speech ends
        utterance.onend = () => {
          console.log('[TTS] Speech ended successfully');
          if (onEnd) onEnd();
        };

        // Log any errors
        utterance.onerror = (event) => {
          console.error('[TTS] Speech error:', event);
          console.error('[TTS] Error name:', event.name);
          console.error('[TTS] Error message:', event.error);
          if (onEnd) onEnd();
        };

        // Log boundary events (word boundaries)
        let wordCount = 0;
        utterance.onboundary = (event) => {
          wordCount++;
          if (wordCount === 1) {
            console.log('[TTS] First word spoken');
          }
        };

        // Get voices and select the best quality voice
        // Note: getVoices() may return empty array initially - voices load asynchronously
        let voices = window.speechSynthesis.getVoices();
        console.log('[TTS] Initial voices available:', voices.length);

        // If no voices available, wait for them to load
        if (voices.length === 0) {
          // Force voice loading by calling getVoices after a short delay
          await new Promise<void>(resolve => setTimeout(resolve, 100));
          voices = window.speechSynthesis.getVoices();
          console.log('[TTS] Voices after delay:', voices.length);
        }

        // Prefer high-quality natural voices
        let selectedVoice = voices.find(v =>
          v.lang === 'en-US' && (
            v.name.includes('Premium') ||
            v.name.includes('Natural') ||
            v.name.includes('Enhanced') ||
            v.name.includes('Neural') ||
            v.name.includes('Google') ||
            v.name.includes('Microsoft')
          )
        ) || voices.find(v => v.lang === 'en-US')
          || voices.find(v => v.lang.startsWith('en-'))
          || voices[0];

        if (selectedVoice) {
          console.log('[TTS] Using voice:', selectedVoice.name, '| Lang:', selectedVoice.lang);
          utterance.voice = selectedVoice;
        } else {
          console.warn('[TTS] No suitable voice found, using browser default');
        }

        // Speak after a longer delay to ensure the browser is ready
        // This prevents the first few words from being cut off
        console.log('[TTS] Speaking after 150ms delay...');
        setTimeout(() => {
          console.log('[TTS] Now speaking utterance with text:', utterance.text.substring(0, 50) + '...');
          window.speechSynthesis.speak(utterance);
        }, 150);
      } else {
        console.error('[TTS] Speech synthesis not supported');
        if (onEnd) onEnd();
      }
    },

    // Load illustration categories
    loadCategories: async () => {
      try {
        const response = await apiClient.get<{ categories: string[] }>(`${API_BASE}/categories`);
        if (response.success && response.data) {
          set({ illustrationCategories: response.data.categories || [] });
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    }
  })
);
