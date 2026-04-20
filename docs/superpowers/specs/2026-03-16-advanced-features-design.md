# NeuroVidya Advanced Features Design Document

**Date:** 2026-03-16
**Status:** Approved
**Version:** 1.0
**Approach:** Modular Integration

## Overview

This document details the design for three advanced features to be added to the NeuroVidya platform:

1. **Real-Time Reading Coach** - Voice-based AI tutor for pronunciation feedback
2. **AR Reading Game** - Camera-based interactive letter/word catching game
3. **AI Story Summariser** - Illustrated 5-panel comic summaries with narration

## Design Approach

**Modular Integration** was selected as the implementation approach. Each feature is designed as an independent module that:
- Integrates with existing NeuroVidya patterns
- Can be developed and tested independently
- Has dedicated frontend pages, components, services, and stores
- Connects to the backend via dedicated API endpoints
- Stores data in shared database tables

## Section 1: Overall Architecture

### Frontend Structure
```
src/
├── pages/
│   ├── ReadingCoachPage.tsx     # NEW
│   ├── ARGamePage.tsx           # NEW
│   └── StorySummariserPage.tsx  # NEW
├── components/
│   ├── reading-coach/           # NEW
│   │   ├── SpeechRecorder.tsx
│   │   ├── PronunciationFeedback.tsx
│   │   └── ProgressChart.tsx
│   ├── ar-game/                 # NEW
│   │   ├── ARCameraView.tsx
│   │   ├── FloatingLetter.tsx
│   │   └── GameHUD.tsx
│   └── story-summariser/        # NEW
│       ├── ComicPanel.tsx
│       ├── StoryInput.tsx
│       └── NarrationPlayer.tsx
├── services/
│   ├── speechService.ts         # NEW - Web Speech API wrapper
│   ├── pronunciationService.ts  # NEW - Analysis algorithms
│   ├── arService.ts             # NEW - WebXR/Three.js wrapper
│   └── illustrationService.ts   # NEW - Pre-built image library
└── stores/
    ├── readingCoachStore.ts     # NEW - Zustand store
    ├── arGameStore.ts           # NEW - Zustand store
    └── storySummariserStore.ts  # NEW - Zustand store
```

### Backend Structure
```
app/
├── api/
│   ├── reading_coach.py         # NEW - Endpoints
│   ├── ar_game.py               # NEW - Game data/scoring
│   └── story_summariser.py      # NEW - Summarization
├── services/
│   ├── pronunciation_service.py # NEW - Text alignment
│   ├── story_service.py         # NEW - Panel generation
│   └── illustration_service.py  # NEW - Library matching
└── models/
    └── prisma/schema.prisma     # UPDATE - Add tables
```

## Section 2: Reading Coach Design

### User Flow
1. Student opens ReadingCoachPage
2. Selects reading passage (library or custom)
3. Presses "🎤 Start Reading" button
4. Reads aloud while system listens via Web Speech API
5. Real-time feedback highlights mispronounced words
6. Session ends → shows progress report

### Components

**SpeechRecorder.tsx**
- Uses Web Speech API `SpeechRecognition` interface
- Streams audio continuously
- Emits recognized text events
- Handles browser permissions

**PronunciationFeedback.tsx**
- Compares spoken vs expected text
- Highlights mismatches in red/yellow/green
- Shows correct spelling below
- Includes phonetic guide (/fʊd/)
- Play audio button for correct pronunciation

**ProgressChart.tsx**
- Weekly accuracy trend (Recharts line chart)
- Word count milestones
- Streak display

### Backend Service

**pronunciation_service.py**
```python
class PronunciationAnalyzer:
    def compare_texts(
        self,
        expected: str,
        spoken: str
    ) -> List[PronunciationError]:
        """
        Uses Levenshtein distance for word alignment.
        Flags words with:
        - Edit distance > 1
        - Phonetic distance > threshold
        - Confidence score < 0.85
        """
```

