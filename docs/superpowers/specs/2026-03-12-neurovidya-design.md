# NeuroVidya Platform Design Document

**Date:** 2026-03-12
**Status:** Approved
**Version:** 1.0

## Overview

NeuroVidya is an AI-powered adaptive learning platform designed specifically for students with dyslexia. The platform combines reading assistance, visual learning games, AI tutoring, and comprehensive accessibility features to create a calm, supportive digital learning environment.

## Project Vision

> "A calm digital learning space designed for neurodiverse minds."

The platform helps dyslexic learners:
- Read comfortably with adaptive tools
- Understand complex text through AI simplification
- Improve spelling and writing with intelligent correction
- Learn visually through interactive games
- Build confidence through progress tracking

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + TypeScript + Vite | Fast development, type safety, modern build tool |
| Styling | Tailwind CSS | Utility-first, easy accessibility customizations |
| State | Zustand | Lightweight, simple dyslexia-friendly state management |
| Backend | FastAPI (Python 3.11+) | Async support, fast, excellent for AI integrations |
| Database | PostgreSQL + Prisma ORM | Type-safe queries, excellent migrations |
| AI/ML | OpenAI API + Anthropic Claude | Text simplification and explanations |
| Speech | Web Speech API | Browser native, no external dependencies |
| OCR | Tesseract.js | Client-side processing for privacy |

## Project Structure

```
neurovidya/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/        # Shared components (DyslexiaText, FocusText, etc.)
│   │   │   ├── auth/          # Login, Register forms
│   │   │   ├── dashboard/     # Dashboard widgets
│   │   │   ├── reading/       # Reading workspace components
│   │   │   ├── assistant/     # AI chat interface
│   │   │   ├── games/         # Visual learning games
│   │   │   ├── analytics/     # Charts and progress displays
│   │   │   └── settings/      # Preference controls
│   │   ├── pages/             # Route pages
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API clients (tts, ocr, ai)
│   │   ├── stores/            # Zustand state stores
│   │   ├── styles/            # Tailwind config + dyslexia fonts
│   │   ├── utils/             # Helper functions
│   │   └── types/             # TypeScript type definitions
│   └── public/
│       └── fonts/             # Lexend, OpenDyslexic fonts
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   ├── users.py      # User management
│   │   │   ├── text.py       # Text processing (simplify, spell-check)
│   │   │   ├── assistant.py  # AI chat endpoints
│   │   │   ├── games.py      # Game data and scoring
│   │   │   ├── progress.py   # Learning progress tracking
│   │   │   └── analytics.py  # Chart data endpoints
│   │   ├── models/           # Prisma models
│   │   ├── services/         # Business logic
│   │   │   ├── ai_service.py     # OpenAI/Claude integration
│   │   │   ├── spell_service.py  # NLP spell correction
│   │   │   ├── ocr_service.py    # OCR processing
│   │   │   └── game_service.py   # Game content management
│   │   ├── core/             # Configuration, security
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── deps.py       # Dependencies
│   │   ├── schemas/          # Pydantic schemas
│   │   └── main.py           # FastAPI app entry
│   └── prisma/
│       └── schema.prisma     # Database schema
└── shared/                    # Shared types and utilities
    └── types/
        └── api.ts            # Shared TypeScript types
```

## Database Schema

### Users Table
Stores user authentication and profile information.

```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  preferences  ReadingPreferences?
  progress     LearningProgress[]
  gameScores   GameScore[]
  activities   Activity[]
}
```

### Reading Preferences
Stores user customization for dyslexia-friendly reading.

```prisma
model ReadingPreferences {
  id            String  @id @default(cuid())
  userId        String  @unique
  user          User    @relation(fields: [userId], references: [id])

  // Font settings
  font          String  @default("Lexend")  // Lexend, OpenDyslexic
  fontSize      Int     @default(20)        // 16-32px
  letterSpacing Float   @default(0.12)      // 0.10-0.15em
  lineHeight    Float   @default(1.6)       // 1.5-1.8

  // Theme
  theme         String  @default("cream")   // cream, dark, pastel-blue, pastel-green, light-yellow

  // Accessibility
  focusMode     Boolean @default(false)
  speechSpeed   Float   @default(1.0)       // 0.5-2.0

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Learning Progress
Tracks user learning metrics and streaks.

```prisma
model LearningProgress {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])

  // Metrics
  readingSpeed      Int?      // words per minute
  spellingAccuracy  Float?    // percentage 0-100
  gamesCompleted    Int       @default(0)
  totalTimeMinutes  Int       @default(0)

  // Streaks
  currentStreak     Int       @default(0)
  longestStreak     Int       @default(0)
  lastActivityDate  DateTime?

  // Daily progress
  todayReadingTime  Int       @default(0)
  todayWordsRead    Int       @default(0)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

