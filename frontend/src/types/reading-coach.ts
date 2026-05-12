// Reading Coach Feature Types

export interface PronunciationError {
  word: string;
  expected: string;
  actual: string;
  position: number;
  confidence: number;
  phoneticGuide?: string;
}

export interface ReadingSession {
  id: string;
  passageText: string;
  spokenText: string;
  accuracyScore: number;
  wordsCorrect: number;
  wordsIncorrect: number;
  errors: PronunciationError[];
  createdAt: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  text: string;
  readingLevel: 'elementary' | 'middle' | 'high';
  category: string;
  difficultyScore: number;
  wordCount: number;
}

export interface PronunciationAnalysisRequest {
  expectedText: string;
  spokenText: string;
  userId?: string;
}

export interface PronunciationAnalysisResponse {
  accuracyScore: number;
  wordsCorrect: number;
  wordsIncorrect: number;
  errors: PronunciationError[];
  phoneticFeedback?: {
    overallScore: number;
    improvedWords: string[];
    needsPractice: string[];
  };
}

export interface SpeechRecognitionEvent {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface ReadingCoachState {
  // Current session
  currentPassage: ReadingPassage | null;
  isRecording: boolean;
  spokenText: string;
  errors: PronunciationError[];
  isProcessing: boolean;
  errorMessage: string | null;
  accuracyScore?: number;  // Added - results from analysis

  // Session history
  sessionHistory: ReadingSession[];

  // Audio
  isPlaying: boolean;

  // Actions
  setCurrentPassage: (passage: ReadingPassage) => void;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  submitSession: () => Promise<void>;
  clearCurrentSession: () => void;
  loadHistory: () => Promise<void>;
  playWord: (word: string) => void;
  setError: (error: string | null) => void;
}