### API Endpoints
```
POST   /api/reading-coach/start-session
POST   /api/reading-coach/submit-reading
GET    /api/reading-coach/progress/{user_id}
POST   /api/reading-coach/pronounce-word
```

### Database Schema

**Note:** Renamed to `ReadingCoachSession` to avoid conflict with existing `ReadingSession` table used for reading workspace tracking.

```prisma
model ReadingCoachSession {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  passageText     String   @db.Text
  spokenText      String   @db.Text
  accuracyScore   Float
  wordsCorrect    Int
  wordsIncorrect  Int

  errors          Json     // Array of {word, expected, actual, position}
  phoneticFeedback Json?   // Additional phonetic analysis

  // Links to existing progress tracking
  learningProgressId String?
  learningProgress LearningProgress? @relation(fields: [learningProgressId], references: [id])

  createdAt       DateTime @default(now())
}

// Update existing LearningProgress model to include reading coach metrics
model LearningProgress {
  // ... existing fields ...

  // Reading Coach specific metrics
  readingCoachSessions Int           @default(0)
  pronunciationAccuracy Float?       // Average across sessions
  improvedWords        Json?         // Track words that improved

  // AR Game metrics
  arGamesPlayed        Int           @default(0)
  arBestScore          Int?

  // Story Summariser metrics
  storiesCreated       Int           @default(0)
  storiesViewed        Int           @default(0)
}
```

## Section 3: AR Reading Game Design

### User Flow
1. Student opens ARGamePage
2. Grants camera permissions
3. Selects difficulty level (Letter/Word/Sentence)
4. Camera opens with floating letters
5. Audio prompt: "Find the letter B!"
6. Student taps correct floating letter
7. Score +10 / incorrect → explanation
8. Progress through levels

### Components

**ARCameraView.tsx**
- Uses WebXR `hit-test` API for spatial tracking
- Three.js for 3D letter rendering
- `<video>` element for camera background
- WebGL canvas for AR overlay

**FloatingLetter.tsx**
- 3D text mesh floating in space
- Gentle bobbing animation
- Tap-to-select interaction
- Success/failure animations

**GameHUD.tsx**
- Score display
- Level indicator
- Current prompt
- Timer for speed rounds

### Game Levels

| Level | Type | Content | Example |
|-------|------|---------|---------|
| 1-3 | Letter | Single letter recognition | Find "b" |
| 4-6 | Letter | Similar letters (b/d/p/q) | Find "b" from [b,d,p,q] |
| 7-10 | Word | C-V-C words | Tap letters to spell "cat" |
| 11+ | Sentence | Word recognition | Find the word "apple" |

### Technology Stack
```json
{
  "dependencies": {
    "three": "^0.160.0",
    "@types/three": "^0.160.0",
    "@ar-js-org/ar.js": "^3.4.5"
  }
}
```

### Fallback for Non-AR Devices
- 2D camera overlay mode
- Letters float on video feed instead of 3D space
- Tap-based interaction

### API Endpoints
```
GET    /api/ar-game/level/{level}/{type}
POST   /api/ar-game/submit-score
GET    /api/ar-game/leaderboard
```

### Database Schema
```prisma
model ARGameScore {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  level       Int
  gameType    String
  score       Int
  accuracy    Float
  timeTaken   Int

  mistakes    Json?

  createdAt   DateTime @default(now())
}
```

## Section 4: AI Story Summariser Design

### User Flow
1. Teacher/Student opens StorySummariserPage
2. Pastes text or enters URL
3. System generates 5-panel comic summary
4. Each panel shows illustration, caption, audio button
5. Student navigates panels left/right
6. Optionally reads original text after understanding

### Components

**ComicPanel.tsx**
- Responsive panel card
- Illustration image (from pre-built library)
- Caption text (dyslexia-friendly)
- Audio play button
- Panel navigation arrows

**StoryInput.tsx**
- Text area for paste
- URL input option
- Reading level selector
- "Generate Summary" button
- Loading state with progress