### Game Scores
Records performance in visual learning games.

```prisma
model GameScore {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  gameType    GameType
  score       Int
  accuracy    Float?   // percentage
  timeTaken   Int?     // seconds

  createdAt   DateTime @default(now())
}

enum GameType {
  WORD_IMAGE_MATCHING
  LETTER_RECOGNITION
  SYLLABLE_BUILDER
  SENTENCE_BUILDER
  ILLUSTRATED_STORY
  VISUAL_CONCEPT
}
```

### Activity Log
Records all user activities for analytics.

```prisma
model Activity {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])

  activityType  ActivityType
  description   String
  metadata      Json?         // flexible data for different activity types

  createdAt     DateTime      @default(now())
}

enum ActivityType {
  READ
  SIMPLIFY_TEXT
  SPELL_CHECK
  TTS_PLAY
  GAME_PLAYED
  OCR_SCAN
  AI_QUESTION
}
```

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider
├── ThemeProvider (dyslexia themes)
├── Router
│   ├── LandingPage
│   ├── LoginPage
│   ├── RegisterPage
│   ├── AppLayout
│   │   ├── Sidebar
│   │   ├── TopBar
│   │   └── MainContent
│   │       ├── Dashboard
│   │       │   ├── WelcomeSection
│   │       │   ├── DailyProgressCard
│   │       │   ├── QuickActions
│   │       │   ├── StreakDisplay
│   │       │   └── SuggestedExercises
│   │       ├── ReadingWorkspace
│   │       │   ├── TextInputArea
│   │       │   ├── ReadingDisplay
│   │       │   ├── ReadingControls
│   │       │   ├── FocusMode
│   │       │   ├── AssistiveToolbar
│   │       │   │   ├── TTSControl
│   │       │   │   ├── SimplifyButton
│   │       │   │   ├── ExplainButton
│   │       │   │   └── SpellCheckButton
│   │       │   └── OCRScanner
│   │       ├── AIStudyAssistant
│   │       │   ├── ChatInterface
│   │       │   │   ├── MessageList
│   │       │   │   ├── InputArea
│   │       │   │   └── QuickQuestions
│   │       │   └── ExplanationPanel
│   │       ├── VisualLearningEngine
│   │       │   ├── GameSelector
│   │       │   ├── WordImageMatching
│   │       │   ├── LetterRecognition
│   │       │   ├── SyllableBuilder
│   │       │   ├── SentenceBuilder
│   │       │   ├── IllustratedStory
│   │       │   └── VisualConceptExplainer
│   │       ├── ProgressAnalytics
│   │       │   ├── StatsOverview
│   │       │   ├── ReadingChart (Recharts)
│   │       │   ├── GameScoresChart
│   │       │   └── StreakDisplay
│   │       └── Settings
│   │           ├── FontSettings
│   │           ├── ThemeSettings
│   │           ├── SpeechSettings
│   │           └── AccessibilitySettings
```

### Shared Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `DyslexiaText` | Text with dyslexia-friendly defaults | `text`, `size?`, `spacing?` |
| `FocusText` | Text with focus mode highlighting | `text`, `highlightedIndex` |
| `GameCard` | Consistent game card UI | `game`, `onPlay` |
| `StatCard` | Metric display widget | `label`, `value`, `icon?` |
| `AccessibleButton` | Large, keyboard-friendly button | `children`, `onClick`, `variant?` |
| `LoadingSpinner` | Calm, non-distracting loader | `message?` |

## API Design

### Authentication Endpoints

```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login user
POST   /api/auth/logout      # Logout user
GET    /api/auth/me          # Get current user
```

### User Management

```
GET    /api/users/me                    # Get user profile
PUT    /api/users/me                    # Update user profile
GET    /api/users/preferences           # Get reading preferences
PUT    /api/users/preferences           # Update preferences
```

### Text Processing

```
POST   /api/text/simplify         # AI text simplification
POST   /api/text/explain          # AI concept explanation
POST   /api/text/spell-check      # Smart spell correction
POST   /api/text/ocr              # OCR processing (server fallback)
```

### AI Study Assistant

```
POST   /api/assistant/chat        # Chat with AI assistant
GET    /api/assistant/history     # Get chat history
DELETE /api/assistant/history     # Clear chat history
```

### Learning Progress

```
GET    /api/progress/overview     # Dashboard stats
GET    /api/progress/reading      # Reading metrics
GET    /api/progress/games        # Game scores
POST   /api/progress/activity     # Log activity
```

### Games

```
GET    /api/games/word-images     # Word-image matching data
GET    /api/games/letters         # Letter recognition data
GET    /api/games/syllables       # Syllable building data
GET    /api/games/sentences       # Sentence building data
GET    /api/games/stories         # Illustrated stories
GET    /api/games/concepts        # Visual concepts
POST   /api/games/score           # Submit game score
```

### Analytics

```
GET    /api/analytics/reading-chart    # Reading progress data
GET    /api/analytics/game-chart       # Game performance data
GET    /api/analytics/streak           # Streak information
GET    /api/analytics/daily-activity   # Daily activity data
```

## Key Features - Implementation Details

### Dyslexia-Friendly Themes

Tailwind CSS configuration with custom colors and fonts:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        dyslexia: {
          cream: '#F7F3E9',        // Primary background
          darkGray: '#2E2E2E',     // Text color
          calmBlue: '#5C8DF6',     // Primary accent
          softGreen: '#6CC7A8',    // Secondary accent
          pastelBlue: '#E8F4FC',   // Pastel overlay option
          pastelGreen: '#E8F8F0',  // Pastel overlay option
          lightYellow: '#FEF9E7',  // Pastel overlay option
        }
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        openDyslexic: ['OpenDyslexic', 'sans-serif'],
      },
      letterSpacing: {
        'dyslexia': '0.12em',
      }
    }
  }
}
```

### Text-to-Speech Implementation

Using Web Speech API with word-by-word highlighting:

```typescript
// frontend/src/services/tts.ts
interface TTSConfig {
  rate: number;        // 0.5 to 2.0
  pitch: number;       // 0.5 to 2.0
  voice?: string;
}

class DyslexiaTTS {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  speak(
    text: string,
    config: TTSConfig,
    onWordHighlight: (index: number, word: string) => void,
    onEnd: () => void
  ): void {
    this.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    if (config.voice) {
      utterance.voice = this.synth.getVoices().find(v => v.name === config.voice) || null;
    }

    let wordIndex = 0;
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const words = text.split(/\s+/);
        onWordHighlight(wordIndex, words[wordIndex] || '');
        wordIndex++;
      }
    };

    utterance.onend = onEnd;
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause(): void {
    this.synth.pause();
  }

  resume(): void {
    this.synth.resume();
  }

  stop(): void {
    if (this.currentUtterance) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }
}

export const ttsService = new DyslexiaTTS();
```

### OCR Implementation

Using Tesseract.js for client-side text extraction:

```typescript
// frontend/src/services/ocr.ts
import Tesseract from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
}

class BookScanner {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    this.worker = await Tesseract.createWorker('eng');
  }

  async scanImage(imageFile: File): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    const result = await this.worker!.recognize(imageFile);
    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new BookScanner();
```

### AI Service Integration