**NarrationPlayer.tsx**
- Web Speech API TTS
- Per-panel audio
- Playback controls
- Highlights words as spoken

### Illustration Library Structure
```
public/illustrations/
├── nature/
│   ├── sun-heating.png
│   ├── water-rising.png
│   ├── clouds-forming.png
│   ├── rain-falling.png
│   └── water-collecting.png
├── science/
│   ├── gravity-apple.png
│   ├── planets-orbit.png
│   └── atoms.png
├── history/
│   └── ... (20-30 images)
└── daily/
    └── ... (20-30 images)
```

**Total: ~100 illustrations** covering common educational topics

### Backend Service

**story_service.py**
```python
class StorySummariserService:
    def generate_summary(
        self,
        text: str,
        level: str
    ) -> List[ComicPanel]:
        """
        1. Extract key events (5 max) using Claude API
        2. Generate simple captions at specified reading level
        3. Match illustrations from library using semantic similarity
        4. Create narration prompts for TTS
        """

    def match_illustration(
        self,
        concept: str,
        available_images: List[Image]
    ) -> str:
        """
        Illustration Matching Algorithm:

        1. Extract keywords from concept using NLP
        2. Calculate similarity score with each image's tags:
           - Exact keyword match: 1.0
           - Semantic similarity (word embeddings): 0.7-0.9
           - Category match: 0.5
        3. Return image with highest score above 0.6 threshold
        4. Fallback to generic placeholder if no match

        Image tags are stored as:
        {
          "path": "nature/sun-heating.png",
          "tags": ["sun", "heat", "warm", "energy", "nature"],
          "category": "nature"
        }
        """
```

### API Endpoints
```
POST   /api/story-summariser/generate
GET    /api/story-summariser/library/categories
POST   /api/story-summariser/save
GET    /api/story-summariser/saved/{user_id}
```

### Database Schema
```prisma
model StorySummary {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  originalText    String   @db.Text
  panels          Json
  title           String?
  readingLevel    String

  viewed          Boolean  @default(false)
  shared          Boolean  @default(false)

  createdAt       DateTime @default(now())
}
```

## Section 5: State Management (Zustand)

### readingCoachStore.ts
```typescript
interface ReadingCoachState {
  currentPassage: string | null
  isRecording: boolean
  spokenText: string
  errors: PronunciationError[]
  sessionHistory: ReadingCoachSession[]

  startRecording: () => void
  stopRecording: () => void
  submitSession: () => Promise<void>
}
```

### arGameStore.ts
```typescript
interface ARGameState {
  currentLevel: number
  score: number
  streak: number
  gameType: 'letter' | 'word' | 'sentence'
  isPlaying: boolean

  startLevel: (level: number) => void
  submitAnswer: (letter: string) => Promise<boolean>
  endGame: () => void
}
```

### storySummariserStore.ts
```typescript
interface StorySummariserState {
  currentPanels: ComicPanel[]
  currentPanelIndex: number
  isGenerating: boolean
  savedStories: StorySummary[]

  generateFromText: (text: string, level: string) => Promise<void>
  nextPanel: () => void
  previousPanel: () => void
  playNarration: (panelIndex: number) => void
}
```

## Section 6: Error Handling

### Reading Coach Errors

| Error | Handling | User Message |
|-------|----------|--------------|
| Microphone denied | Fallback to text input | "Microphone not available. Type what you read." |
| Speech not recognized | Retry prompt | "I couldn't hear that. Try again." |
| No speech detected | Timeout after 10s | "Keep reading, or tap Done when finished." |
| Browser doesn't support Web Speech | Show compatible browsers | "This feature works best in Chrome or Edge." |

### AR Game Errors

| Error | Handling | User Message |
|-------|----------|--------------|
| Camera denied | 2D fallback mode | "Camera not available. Try 2D mode." |
| WebXR not supported | 2D camera overlay | "AR not supported. Switching to 2D mode." |
| Device motion not available | Tap-based game | "Motion sensors not found. Tap letters." |
| Illustration not found | Generic placeholder | "Image loading. Tap to continue." |