```typescript
// frontend/src/services/ai.ts
interface SimplifyRequest {
  text: string;
  readingLevel: 'elementary' | 'middle' | 'high';
}

interface ExplainRequest {
  concept: string;
  context?: string;
}

class AIService {
  private apiBase: string;

  constructor(apiBase: string = '/api') {
    this.apiBase = apiBase;
  }

  async simplifyText(request: SimplifyRequest): Promise<string> {
    const response = await fetch(`${this.apiBase}/text/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Simplification failed');
    const data = await response.json();
    return data.simplifiedText;
  }

  async explainConcept(request: ExplainRequest): Promise<{
    explanation: string;
    examples: string[];
    visualSuggestion?: string;
  }> {
    const response = await fetch(`${this.apiBase}/text/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Explanation failed');
    return response.json();
  }

  async chat(message: string, history: Array<{role: string, content: string}>): Promise<string> {
    const response = await fetch(`${this.apiBase}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!response.ok) throw new Error('Chat failed');
    const data = await response.json();
    return data.response;
  }
}

export const aiService = new AIService();
```

## Visual Learning Games - Data Structures

### Word-Image Matching

```typescript
interface WordImageGame {
  id: string;
  image: string;              // URL or base64 encoded image
  correctWord: string;
  options: string[];          // 3-4 choices including correct
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;           // animals, food, objects, nature, etc.
}

// Example:
{
  id: "wim-001",
  image: "/images/apple.png",
  correctWord: "Apple",
  options: ["Apple", "Banana", "Orange", "Grape"],
  difficulty: "easy",
  category: "food"
}
```

### Letter Recognition

```typescript
interface LetterGame {
  id: string;
  targetLetter: string;       // 'b', 'd', 'p', 'q' - commonly confused
  options: string[];
  difficulty: 'easy' | 'medium';
  type: 'similar-letters' | 'uppercase-lowercase';
}

// Example:
{
  id: "lr-001",
  targetLetter: "b",
  options: ["b", "d", "p", "q"],
  difficulty: "easy",
  type: "similar-letters"
}
```

### Syllable Builder

```typescript
interface SyllableGame {
  id: string;
  targetWord: string;
  syllables: string[];
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Example:
{
  id: "sb-001",
  targetWord: "information",
  syllables: ["in", "for", "ma", "tion"],
  hint: "Something you learn from reading",
  difficulty: "medium"
}
```

### Sentence Builder

```typescript
interface SentenceGame {
  id: string;
  correctSentence: string;
  shuffledWords: string[];
  hintImage?: string;
  difficulty: 'easy' | 'medium';
}

// Example:
{
  id: "sent-001",
  correctSentence: "The cat is sleeping",
  shuffledWords: ["cat", "the", "sleeping", "is"],
  hintImage: "/images/sleeping-cat.png",
  difficulty: "easy"
}
```

### Illustrated Story

```typescript
interface StoryPage {
  image: string;
  sentence: string;
  audioUrl?: string;                    // Pre-recorded narration
  wordHighlights?: {                    // Clickable words
    word: string;
    definition: string;
  }[];
}

interface IllustratedStory {
  id: string;
  title: string;
  readingLevel: 'elementary' | 'middle' | 'high';
  topic: string;
  pages: StoryPage[];
  quiz?: Array<{                        // Comprehension check
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

// Example:
{
  id: "story-001",
  title: "The Little Seed",
  readingLevel: "elementary",
  topic: "nature",
  pages: [
    {
      image: "/images/seed.png",
      sentence: "A little seed sleeps in the soil.",
      audioUrl: "/audio/seed-page1.mp3",
      wordHighlights: [
        { word: "seed", definition: "A small part of a plant that can grow into a new plant" },
        { word: "soil", definition: "The dirt that plants grow in" }
      ]
    },
    // ... more pages
  ]
}
```

### Visual Concept Explainer

```typescript
interface ConceptStep {
  label: string;              // Short label for the step
  visual: string;             // SVG or image URL
  explanation: string;        // Simple explanation
}

interface VisualConcept {
  id: string;
  title: string;
  category: string;           // science, math, geography, etc.
  steps: ConceptStep[];
  interactive?: boolean;      // Can user interact with the diagram?
  summary?: string;           // Quick recap at the end
}

// Example - Water Cycle:
{
  id: "vc-water-cycle",
  title: "The Water Cycle",
  category: "science",
  steps: [
    {
      label: "Evaporation",
      visual: "/diagrams/evaporation.svg",
      explanation: "The sun warms water in rivers and oceans. The water turns into gas and rises up."
    },
    {
      label: "Condensation",
      visual: "/diagrams/condensation.svg",
      explanation: "The water gas cools down in the sky and forms clouds."
    },
    {
      label: "Precipitation",
      visual: "/diagrams/precipitation.svg",
      explanation: "Water falls from clouds as rain, snow, or hail."
    },
    {
      label: "Collection",
      visual: "/diagrams/collection.svg",
      explanation: "Water flows into rivers, lakes, and oceans. Then the cycle starts again."
    }
  ],
  interactive: true,
  summary: "Water keeps moving from Earth to sky and back again. This is the water cycle."
}
```

## State Management (Zustand)

```typescript
// stores/authStore.ts
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// stores/preferenceStore.ts
interface PreferenceStore {
  preferences: ReadingPreferences;
  updatePreference: <K extends keyof ReadingPreferences>(
    key: K,
    value: ReadingPreferences[K]
  ) => void;
  applyTheme: () => void;
  resetToDefaults: () => void;
}

// stores/readingStore.ts
interface ReadingStore {
  currentText: string;
  simplifiedText: string;
  isFocusMode: boolean;
  highlightedWordIndex: number;
  isPlaying: boolean;
  setText: (text: string) => void;
  simplify: () => Promise<void>;
  toggleFocus: () => void;
  setHighlightedWord: (index: number) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
}

// stores/gameStore.ts
interface GameStore {
  currentGame: GameType | null;
  score: number;
  streak: number;
  gamesPlayed: number;
  startGame: (type: GameType) => void;
  endGame: (score: number, accuracy: number) => Promise<void>;
  updateStreak: () => void;
}

// stores/progressStore.ts
interface ProgressStore {
  stats: LearningProgress | null;
  dailyGoal: number;
  logActivity: (type: ActivityType, data: any) => Promise<void>;
  loadProgress: () => Promise<void>;
  checkDailyGoal: () => boolean;
}
```

## Accessibility Implementation

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Keyboard Navigation | Full keyboard support, visible focus indicators on all interactive elements |
| Screen Reader Support | Proper ARIA labels, roles, and live regions for dynamic content |
| Color Contrast | All text meets 4.5:1 contrast ratio (verified) |
| Text Resizing | Layout supports 200% text zoom without breaking |
| No Seizure Triggers | No flashing content > 3x per second |
| Error Prevention | Clear error messages, forgiving inputs, helpful suggestions |

### Dyslexia-Specific Features

1. **Fonts**: Lexend and OpenDyslexic loaded and available
2. **Letter Spacing**: Default 0.12em, configurable 0.10-0.15em
3. **Line Height**: Default 1.6, configurable 1.5-1.8
4. **Reduced Clutter**: Minimal UI, generous white space
5. **Consistent Layouts**: Predictable navigation and component placement
6. **Audio Alternatives**: TTS for all text, pre-recorded audio for stories
7. **Visual Support**: Images, diagrams, and color coding throughout

## Error Handling Strategy

### Service-Level Error Handling

All services implement consistent error handling patterns:

```typescript
// Base error handling for all services
interface ServiceError {
  code: string;
  message: string;
  userMessage: string;  // Dyslexia-friendly, simple explanation
  retryable: boolean;
  retryAfter?: number;  // seconds
}
```

### TTS Error Handling & Fallback

**Primary:** Web Speech API (browser native)
**Fallback:** ElevenLabs or Google Cloud TTS API

```typescript
class TTSWithFallback {
  private apiTTSUrl: string;

  async speak(text: string, config: TTSConfig): Promise<void> {
    try {
      // Try browser TTS first
      const synth = window.speechSynthesis;
      if (!synth) {
        throw new Error('Browser TTS not supported');
      }
      // ... use browser TTS
    } catch (error) {
      // Fall back to server-side TTS
      return this.speakWithAPI(text, config);
    }
  }

  private async speakWithAPI(text: string, config: TTSConfig): Promise<void> {
    const response = await fetch(`${this.apiTTSUrl}/tts`, {
      method: 'POST',
      body: JSON.stringify({ text, speed: config.rate }),
    });
    const audioBlob = await response.blob();
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
  }
}
```

### OCR Error Handling

**Primary:** Tesseract.js (client-side, privacy-first)
**Fallback:** Server-side OCR (Tesseract Python or Google Vision API)

```typescript
class OCRWithFallback {
  async scanImage(imageFile: File): Promise<string> {
    try {
      // Try client-side OCR
      const result = await this.clientOCR.scanImage(imageFile);
      if (result.confidence < 70) {
        throw new Error('Low confidence - trying server');
      }
      return result.text;
    } catch (error) {
      // Fall back to server-side OCR
      const formData = new FormData();
      formData.append('image', imageFile);
      const response = await fetch('/api/text/ocr', {
        method: 'POST',
        body: formData,
      });
      return response.json().text;
    }
  }
}
```

### AI Service Error Handling

**Rate Limiting:**
- Per-user daily quota: 50 AI requests
- Per-hour limit: 10 requests
- Cached responses don't count against quota

**Caching Strategy:**
```typescript
class CachedAIService {
  private cache = new Map<string, { response: string; timestamp: number }>();
  private CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  async simplifyText(text: string): Promise<string> {
    const cacheKey = `simplify:${hash(text)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.response; // Return cached, no quota cost
    }

    // Check quota before API call
    const remaining = await this.checkQuota();
    if (remaining <= 0) {
      throw new AIQuotaExceededError();
    }

    // Make API call
    const result = await this.apiCall(text);
    this.cache.set(cacheKey, { response: result, timestamp: Date.now() });
    await this.decrementQuota();
    return result;
  }
}
```

### User-Facing Error Messages

All errors follow dyslexia-friendly guidelines:
- **Simple language** - No technical jargon
- **Short sentences** - 1-2 lines max
- **Actionable** - What should the user do?
- **Calming colors** - Soft orange (#F4A261), not red

Example error display:
```html
<div class="error-message">
  <Icon name="alert-circle" className="text-dyslexia-softOrange" />
  <p>Something went wrong.</p>
  <p class="error-action">Try again in a moment.</p>
</div>
```

## Spell Check Implementation

### Dyslexia-Aware Spell Correction

The spell checker uses a hybrid approach combining:

1. **Edit Distance Algorithm** - For phonetic misspellings
2. **Dyslexia-Specific Rules** - Common dyslexic spelling patterns
3. **Context-Aware NLP** - For word choice suggestions

```python
# backend/app/services/spell_service.py
from typing import List, Tuple
import re

class DyslexiaSpellChecker:
    def __init__(self):
        # Common dyslexic misspellings database
        self.dyslexia_patterns = {
            'b/d': self.check_bd_confusion,
            'p/q': self.check_pq_confusion,
            'm/n': self.check_mn_confusion,
            'vowels': self.check_vowel_errors,
        }

        # Common misspellings dictionary
        self.common_corrections = {
            'becuse': 'because',
            'definately': 'definitely',
            'wensday': 'wednesday',
            'recieve': 'receive',
            'occured': 'occurred',
            'seperate': 'separate',
            'untill': 'until',
            'wich': 'which',
            'thier': 'their',
            'freind': 'friend',
            'scoll': 'school',
            'enuff': 'enough',
            'fone': 'phone',
            'bizzy': 'busy',
            # ... extensive database
        }

    def correct(self, text: str) -> List[Tuple[str, str, str]]:
        """
        Returns list of (original, correction, confidence) tuples.
        """
        corrections = []
        words = text.split()

        for i, word in enumerate(words):
            word_clean = re.sub(r'[^\w]', '', word.lower())

            # Check common corrections first
            if word_clean in self.common_corrections:
                corrections.append((
                    word,
                    self.common_corrections[word_clean],
                    'high'
                ))
                continue

            # Check dyslexia-specific patterns
            for pattern_name, check_func in self.dyslexia_patterns.items():
                suggestion = check_func(word_clean)
                if suggestion:
                    corrections.append((word, suggestion, 'medium'))
                    break

        return corrections

    def check_bd_confusion(self, word: str) -> str | None:
        """Check for b/d confusion - very common in dyslexia"""
        if word.startswith('d') and word[1:] in self.dict:
            return 'b' + word[1:]
        if word.startswith('b') and word[1:] in self.dict:
            return 'd' + word[1:]
        return None

    def check_vowel_errors(self, word: str) -> str | None:
        """Check for vowel substitution errors"""
        vowel_patterns = [
            ('ie', 'ei'),  # recieve -> receive
            ('ei', 'ie'),
            ('cei', 'cie'),  # concieve -> conceive
        ]
        for pattern, replacement in vowel_patterns:
            if pattern in word:
                variant = word.replace(pattern, replacement)
                if variant in self.dict:
                    return variant
        return None
```

### Spell Check UI Integration

```typescript
// Frontend spell check component
interface SpellCheckResult {
  original: string;
  correction: string;
  confidence: 'high' | 'medium' | 'low';
  position: { start: number; end: number };
}

function useSpellCheck() {
  const [results, setResults] = useState<SpellCheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkText = async (text: string) => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/text/spell-check', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      const corrections = await response.json();
      setResults(corrections);
    } finally {
      setIsChecking(false);
    }
  };

  const applyCorrection = (index: number, text: string) => {
    const result = results[index];
    const before = text.slice(0, result.position.start);
    const after = text.slice(result.position.end);
    return before + result.correction + after;
  };

  return { results, isChecking, checkText, applyCorrection };
}
```

## Content Management Strategy

### Asset Storage

**Static Assets (Game Content):**
- **Storage:** Cloudflare R2 or AWS S3
- **CDN:** Cloudflare for global distribution
- **Format:**
  - Images: WebP with PNG fallback
  - Audio: MP3 at 128kbps
  - Diagrams: SVG format

**Asset Directory Structure:**
```
assets/
├── games/
│   ├── word-images/
│   │   ├── animals/
│   │   ├── food/
│   │   └── objects/
│   ├── letters/
│   ├── syllables/
│   └── concepts/
├── stories/
│   ├── elementary/
│   ├── middle/
│   └── high/
└── audio/
    ├── narration/
    └── tts-fallback/
```

### Content Sourcing Strategy

**Initial Content (MVP):**
- **Pre-loaded database** of 100 word-image pairs
- **50 illustrated stories** across reading levels
- **20 visual concepts** (science, math, geography)
- **Letter/syllable games** algorithmically generated

**Content Expansion:**
- **AI-assisted generation** using DALL-E for images
- **Community contribution** system (future)
- **Teacher submission** portal (future)

### Asset Versioning

```typescript
// Asset URL with versioning
interface AssetConfig {
  baseUrl: string;
  version: string;
}

function getAssetUrl(path: string, version: string = 'v1'): string {
  return `${ASSET_CONFIG.baseUrl}/${version}/${path}`;
}

// Usage:
const imageUrl = getAssetUrl('games/word-images/animals/apple.png', 'v1');
```

## Business Logic Specifications

### Streak Calculation

```python
# backend/app/services/streak_service.py
from datetime import date, timedelta

class StreakCalculator:
    def calculate_streak(self, user_id: str) -> dict:
        """
        Calculate current and longest streaks.

        Streak Rules:
        - A day counts if user completes ANY learning activity
        - Streak resets if no activity for 48 hours
        - Grace period: 48 hours from last activity
        - Streak freezes for planned breaks (future feature)
        """
        progress = self.get_progress(user_id)
        today = date.today()
        last_activity = progress.lastActivityDate

        if not last_activity:
            return { 'current': 0, 'longest': 0 }

        # Check if streak is still active
        hours_since = (today - last_activity).total_seconds() / 3600
        if hours_since > 48:  # 48-hour grace period
            current_streak = 0
        else:
            current_streak = self._count_consecutive_days(last_activity)

        return {
            'current': current_streak,
            'longest': max(current_streak, progress.longestStreak)
        }

    def _count_consecutive_days(self, from_date: date) -> int:
        """Count consecutive days of activity going backwards"""
        count = 0
        check_date = from_date

        while self.has_activity_on(check_date):
            count += 1
            check_date -= timedelta(days=1)

        return count
```

### Reading Level Determination

```python
# backend/app/services/reading_level_service.py
class ReadingLevelAssessor:
    """
    Reading Levels based on multiple metrics:

    Elementary: 1-3 grade level
    - Simple sentences (5-8 words)
    - Common vocabulary (Dale-Chall < 7)
    - One syllable words > 70%

    Middle: 4-8 grade level
    - Compound sentences (8-12 words)
    - Medium vocabulary (Dale-Chall 7-8)
    - One syllable words > 50%

    High: 9-12 grade level
    - Complex sentences (12+ words)
    - Advanced vocabulary (Dale-Chall > 8)
    - Multiple syllable words common
    """

    def assess_level(self, text: str) -> str:
        scores = {
            'avg_words_per_sentence': self._avg_sentence_length(text),
            'dale_chall': self._dale_chall_score(text),
            'syllable_ratio': self._syllable_ratio(text),
        }

        if (scores['avg_words_per_sentence'] <= 8 and
            scores['dale_chall'] < 7 and
            scores['syllable_ratio'] > 0.7):
            return 'elementary'

        elif (scores['avg_words_per_sentence'] <= 12 and
              scores['dale_chall'] <= 8 and
              scores['syllable_ratio'] > 0.5):
            return 'middle'

        return 'high'
```

### Focus Mode Implementation

**Visual Behavior:**

When Focus Mode is activated:
1. **Current sentence** is highlighted with soft blue background (#E8F4FC)
2. **Surrounding text** is dimmed to 30% opacity
3. **Line spacing** increases to 2.0
4. **Margins** widen to center the content

```typescript
// Focus mode component
interface FocusModeProps {
  text: string;
  currentIndex: number;
}

function FocusText({ text, currentIndex }: FocusModeProps) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  return (
    <div className={`focus-mode ${focusMode ? 'active' : ''}`}>
      {sentences.map((sentence, index) => (
        <span
          key={index}
          className={cx(
            'sentence',
            index === currentIndex && 'highlighted',
            Math.abs(index - currentIndex) > 1 && 'dimmed'
          )}
        >
          {sentence}{' '}
        </span>
      ))}
    </div>
  );
}

// CSS
// .focus-mode.active .highlighted { background: #E8F4FC; }
// .focus-mode.active .dimmed { opacity: 0.3; }
// .focus-mode.active { line-height: 2; max-width: 600px; margin: 0 auto; }
```

## Security Considerations

1. **Authentication**: JWT-based auth with httpOnly cookies
2. **Password Security**: bcrypt hashing with salt rounds
3. **API Rate Limiting**: Prevent abuse of AI endpoints
4. **Input Validation**: Pydantic schemas on all inputs
5. **CORS**: Configured for specific origins only
6. **Data Privacy**: Minimal data collection, user control over preferences

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial Page Load | < 3 seconds |
| TTS Latency | < 100ms |
| AI Simplification | < 5 seconds |
| Game Interactions | < 50ms perceived latency |
| OCR Processing | < 10 seconds per page |

## Deployment Strategy

### Development Environment
- Frontend: Vite dev server on port 5173
- Backend: FastAPI with uvicorn on port 8000
- Database: PostgreSQL via Docker

### Production Environment
- Frontend: Vercel or Netlify (static build)
- Backend: Railway, Render, or AWS (containerized)
- Database: Managed PostgreSQL (Supabase, Railway)
- AI APIs: OpenAI/Anthropic (managed services)

## Testing Strategy

1. **Unit Tests**: Critical business logic (spell correction, scoring)
2. **Integration Tests**: API endpoints, database operations
3. **E2E Tests**: User flows (login, reading, games)
4. **Accessibility Tests**: Automated axe-core scans + manual testing
5. **User Testing**: Dyslexic user feedback on all features

## Success Metrics

1. **User Engagement**: Daily active users, session duration
2. **Learning Impact**: Reading speed improvement, spelling accuracy
3. **Accessibility**: Screen reader compatibility, keyboard usage
4. **User Satisfaction**: Feedback scores, feature adoption
5. **Technical**: Page load times, API response times

## Future Enhancements (Out of Scope for MVP)

1. Mobile apps (iOS/Android)
2. Offline mode with service workers
3. Collaborative features (study groups)
4. Parent/teacher dashboards
5. Curriculum integration
6. Multi-language support
7. More visual learning games
8. Integration with school LMS systems

---

**Document Status:** Ready for implementation planning
**Next Step:** Create detailed implementation plan using writing-plans skill