### Story Summariser Errors

| Error | Handling | User Message |
|-------|----------|--------------|
| Text too long | Truncate/summarize chunks | "Text is very long. This might take a moment." |
| No events extracted | Ask for simpler text | "I couldn't understand this. Try shorter text." |
| Illustration mismatch | Generic icons | "Showing simple images for this story." |
| API quota exceeded | Queue for later | "Too many requests. Summary ready soon." |

### Dyslexia-Friendly Error Guidelines
- Simple language - No technical jargon
- Short sentences - 1-2 lines max
- Actionable - What should the user do?
- Calming colors - Soft orange (#F4A261)
- Icon support - Visual cues

## Section 7: Authentication & Authorization

All three features integrate with existing NeuroVidya authentication:

### User Roles

| Role | Reading Coach | AR Game | Story Summariser |
|------|---------------|---------|------------------|
| Student | Full access | Full access | View saved stories |
| Teacher | Full access + review student progress | Full access | Create & share stories |
| Parent | View child's progress | View child's scores | View child's stories |

### Permission Checks

**Backend middleware (existing):**
```python
from app.core.deps import get_current_user, get_optional_user

@router.post("/api/reading-coach/submit-reading")
async def submit_reading(
    data: ReadingSubmitRequest,
    current_user: User = Depends(get_current_user)  # Auth required
):
    # Only student can submit their own reading
    if current_user.role != "student":
        raise HTTPException(403, "Only students can submit readings")

@router.post("/api/story-summariser/generate")
async def generate_summary(
    data: SummaryRequest,
    current_user: User = Depends(get_current_user)
):
    # Teachers and students can generate
    if current_user.role not in ["student", "teacher"]:
        raise HTTPException(403, "Unauthorized")
```

### Data Privacy

- **Reading Coach**: Voice recordings processed in-browser, never stored
- **AR Game**: Camera data processed locally, no recording
- **Story Summariser**: Text content stored for user's saved stories only

## Section 8: Browser Compatibility & Progressive Enhancement

### Feature Support Matrix

| Feature | Chrome | Edge | Firefox | Safari | Fallback Strategy |
|---------|--------|------|---------|--------|-------------------|
| Reading Coach (Web Speech) | ✅ Full | ✅ Full | ⚠️ Partial | ⚠️ Partial | Text input mode |
| AR Game (WebXR) | ✅ Mobile | ✅ Mobile | ❌ | ⚠️ iOS 17+ | 2D camera overlay |
| Story Summariser | ✅ Full | ✅ Full | ✅ Full | ✅ Full | N/A |

### Minimum Browser Versions

- **Chrome**: 90+
- **Edge**: 90+
- **Firefox**: 88+
- **Safari**: 15+ (iOS 15+ for AR)

### Progressive Enhancement Layers

**Layer 1: Core Functionality (All browsers)**
- Reading Coach: Text input comparison mode
- AR Game: 2D letter matching game
- Story Summariser: Full functionality

**Layer 2: Enhanced Features (Modern browsers)**
- Reading Coach: Web Speech API recognition
- AR Game: Camera overlay mode
- Story Summariser: TTS narration

**Layer 3: Full Experience (Supported devices)**
- Reading Coach: Real-time pronunciation feedback
- AR Game: True WebXR 3D experience
- Story Summariser: Enhanced audio controls

## Section 9: Content Management

### Reading Passages Library

**Initial Content:**
- 50 passages across elementary/middle/high reading levels
- Categories: nature, science, history, daily life
- Length: 50-200 words per passage
- Source: Public domain educational content

**Storage:**
```prisma
model ReadingPassage {
  id          String   @id @default(cuid())
  title       String
  text        String   @db.Text
  readingLevel String  // 'elementary' | 'middle' | 'high'
  category    String
  difficultyScore Int
  createdAt   DateTime @default(now())
}
```

### Game Level Data

**AR Game Levels Structure:**
```python
LEVELS = {
    1-3: {
        "type": "letter",
        "letters": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
        "prompt": "Find the letter {letter}"
    },
    4-6: {
        "type": "similar_letters",
        "groups": [
            ["b", "d", "p", "q"],
            ["m", "n", "w", "u"],
            ["h", "n", "u"]
        ],
        "prompt": "Find the letter {letter}"
    },
    7-10: {
        "type": "word_building",
        "words": ["cat", "dog", "sun", "bed", "run", "fun", "map", "hat", "pot", "top"],
        "prompt": "Spell the word: {word}"
    },
    11+: {
        "type": "word_recognition",
        "words": ["apple", "banana", "cat", "dog", "elephant", "fish", "giraffe", "house", "ice cream", "juice"],
        "prompt": "Find the word: {word}"
    }
}
```

### Illustration Library

**Initial Content: ~100 images**
- Nature (20): sun, rain, clouds, water cycle, plants, animals
- Science (20): gravity, planets, atoms, energy, experiments
- Daily Life (30): school, family, food, activities, emotions
- History (15): ancient civilizations, historical events
- Concepts (15): abstract ideas represented visually

**Tagging Schema:**
```json
{
  "id": "img_nature_001",
  "path": "nature/sun-heating.png",
  "tags": ["sun", "heat", "warm", "temperature", "energy", "light", "nature"],
  "category": "nature",
  "concepts": ["water cycle", "evaporation", "solar energy", "weather"]
}
```

## Section 10: Performance Targets

### Latency Targets

| Feature Operation | Target | Maximum |
|-------------------|--------|---------|
| Speech recognition start | < 100ms | 500ms |
| Pronunciation analysis | < 500ms | 2s |
| AR frame rendering | 60 FPS | 30 FPS |
| Story generation | < 5s | 10s |
| Illustration matching | < 100ms | 500ms |
| Panel navigation | < 50ms | 200ms |

### Resource Budgets

| Resource | Budget | Rationale |
|----------|--------|-----------|
| Page load (Reading Coach) | < 500KB | Minimal dependencies |
| Page load (AR Game) | < 2MB | Three.js library |
| Page load (Story Summariser) | < 800KB | Illustrations lazy-loaded |
| Memory (AR Game) | < 200MB | Mobile device constraints |
| Illustration file size | < 50KB each | WebP format |

### API Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| /story-summariser/generate | 10/hour | Per user |
| /reading-coach/submit-reading | 30/hour | Per user |
| /ar-game/submit-score | 60/hour | Per user |

## Section 11: User Onboarding & Tutorials

### First-Time Experience

**Reading Coach:**
1. Welcome screen explaining the feature
2. Microphone permission request with clear explanation
3. Practice session with sample text
4. Immediate positive feedback on first attempt
5. Progress explanation ("We'll track your improvement!")

**AR Game:**
1. Device compatibility check
2. Camera permission with visual guide
3. Tutorial: "Tap the floating letter 'b'"
4. Practice round with easy target
5. Celebration on first success

**Story Summariser:**
1. Feature explanation with example
2. Sample text button for quick demo
3. Panel navigation tutorial
4. Audio controls walkthrough
5. Option to save first story

### Help & Guidance

- Contextual help buttons on each screen
- Short video tutorials (30-60 seconds)
- "How it works" tooltips
- Progress indicators showing what's next

## Section 12: Testing Strategy

### Unit Testing
- Backend services: pronunciation analysis, story generation, illustration matching
- Frontend components: speech recorder, AR renderer, comic panels
- State management: Zustand store actions and selectors

### Integration Testing
- API endpoints with authenticated users
- Database operations and migrations
- Cross-feature integration (progress tracking)

### Browser Testing
- Chrome, Edge, Firefox, Safari (desktop and mobile)
- Progressive enhancement verification
- Fallback mode testing

### Accessibility Testing
- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- Keyboard navigation validation
- Color contrast verification (axe DevTools)
- Dyslexic user testing sessions

### Physical Device Testing
- AR game on actual mobile devices
- Microphone quality variations
- Camera performance across devices
- Touch interaction validation

### User Acceptance Testing
- 5-10 dyslexic students
- 2-3 teachers
- 2-3 parents
- Feedback collection and iteration

## Section 13: Implementation Timeline (Revised)

**Timeline includes 20% buffer for browser compatibility and user testing.**

### Phase 1: Reading Coach (Week 1-2.5) ⭐ Priority
- Backend: pronunciation_service.py (2 days)
- Backend: API endpoints with auth (1 day)
- Database: ReadingCoachSession table (1 day)
- Reading passages content (1 day)
- Frontend: speechService.ts (1 day)
- Frontend: SpeechRecorder component (2 days)
- Frontend: PronunciationFeedback component (2 days)
- Frontend: ProgressChart component (1 day)
- Onboarding flow (1 day)
- Integration & testing (2 days)
- Browser compatibility testing (1 day)
- **Total: ~15 days**

### Phase 2: Story Summariser (Week 2.5-4)
- Backend: story_service.py (2 days)
- Backend: illustration_service.py (1 day)
- Backend: API endpoints with auth (1 day)
- Database: StorySummary table (1 day)
- Illustration library creation (4 days)
- Frontend: ComicPanel component (1 day)
- Frontend: NarrationPlayer component (2 days)
- Frontend: StoryInput component (1 day)
- Onboarding flow (1 day)
- Integration & testing (2 days)
- Content testing (1 day)
- **Total: ~17 days**

### Phase 3: AR Game (Week 4-6)
- Backend: ar_game.py service (2 days)
- Backend: Game level data (2 days)
- Database: ARGameScore table (1 day)
- Frontend: arService.ts (2 days)
- Frontend: ARCameraView component (4 days)
- Frontend: FloatingLetter component (2 days)
- Frontend: GameHUD component (1 day)
- 2D fallback mode (2 days)
- Onboarding flow (1 day)
- Device testing (3 days)
- Integration & testing (3 days)
- **Total: ~23 days**

### Overall Timeline: **5-6 weeks**

```
Week 1         Week 2         Week 3         Week 4         Week 5         Week 6
Reading Coach ─┐              Story ─┐        AR Game ────────────────────────
Backend        │              Backend│        Backend
               │              │       │
Frontend ──────┘              Frontend│
Onboarding                   Onboarding
Testing                       Testing
                                      │
                                      Frontend (AR)
                                      2D Fallback
                                      Onboarding
                                      Device Testing
                                      │
Final Integration & Polish ────────────────────────────────────────┘
```

### Milestones

- **Week 2:** Reading Coach MVP ready for internal testing
- **Week 3:** Story Summariser MVP ready for internal testing
- **Week 5:** AR Game MVP ready for internal testing
- **Week 6:** All features integrated, ready for user acceptance testing
- **Week 7:** Buffer for fixes based on user feedback

## Dependencies

### Frontend (package.json)
```json
{
  "dependencies": {
    "three": "^0.160.0",
    "@types/three": "^0.160.0",
    "@ar-js-org/ar.js": "^3.4.5"
  }
}
```

### Environment Variables
No new API keys required. Using browser-native APIs:
- Web Speech API (Reading Coach, Story Narration)
- WebXR API (AR Game)
- MediaRecorder API (All features)

Existing keys used:
- OPENAI_API_KEY (Story summarization)
- ANTHROPIC_API_KEY (Story summarization)

## Design Principles

1. **Modularity** - Each feature is independent and can be developed/tested separately
2. **Accessibility** - WCAG 2.1 AA compliant, dyslexia-friendly throughout
3. **Privacy** - No external speech APIs, browser-native processing
4. **Cost-effective** - Pre-built illustrations, no per-request speech costs
5. **Fallbacks** - Graceful degradation for unsupported devices/browsers
6. **Progressive enhancement** - Core functionality works everywhere, enhanced experience on capable devices

---

**Document Status:** Approved
**Next Step:** Implementation planning
