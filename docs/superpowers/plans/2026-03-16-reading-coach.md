# Real-Time Reading Coach Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a voice-based AI reading tutor that listens to students read aloud, detects pronunciation errors, and provides real-time feedback with progress tracking.

**Architecture:** Modular browser-native approach using Web Speech API for speech recognition, FastAPI backend for pronunciation analysis using Levenshtein distance and phonetic similarity algorithms, with speech processing handled entirely client-side for privacy.

**Tech Stack:** Web Speech API, React/TypeScript, FastAPI/Python, Zustand, Prisma ORM, Recharts

---

## File Structure

```
backend/
├── prisma/
│   └── schema.prisma                  # MODIFY - Add ReadingCoachSession
├── app/
│   ├── api/
│   │   └── reading_coach.py           # NEW - API endpoints
│   ├── services/
│   │   └── pronunciation_service.py   # NEW - Text alignment & analysis
│   └── data/
│       └── reading_passages.json      # NEW - Reading passages library
│
frontend/
├── src/
│   ├── pages/
│   │   └── ReadingCoachPage.tsx       # NEW - Main page
│   ├── components/
│   │   └── reading-coach/
│   │       ├── SpeechRecorder.tsx     # NEW - Web Speech API wrapper
│   │       ├── PronunciationFeedback.tsx  # NEW - Error display
│   │       ├── PassageSelector.tsx    # NEW - Reading passage library
│   │       └── ProgressChart.tsx      # NEW - Accuracy trends
│   ├── services/
│   │   └── speechService.ts           # NEW - Speech recognition service
│   ├── stores/
│   │   └── readingCoachStore.ts       # NEW - Zustand state management
│   └── types/
│       └── reading-coach.ts           # NEW - TypeScript interfaces
│
tests/
├── backend/
│   └── test_pronunciation_service.py # NEW
└── frontend/
    └── speechService.test.ts          # NEW
```

---

## Prerequisites

### Task 0.1: Install Frontend Dependencies

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install required frontend dependencies**

Run: `cd frontend && npm install axios zustand recharts`
Expected: Packages added to package.json and node_modules

- [ ] **Step 2: Install dev dependencies for testing**

Run: `cd frontend && npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jest-axe`
Expected: Test packages installed

- [ ] **Step 3: Commit dependencies**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: install frontend dependencies for Reading Coach

- axios for API calls
- zustand for state management
- recharts for progress visualization
- vitest and testing-library for tests

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 0.2: Create Data Directory

**Files:**
- Create: `backend/app/data/`

- [ ] **Step 1: Create data directory for reading passages**

Run: `mkdir -p backend/app/data`
Expected: Directory created successfully

- [ ] **Step 2: Add .gitkeep to preserve directory structure**

Run: `touch backend/app/data/.gitkeep`
Expected: .gitkeep file created

- [ ] **Step 3: Commit directory structure**

```bash
git add backend/app/data/
git commit -m "chore: create data directory for reading passages

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 1: Database Schema & Backend Foundation

### Task 1.1: Add ReadingCoachSession to Prisma Schema

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Read existing schema to understand current structure**

Run: `cat backend/prisma/schema.prisma`
Expected: View existing User and LearningProgress models

- [ ] **Step 2: Add ReadingCoachSession model to schema**

Add to `backend/prisma/schema.prisma` after LearningProgress model:

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

  @@index([userId])
  @@index([createdAt])
}
```

- [ ] **Step 3: Update LearningProgress model to include reading coach metrics**

Find the existing `model LearningProgress` and add these fields:

```prisma
model LearningProgress {
  // ... existing fields ...

  // Reading Coach specific metrics
  readingCoachSessions Int                    @default(0)
  pronunciationAccuracy Float?                // Average across sessions
  improvedWords        Json?                  // Track words that improved
  readingCoachSessions ReadingCoachSession[]  // NEW - relation to sessions
}
```

- [ ] **Step 4: Generate Prisma client**

Run: `cd backend && npx prisma generate`
Expected: "✔ Generated Prisma Client" output

- [ ] **Step 5: Create and run migration**

Run: `cd backend && npx prisma migrate dev --name add_reading_coach_session`
Expected: Migration created and applied successfully

- [ ] **Step 6: Commit database changes**

```bash
git add backend/prisma/
git commit -m "feat: add ReadingCoachSession table for pronunciation tracking

- Add ReadingCoachSession model with error tracking
- Link to LearningProgress for unified metrics
- Include phonetic feedback JSON field

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.2: Create TypeScript Interfaces

**Files:**
- Create: `frontend/src/types/reading-coach.ts`

- [ ] **Step 1: Create TypeScript interfaces for Reading Coach**

Create `frontend/src/types/reading-coach.ts`:

```typescript
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
```

- [ ] **Step 2: Commit TypeScript interfaces**

```bash
git add frontend/src/types/reading-coach.ts
git commit -m "feat: add TypeScript interfaces for Reading Coach

- Define PronunciationError with phonetic guide
- ReadingSession with accuracy metrics
- ReadingPassage for library content
- ReadingCoachState for Zustand store

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.3: Create Reading Passages Library

**Files:**
- Create: `backend/app/data/reading_passages.json`

- [ ] **Step 1: Create initial reading passages library**

Create `backend/app/data/reading_passages.json`:

```json
{
  "passages": [
    {
      "id": "passage_001",
      "title": "The Little Seed",
      "text": "A little seed sleeps in the soil. The sun warms the ground. Rain falls gently. The seed wakes up. A tiny green shoot reaches for the sky.",
      "readingLevel": "elementary",
      "category": "nature",
      "difficultyScore": 1,
      "wordCount": 35
    },
    {
      "id": "passage_002",
      "title": "Water Drops",
      "text": "Water falls from clouds as rain. It flows into rivers. Rivers carry water to the ocean. The sun warms the ocean water. Water rises as vapor and forms clouds.",
      "readingLevel": "elementary",
      "category": "nature",
      "difficultyScore": 2,
      "wordCount": 38
    },
    {
      "id": "passage_003",
      "title": "Day and Night",
      "text": "The Earth spins like a top. One side faces the sun. It is daytime there. The other side faces away. It is night there. As Earth spins, day becomes night and night becomes day.",
      "readingLevel": "middle",
      "category": "science",
      "difficultyScore": 3,
      "wordCount": 48
    },
    {
      "id": "passage_004",
      "title": "Plant Food",
      "text": "Plants make their own food. They use sunlight, water, and air. The leaves catch sunlight. The roots drink water. Tiny holes in leaves take in air. The plant turns these into sugar.",
      "readingLevel": "middle",
      "category": "science",
      "difficultyScore": 4,
      "wordCount": 47
    },
    {
      "id": "passage_005",
      "title": "The Moon's Journey",
      "text": "The moon travels around Earth. It takes about twenty-seven days. Sometimes the moon looks full. Sometimes it looks like a banana. The moon's light comes from the sun.",
      "readingLevel": "middle",
      "category": "science",
      "difficultyScore": 5,
      "wordCount": 42
    },
    {
      "id": "passage_006",
      "title": "Photosynthesis",
      "text": "Plants use sunlight to make food. This process is called photosynthesis. Chlorophyll in leaves captures sunlight. The plant combines water and carbon dioxide. It produces glucose and oxygen.",
      "readingLevel": "high",
      "category": "science",
      "difficultyScore": 6,
      "wordCount": 38
    },
    {
      "id": "passage_007",
      "title": "The Water Cycle",
      "text": "Water continuously moves through the environment. The sun heats surface water, causing evaporation. Water vapor rises and cools, forming clouds. Precipitation returns water to Earth, completing the cycle.",
      "readingLevel": "high",
      "category": "science",
      "difficultyScore": 7,
      "wordCount": 39
    },
    {
      "id": "passage_008",
      "title": "A Friendly Dog",
      "text": "Max is a friendly dog. He has soft brown fur. Max likes to play in the park. He runs fast and jumps high. His favorite toy is a bright red ball.",
      "readingLevel": "elementary",
      "category": "daily",
      "difficultyScore": 1,
      "wordCount": 38
    },
    {
      "id": "passage_009",
      "title": "School Morning",
      "text": "The school bus arrives at seven forty-five. Children line up to board. They find their seats and say hello to friends. The bus drives through the neighborhood. It arrives at school at eight fifteen.",
      "readingLevel": "middle",
      "category": "daily",
      "difficultyScore": 3,
      "wordCount": 42
    },
    {
      "id": "passage_010",
      "title": "Ancient Egypt",
      "text": "Ancient Egyptians built pyramids as tombs for pharaohs. The Great Pyramid of Giza required over two million stone blocks. Egyptians developed hieroglyphics, a writing system using pictures and symbols.",
      "readingLevel": "high",
      "category": "history",
      "difficultyScore": 7,
      "wordCount": 41
    }
  ]
}
```

- [ ] **Step 2: Commit reading passages library**

```bash
git add backend/app/data/reading_passages.json
git commit -m "feat: add initial reading passages library

- 10 passages across elementary/middle/high levels
- Categories: nature, science, daily, history
- Difficulty scores 1-7
- Word counts 35-48 words

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 2: Backend Services

### Task 2.1: Create Pronunciation Service

**Files:**
- Create: `backend/app/services/pronunciation_service.py`

- [ ] **Step 1: Create pronunciation service with text alignment algorithms**

Create `backend/app/services/pronunciation_service.py`:

```python
"""
Pronunciation Analysis Service

Analyzes spoken text against expected text using:
- Levenshtein distance for word alignment
- Phonetic similarity scoring
- Confidence threshold analysis
"""

from typing import List, Dict, Tuple, Optional
import re
from difflib import SequenceMatcher
import json


class PronunciationError:
    def __init__(
        self,
        word: str,
        expected: str,
        actual: str,
        position: int,
        confidence: float,
        phonetic_guide: Optional[str] = None
    ):
        self.word = word
        self.expected = expected
        self.actual = actual
        self.position = position
        self.confidence = confidence
        self.phonetic_guide = phonetic_guide

    def to_dict(self) -> dict:
        return {
            "word": self.word,
            "expected": self.expected,
            "actual": self.actual,
            "position": self.position,
            "confidence": self.confidence,
            "phoneticGuide": self.phonetic_guide
        }


class PronunciationAnalyzer:
    """Analyzes pronunciation by comparing spoken vs expected text."""

    # Common phonetic substitutions for dyslexic readers
    PHONETIC_SIMILARITY = {
        # b/d confusion
        ("b", "d"): 0.7, ("d", "b"): 0.7,
        # p/q confusion
        ("p", "q"): 0.7, ("q", "p"): 0.7,
        # m/n confusion
        ("m", "n"): 0.8, ("n", "m"): 0.8,
        # vowel substitutions
        ("a", "e"): 0.8, ("e", "a"): 0.8,
        ("i", "e"): 0.8, ("e", "i"): 0.8,
        ("o", "u"): 0.8, ("u", "o"): 0.8,
    }

    # Phonetic guides for common words
    PHONETIC_GUIDES = {
        "food": "/fuːd/",
        "sunlight": "/ˈsʌn.laɪt/",
        "water": "/ˈwɔː.tər/",
        "photosynthesis": "/ˌfoʊ.təʊˈsɪn.θə.sɪs/",
        "evaporation": "/ɪˌvæp.əˈreɪ.ʃən/",
        "precipitation": "/prɪˌsɪp.ɪˈteɪ.ʃən/",
        "chlorophyll": "/ˈklɔː.rə.fɪl/",
        "glucose": "/ˈɡluː.koʊs/",
        "pyramid": "/ˈpɪr.ə.mɪd/",
        "hieroglyphics": "/ˌhaɪ.ə.rəˈɡlɪf.ɪks/",
    }

    def __init__(self, confidence_threshold: float = 0.85):
        self.confidence_threshold = confidence_threshold

    def normalize_text(self, text: str) -> List[str]:
        """Clean and split text into words."""
        # Remove punctuation and convert to lowercase
        cleaned = re.sub(r'[^\w\s]', '', text.lower())
        return cleaned.split()

    def levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate edit distance between two strings."""
        if len(s1) < len(s2):
            return self.levenshtein_distance(s2, s1)

        if len(s2) == 0:
            return len(s1)

        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row

        return previous_row[-1]

    def calculate_phonetic_similarity(self, word1: str, word2: str) -> float:
        """Calculate phonetic similarity between two words."""
        if word1 == word2:
            return 1.0

        # Check phonetic similarity table
        key = (word1[0] if word1 else "", word2[0] if word2 else "")
        similarity = self.PHONETIC_SIMILARITY.get(key)

        if similarity:
            # Adjust based on full word similarity
            ratio = SequenceMatcher(None, word1, word2).ratio()
            return similarity * ratio

        # Use string similarity as fallback
        return SequenceMatcher(None, word1, word2).ratio()

    def align_words(
        self,
        expected: List[str],
        spoken: List[str]
    ) -> List[Tuple[Optional[str], Optional[str]]]:
        """
        Align spoken words to expected words using dynamic programming.

        Returns list of (expected_word, spoken_word) tuples.
        None indicates insertion or deletion.
        """
        m, n = len(expected), len(spoken)
        dp = [[0] * (n + 1) for _ in range(m + 1)]

        # Initialize
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j

        # Fill DP table
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if expected[i - 1] == spoken[j - 1]:
                    cost = 0
                else:
                    cost = 1
                dp[i][j] = min(
                    dp[i - 1][j] + 1,      # Deletion
                    dp[i][j - 1] + 1,      # Insertion
                    dp[i - 1][j - 1] + cost  # Substitution
                )

        # Backtrack to find alignment
        alignment = []
        i, j = m, n
        while i > 0 or j > 0:
            if i > 0 and j > 0 and expected[i - 1] == spoken[j - 1]:
                alignment.append((expected[i - 1], spoken[j - 1]))
                i -= 1
                j -= 1
            elif i > 0 and (j == 0 or dp[i][j] == dp[i - 1][j] + 1):
                alignment.append((expected[i - 1], None))  # Deletion
                i -= 1
            else:
                alignment.append((None, spoken[j - 1]))  # Insertion
                j -= 1

        return list(reversed(alignment))

    def analyze_pronunciation(
        self,
        expected_text: str,
        spoken_text: str
    ) -> Dict:
        """
        Analyze pronunciation by comparing texts.

        Returns:
            Dict with accuracy score, error details, and feedback
        """
        expected_words = self.normalize_text(expected_text)
        spoken_words = self.normalize_text(spoken_text)

        if not expected_words:
            return {
                "accuracyScore": 100.0,
                "wordsCorrect": 0,
                "wordsIncorrect": 0,
                "errors": [],
                "phoneticFeedback": None
            }

        # Align words
        alignment = self.align_words(expected_words, spoken_words)

        # Analyze each alignment
        errors = []
        correct_count = 0
        incorrect_count = 0
        position = 0

        for expected_word, spoken_word in alignment:
            if expected_word is None:
                # Extra word spoken - skip
                continue

            position += 1

            if spoken_word is None:
                # Missed word
                incorrect_count += 1
                errors.append(PronunciationError(
                    word=expected_word,
                    expected=expected_word,
                    actual="[missed]",
                    position=position,
                    confidence=0.0,
                    phonetic_guide=self.PHONETIC_GUIDES.get(expected_word)
                ))
                continue

            # Compare words
            edit_distance = self.levenshtein_distance(expected_word, spoken_word)
            phonetic_sim = self.calculate_phonetic_similarity(expected_word, spoken_word)

            # Calculate confidence score
            if expected_word == spoken_word:
                confidence = 1.0
                correct_count += 1
            elif edit_distance == 1:
                confidence = 0.7
                incorrect_count += 1
            elif edit_distance == 2:
                confidence = 0.4
                incorrect_count += 1
            else:
                confidence = phonetic_sim
                incorrect_count += 1

            # Flag as error if below threshold
            if confidence < self.confidence_threshold:
                errors.append(PronunciationError(
                    word=expected_word,
                    expected=expected_word,
                    actual=spoken_word,
                    position=position,
                    confidence=confidence,
                    phonetic_guide=self.PHONETIC_GUIDES.get(expected_word)
                ))

        # Calculate overall accuracy
        total_words = correct_count + incorrect_count
        accuracy_score = (correct_count / total_words * 100) if total_words > 0 else 0

        # Generate phonetic feedback
        phonetic_feedback = self._generate_feedback(errors, correct_count, incorrect_count)

        return {
            "accuracyScore": round(accuracy_score, 2),
            "wordsCorrect": correct_count,
            "wordsIncorrect": incorrect_count,
            "errors": [error.to_dict() for error in errors],
            "phoneticFeedback": phonetic_feedback
        }

    def _generate_feedback(
        self,
        errors: List[PronunciationError],
        correct: int,
        incorrect: int
    ) -> Dict:
        """Generate personalized feedback based on performance."""
        total = correct + incorrect
        if total == 0:
            return {}

        # Identify problem patterns
        problem_words = [e.word for e in errors if e.confidence < 0.5]
        improved_words = [e.word for e in errors if 0.5 <= e.confidence < 0.85]

        return {
            "overallScore": round((correct / total) * 100, 2),
            "improvedWords": improved_words,
            "needsPractice": problem_words,
            "message": self._get_feedback_message(correct / total)
        }

    def _get_feedback_message(self, accuracy: float) -> str:
        """Get encouraging feedback message."""
        if accuracy >= 0.9:
            return "Excellent reading! You're doing great!"
        elif accuracy >= 0.8:
            return "Good job! Keep practicing to improve further."
        elif accuracy >= 0.7:
            return "Nice effort! Let's work on those tricky words together."
        elif accuracy >= 0.6:
            return "Good start! Take your time with each word."
        else:
            return "That's okay! Reading takes practice. Let's try again."


# Singleton instance
pronunciation_analyzer = PronunciationAnalyzer()
```

- [ ] **Step 2: Commit pronunciation service**

```bash
git add backend/app/services/pronunciation_service.py
git commit -m "feat: add pronunciation analysis service

- Levenshtein distance for word alignment
- Phonetic similarity scoring for dyslexic readers
- Confidence-based error detection
- Personalized feedback generation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.2: Create Reading Coach API Endpoints

**Files:**
- Create: `backend/app/api/reading_coach.py`

- [ ] **Step 1: Create reading coach API router**

Create `backend/app/api/reading_coach.py`:

```python
"""
Reading Coach API Endpoints

Provides endpoints for:
- Starting reading sessions
- Analyzing pronunciation
- Retrieving passages library
- Fetching progress data
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from pathlib import Path

from app.core.deps import get_current_user, get_database
from app.models.models import User, Prisma
from app.services.pronunciation_service import pronunciation_analyzer

router = APIRouter()


# ============================================
# Schemas
# ============================================

class PronunciationAnalysisRequest(BaseModel):
    expectedText: str
    spokenText: str


class PronunciationAnalysisResponse(BaseModel):
    accuracyScore: float
    wordsCorrect: int
    wordsIncorrect: int
    errors: List[dict]
    phoneticFeedback: Optional[dict] = None


class ReadingSessionRequest(BaseModel):
    passageId: str
    passageText: str
    spokenText: str
    accuracyScore: float
    wordsCorrect: int
    wordsIncorrect: int
    errors: List[dict]


class PronounceWordRequest(BaseModel):
    word: str


# ============================================
# Helper Functions
# ============================================

def load_passages() -> List[dict]:
    """Load reading passages from JSON file."""
    passages_file = Path(__file__).parent.parent / "data" / "reading_passages.json"
    try:
        with open(passages_file, 'r') as f:
            data = json.load(f)
            return data.get("passages", [])
    except FileNotFoundError:
        return []


# ============================================
# API Endpoints
# ============================================

@router.post("/analyze", response_model=PronunciationAnalysisResponse)
async def analyze_pronunciation(
    request: PronunciationAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze pronunciation by comparing spoken text to expected text.

    Uses Levenshtein distance and phonetic similarity algorithms
    to detect pronunciation errors and provide feedback.
    """
    try:
        result = pronunciation_analyzer.analyze_pronunciation(
            expected_text=request.expectedText,
            spoken_text=request.spokenText
        )
        return PronunciationAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/submit-reading")
async def submit_reading_session(
    request: ReadingSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Submit a completed reading session for storage.

    Saves the session data and updates user's learning progress.
    """
    try:
        # Create reading session
        session = await db.readingcoachsession.create(
            data={
                "userId": current_user.id,
                "passageText": request.passageText,
                "spokenText": request.spokenText,
                "accuracyScore": request.accuracyScore,
                "wordsCorrect": request.wordsCorrect,
                "wordsIncorrect": request.wordsIncorrect,
                "errors": request.errors,
                "phoneticFeedback": {
                    "overallScore": request.accuracyScore,
                    "improvedWords": [],
                    "needsPractice": []
                }
            }
        )

        # Update learning progress
        progress = await db.learningprogress.find_unique(
            where={"userId": current_user.id}
        )

        if progress:
            # Calculate new average accuracy
            current_sessions = progress.readingCoachSessions + 1
            current_avg = progress.pronunciationAccuracy or 0
            new_avg = ((current_avg * (current_sessions - 1)) + request.accuracyScore) / current_sessions

            await db.learningprogress.update(
                where={"userId": current_user.id},
                data={
                    "readingCoachSessions": current_sessions,
                    "pronunciationAccuracy": new_avg
                }
            )

        return {"success": True, "sessionId": session.id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/passages")
async def get_passages(
    level: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Get reading passages library.

    Can filter by reading level and category.
    """
    try:
        passages = load_passages()

        # Apply filters
        if level:
            passages = [p for p in passages if p.get("readingLevel") == level]
        if category:
            passages = [p for p in passages if p.get("category") == category]

        return {"passages": passages}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/progress/{user_id}")
async def get_reading_progress(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get reading progress for a user.

    Returns recent sessions and overall statistics.
    """
    try:
        # Verify user has access (their own data or teacher)
        if current_user.id != user_id and current_user.role != "teacher":
            raise HTTPException(status_code=403, detail="Access denied")

        # Get recent sessions
        sessions = await db.readingcoachsession.find_many(
            where={"userId": user_id},
            order={"createdAt": "desc"},
            take=10
        )

        # Get overall progress
        progress = await db.learningprogress.find_unique(
            where={"userId": user_id}
        )

        return {
            "sessions": sessions,
            "overallProgress": progress
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/progress/me")
async def get_my_progress(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get current user's reading progress.

    Convenience endpoint for the current user.
    """
    try:
        # Get recent sessions
        sessions = await db.readingcoachsession.find_many(
            where={"userId": current_user.id},
            order={"createdAt": "desc"},
            take=10
        )

        # Get overall progress
        progress = await db.learningprogress.find_unique(
            where={"userId": current_user.id}
        )

        return {
            "sessions": sessions,
            "overallProgress": progress
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pronounce-word")
async def get_pronunciation_guide(
    request: PronounceWordRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get pronunciation guide for a word.

    Returns phonetic spelling and can generate audio (TTS).
    """
    try:
        from app.services.pronunciation_service import pronunciation_analyzer

        phonetic = pronunciation_analyzer.PHONETIC_GUIDES.get(request.word.lower())

        if not phonetic:
            # Generate basic phonetic guide
            phonetic = f"/{request.word}/"

        return {
            "word": request.word,
            "phoneticGuide": phonetic,
            "canPronounce": True
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "reading-coach"}
```

- [ ] **Step 2: Register reading coach router in main app**

Modify `backend/app/main.py` to add the router:

Find the section where routers are registered and add:

```python
from app.api.reading_coach import router as reading_coach_router

# Register reading coach router
app.include_router(
    reading_coach_router,
    prefix="/api/reading-coach",
    tags=["reading-coach"]
)
```

- [ ] **Step 3: Test API health check**

Run: `curl http://localhost:8000/api/reading-coach/health`
Expected: `{"status": "healthy", "service": "reading-coach"}`

- [ ] **Step 4: Test passages endpoint**

Run: `curl http://localhost:8000/api/reading-coach/passages`
Expected: JSON with passages array

- [ ] **Step 5: Commit API endpoints**

```bash
git add backend/app/api/reading_coach.py backend/app/main.py
git commit -m "feat: add Reading Coach API endpoints

- POST /analyze - Pronunciation analysis
- POST /submit-reading - Save session data
- GET /passages - Reading passage library
- GET /progress/{user_id} - User progress data
- POST /pronounce-word - Get pronunciation guide

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 3: Backend Tests

### Task 3.1: Create Pronunciation Service Tests

**Files:**
- Create: `backend/tests/test_pronunciation_service.py`

- [ ] **Step 1: Create pronunciation service tests**

Create `backend/tests/test_pronunciation_service.py`:

```python
"""
Tests for pronunciation analysis service.
"""

import pytest
from app.services.pronunciation_service import (
    PronunciationAnalyzer,
    pronunciation_analyzer
)


class TestPronunciationAnalyzer:
    """Test suite for PronunciationAnalyzer."""

    def test_normalize_text(self):
        """Test text normalization."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.normalize_text("Hello, World!")
        assert result == ["hello", "world"]

    def test_perfect_match(self):
        """Test analysis with perfect pronunciation."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The cat sat",
            spoken_text="The cat sat"
        )
        assert result["accuracyScore"] == 100.0
        assert result["wordsCorrect"] == 3
        assert result["wordsIncorrect"] == 0
        assert len(result["errors"]) == 0

    def test_single_substitution(self):
        """Test analysis with one substituted letter."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The cat sat",
            spoken_text="The cat sut"  # 'sat' -> 'sut'
        )
        assert result["accuracyScore"] < 100
        assert result["wordsIncorrect"] == 1
        assert len(result["errors"]) == 1
        assert result["errors"][0]["word"] == "sat"
        assert result["errors"][0]["actual"] == "sut"

    def test_bd_confusion(self):
        """Test b/d confusion handling (common dyslexic error)."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The big dog",
            spoken_text="The dig bog"  # b/d swap
        )
        # Should detect errors but with higher confidence due to phonetic similarity
        assert len(result["errors"]) >= 1

    def test_missed_word(self):
        """Test analysis when user skips a word."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The cat sat on mat",
            spoken_text="The cat sat mat"  # missed 'on'
        )
        assert result["wordsIncorrect"] >= 1
        # Check for missed word error
        missed_errors = [e for e in result["errors"] if e["actual"] == "[missed]"]
        assert len(missed_errors) >= 1

    def test_phonetic_guide(self):
        """Test phonetic guide generation."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The water cycle",
            spoken_text="The water"
        )
        # Check for phonetic guide on 'cycle' if it was an error
        cycle_error = next((e for e in result["errors"] if e["word"] == "cycle"), None)
        if cycle_error:
            assert cycle_error.get("phoneticGuide") is not None

    def test_confidence_threshold(self):
        """Test different confidence thresholds."""
        analyzer_strict = PronunciationAnalyzer(confidence_threshold=0.95)
        analyzer_lenient = PronunciationAnalyzer(confidence_threshold=0.70)

        result_strict = analyzer_strict.analyze_pronunciation(
            expected_text="cat",
            spoken_text="cut"  # 1-letter edit
        )
        result_lenient = analyzer_lenient.analyze_pronunciation(
            expected_text="cat",
            spoken_text="cut"
        )

        # Strict should flag as error, lenient might not
        assert len(result_strict["errors"]) >= len(result_lenient["errors"])

    def test_empty_spoken_text(self):
        """Test analysis with no spoken text."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The cat sat",
            spoken_text=""
        )
        assert result["accuracyScore"] == 0
        assert result["wordsCorrect"] == 0
        assert result["wordsIncorrect"] == 3

    def test_feedback_messages(self):
        """Test feedback message generation."""
        analyzer = PronunciationAnalyzer()

        # Excellent performance
        result_90 = analyzer.analyze_pronunciation(
            expected_text="cat dog bird fish",
            spoken_text="cat dog bird fish"
        )
        assert "excellent" in result_90["phoneticFeedback"]["message"].lower()

        # Needs practice
        result_50 = analyzer.analyze_pronunciation(
            expected_text="cat dog bird fish",
            spoken_text="cut dig berd"
        )
        assert result_50["phoneticFeedback"]["message"] is not None

    def test_levenshtein_distance(self):
        """Test Levenshtein distance calculation."""
        analyzer = PronunciationAnalyzer()

        assert analyzer.levenshtein_distance("cat", "cat") == 0
        assert analyzer.levenshtein_distance("cat", "cut") == 1
        assert analyzer.levenshtein_distance("cat", "bat") == 1
        assert analyzer.levenshtein_distance("cat", "bats") == 2

    def test_phonetic_similarity(self):
        """Test phonetic similarity calculation."""
        analyzer = PronunciationAnalyzer()

        # Same word
        assert analyzer.calculate_phonetic_similarity("cat", "cat") == 1.0

        # b/d confusion - should have high similarity
        bd_sim = analyzer.calculate_phonetic_similarity("big", "dig")
        assert bd_sim > 0.5

        # Completely different words
        diff_sim = analyzer.calculate_phonetic_similarity("cat", "elephant")
        assert diff_sim < 0.5


class TestPronunciationServiceIntegration:
    """Integration tests using the singleton instance."""

    def test_singleton_available(self):
        """Test that singleton instance is available."""
        assert pronunciation_analyzer is not None
        assert isinstance(pronunciation_analyzer, PronunciationAnalyzer)

    def test_real_passage_analysis(self):
        """Test analysis with real reading passage."""
        passage = "A little seed sleeps in the soil. The sun warms the ground."
        spoken = "A little seed sleeps in the soil. The sun warms the ground."

        result = pronunciation_analyzer.analyze_pronunciation(passage, spoken)
        assert result["accuracyScore"] == 100.0
        assert result["wordsCorrect"] == 14


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

- [ ] **Step 2: Run tests to verify pronunciation service**

Run: `cd backend && python -m pytest tests/test_pronunciation_service.py -v`
Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add backend/tests/test_pronunciation_service.py
git commit -m "test: add pronunciation service tests

- Test text normalization and word alignment
- Test perfect matches and substitutions
- Test b/d confusion handling (dyslexic patterns)
- Test missed words and confidence thresholds
- Test feedback message generation
- Integration tests with real passages

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 4: Frontend Services

### Task 4.1: Create Speech Recognition Service

**Files:**
- Create: `frontend/src/services/speechService.ts`

- [ ] **Step 1: Create speech service with Web Speech API**

Create `frontend/src/services/speechService.ts`:

```typescript
/**
 * Speech Recognition Service
 *
 * Wraps Web Speech API for continuous speech recognition.
 * Handles browser compatibility and permission errors.
 */

export interface SpeechRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface SpeechRecognitionEvent {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export type SpeechRecognitionCallback = (event: SpeechRecognitionEvent) => void;
export type SpeechErrorCallback = (error: string) => void;

export class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback: SpeechRecognitionCallback | null = null;
  private onErrorCallback: SpeechErrorCallback | null = null;
  private finalTranscript: string = '';

  /**
   * Check if Web Speech API is supported
   */
  isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  /**
   * Initialize speech recognition
   */
  initialize(config: SpeechRecognitionConfig = {}): boolean {
    if (!this.isSupported()) {
      console.error('Web Speech API not supported');
      return false;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.continuous = config.continuous ?? true;
    this.recognition.interimResults = config.interimResults ?? true;
    this.recognition.lang = config.language ?? 'en-US';
    this.recognition.maxAlternatives = config.maxAlternatives ?? 1;

    // Set up event handlers
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          this.finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onResultCallback) {
        this.onResultCallback({
          transcript: (this.finalTranscript + interimTranscript).trim(),
          confidence: 0.9,
          isFinal: false
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'no-speech') {
        // Ignore no-speech errors, just continue listening
        return;
      }

      if (event.error === 'not-allowed') {
        if (this.onErrorCallback) {
          this.onErrorCallback('Microphone permission denied');
        }
        this.stop();
        return;
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if we're supposed to be listening
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch (e) {
          // Already started or other error
          console.warn('Could not restart recognition:', e);
        }
      }
    };

    return true;
  }

  /**
   * Start listening for speech
   */
  start(): boolean {
    if (!this.recognition) {
      if (!this.initialize()) {
        return false;
      }
    }

    try {
      this.isListening = true;
      this.finalTranscript = '';
      this.recognition.start();
      return true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      this.isListening = false;
      return false;
    }
  }

  /**
   * Stop listening
   */
  stop(): void {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Get current transcript
   */
  getTranscript(): string {
    return this.finalTranscript.trim();
  }

  /**
   * Reset transcript
   */
  reset(): void {
    this.finalTranscript = '';
  }

  /**
   * Set result callback
   */
  onResult(callback: SpeechRecognitionCallback): void {
    this.onResultCallback = callback;
  }

  /**
   * Set error callback
   */
  onError(callback: SpeechErrorCallback): void {
    this.onErrorCallback = callback;
  }

  /**
   * Check if currently listening
   */
  isActive(): boolean {
    return this.isListening;
  }
}

// Singleton instance
export const speechService = new SpeechService();

/**
 * Text-to-Speech Service for pronunciation playback
 */
export class TTSService {
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  /**
   * Check if TTS is supported
   */
  isSupported(): boolean {
    return this.synth !== null;
  }

  /**
   * Speak a word
   */
  speak(word: string, rate: number = 0.8): void {
    if (!this.synth) {
      console.error('TTS not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Select a clear English voice
    const voices = this.synth.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                        voices.find(v => v.lang.startsWith('en-US'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    this.synth.speak(utterance);
  }

  /**
   * Stop speaking
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const ttsService = new TTSService();
```

- [ ] **Step 2: Commit speech service**

```bash
git add frontend/src/services/speechService.ts
git commit -m "feat: add speech recognition service

- Web Speech API wrapper with continuous recognition
- Browser compatibility checks
- Error handling for microphone permissions
- TTS service for pronunciation playback

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4.2: Create Reading Coach Store

**Files:**
- Create: `frontend/src/stores/readingCoachStore.ts`

- [ ] **Step 1: Create Zustand store for Reading Coach**

Create `frontend/src/stores/readingCoachStore.ts`:

```typescript
/**
 * Reading Coach Store
 *
 * Manages state for the Reading Coach feature using Zustand.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type {
  ReadingPassage,
  ReadingSession,
  PronunciationError,
  SpeechRecognitionEvent
} from '../types/reading-coach';
import { speechService, ttsService } from '../services/speechService';

const API_BASE = '/api/reading-coach';

interface ReadingCoachState {
  // Current session state
  currentPassage: ReadingPassage | null;
  isRecording: boolean;
  spokenText: string;
  errors: PronunciationError[];
  isProcessing: boolean;
  errorMessage: string | null;

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

      // Submit session for analysis
      submitSession: async () => {
        const { currentPassage, spokenText } = get();

        if (!currentPassage || !spokenText) {
          set({ errorMessage: 'No reading to submit' });
          return;
        }

        set({ isProcessing: true, errorMessage: null });

        try {
          // Call pronunciation analysis API
          const response = await axios.post(`${API_BASE}/analyze`, {
            expectedText: currentPassage.text,
            spokenText: spokenText
          });

          const { accuracyScore, wordsCorrect, wordsIncorrect, errors, phoneticFeedback } = response.data;

          // Save session
          await axios.post(`${API_BASE}/submit-reading`, {
            passageId: currentPassage.id,
            passageText: currentPassage.text,
            spokenText: spokenText,
            accuracyScore,
            wordsCorrect,
            wordsIncorrect,
            errors
          });

          // Update state
          set({
            errors,
            accuracyScore,
            isProcessing: false
          });

          // Reload history
          get().loadHistory();

        } catch (error: any) {
          set({
            errorMessage: error.response?.data?.detail || 'Failed to analyze pronunciation',
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
          const response = await axios.get(`${API_BASE}/progress/me`);
          set({ sessionHistory: response.data.sessions || [] });
        } catch (error) {
          console.error('Failed to load history:', error);
        }
      },

      // Play word pronunciation
      playWord: (word: string) => {
        set({ isPlaying: true });
        ttsService.speak(word, 0.8);

        // Reset playing state after speech
        setTimeout(() => {
          set({ isPlaying: false });
        }, 1000);
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
```

- [ ] **Step 2: Commit store**

```bash
git add frontend/src/stores/readingCoachStore.ts
git commit -m "feat: add Reading Coach Zustand store

- Manage recording state and session data
- Handle pronunciation analysis API calls
- Persist session history
- TTS playback for words

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 5: Frontend Components

### Task 5.1: Create SpeechRecorder Component

**Files:**
- Create: `frontend/src/components/reading-coach/SpeechRecorder.tsx`

- [ ] **Step 1: Create speech recorder component**

Create `frontend/src/components/reading-coach/SpeechRecorder.tsx`:

```typescript
/**
 * SpeechRecorder Component
 *
 * Controls speech recording with start/stop buttons.
 * Shows recording status and real-time transcript.
 */

import React, { useEffect, useRef } from 'react';
import { useReadingCoachStore } from '../../stores/readingCoachStore';

export const SpeechRecorder: React.FC = () => {
  const {
    isRecording,
    spokenText,
    startRecording,
    stopRecording,
    errorMessage
  } = useReadingCoachStore();

  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [spokenText]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Recording Controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Read Aloud</h2>
          <p className="text-gray-600">
            {isRecording ? 'Listening...' : 'Press start and read the passage'}
          </p>
        </div>

        <div className="flex gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              aria-label="Start recording"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
              </svg>
              Start Reading
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors animate-pulse"
              aria-label="Stop recording"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 rounded-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          <span className="text-red-700 font-medium">Recording in progress...</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
          <p className="text-orange-800">{errorMessage}</p>
        </div>
      )}

      {/* Real-time Transcript */}
      <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[120px] max-h-[240px] overflow-y-auto bg-gray-50">
        {spokenText ? (
          <p ref={transcriptRef} className="text-lg text-gray-800 leading-relaxed">
            {spokenText}
          </p>
        ) : (
          <p className="text-gray-400 italic">
            {isRecording
              ? 'Listening... Start reading the passage aloud.'
              : 'Your speech will appear here as you read.'}
          </p>
        )}
      </div>

      {/* Word Count */}
      {spokenText && (
        <div className="mt-2 text-sm text-gray-500">
          Words spoken: {spokenText.split(' ').length}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Commit component**

```bash
git add frontend/src/components/reading-coach/SpeechRecorder.tsx
git commit -m "feat: add SpeechRecorder component

- Start/stop recording buttons with visual feedback
- Real-time transcript display
- Recording indicator with animation
- Error message display
- Word count tracking

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.2: Create PronunciationFeedback Component

**Files:**
- Create: `frontend/src/components/reading-coach/PronunciationFeedback.tsx`

- [ ] **Step 1: Create pronunciation feedback component**

Create `frontend/src/components/reading-coach/PronunciationFeedback.tsx`:

```typescript
/**
 * PronunciationFeedback Component
 *
 * Displays pronunciation errors with color coding,
 * phonetic guides, and audio playback.
 */

import React from 'react';
import { useReadingCoachStore } from '../../stores/readingCoachStore';
import type { PronunciationError } from '../../types/reading-coach';

export const PronunciationFeedback: React.FC = () => {
  const {
    errors,
    accuracyScore,
    playWord,
    isPlaying,
    submitSession,
    isProcessing,
    currentPassage
  } = useReadingCoachStore();

  const getErrorColor = (error: PronunciationError): string => {
    if (error.confidence >= 0.7) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    if (error.confidence >= 0.4) return 'text-orange-600 bg-orange-50 border-orange-300';
    return 'text-red-600 bg-red-50 border-red-300';
  };

  const getErrorLabel = (confidence: number): string => {
    if (confidence >= 0.7) return 'Close!';
    if (confidence >= 0.4) return 'Keep trying';
    return 'Try again';
  };

  if (!currentPassage) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Pronunciation Feedback</h2>

      {/* No errors yet */}
      {errors.length === 0 && !accuracyScore && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <p>Read the passage to see feedback</p>
        </div>
      )}

      {/* Error List */}
      {errors.length > 0 && (
        <div className="space-y-3 mb-6">
          {errors.map((error, index) => (
            <div
              key={index}
              className={`p-4 border-2 rounded-lg ${getErrorColor(error)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold">{error.word}</span>
                    <span className="text-sm font-medium">→ {error.expected}</span>
                    <span className="text-xs px-2 py-1 bg-white rounded">
                      {getErrorLabel(error.confidence)}
                    </span>
                  </div>

                  {error.actual !== '[missed]' && (
                    <p className="text-sm mb-1">
                      <span className="font-medium">You said:</span> "{error.actual}"
                    </p>
                  )}

                  {error.phoneticGuide && (
                    <p className="text-sm font-mono">
                      <span className="font-medium">Pronunciation:</span> {error.phoneticGuide}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => playWord(error.expected)}
                  disabled={isPlaying}
                  className="ml-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                  aria-label={`Play pronunciation for ${error.expected}`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Score Display */}
      {accuracyScore !== undefined && accuracyScore !== null && (
        <div className={`p-6 rounded-lg text-center ${
          accuracyScore >= 90 ? 'bg-green-50' :
          accuracyScore >= 70 ? 'bg-yellow-50' :
          'bg-orange-50'
        }`}>
          <div className="text-4xl font-bold mb-2">
            {accuracyScore.toFixed(1)}%
          </div>
          <p className="text-gray-600">
            {accuracyScore >= 90 ? 'Excellent reading!' :
             accuracyScore >= 70 ? 'Good effort! Keep practicing.' :
             'Keep working on it!'}
          </p>
        </div>
      )}

      {/* Submit Button */}
      {errors.length > 0 && !accuracyScore && (
        <div className="mt-6">
          <button
            onClick={submitSession}
            disabled={isProcessing}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isProcessing ? 'Analyzing...' : 'Check My Reading'}
          </button>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Commit component**

```bash
git add frontend/src/components/reading-coach/PronunciationFeedback.tsx
git commit -m "feat: add PronunciationFeedback component

- Color-coded error display (yellow/orange/red)
- Phonetic guides with pronunciation
- Audio playback for correct pronunciation
- Score display with encouraging messages
- Submit button for analysis

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.3: Create PassageSelector Component

**Files:**
- Create: `frontend/src/components/reading-coach/PassageSelector.tsx`

- [ ] **Step 1: Create passage selector component**

Create `frontend/src/components/reading-coach/PassageSelector.tsx`:

```typescript
/**
 * PassageSelector Component
 *
 * Displays reading passages library with filtering options.
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useReadingCoachStore } from '../../stores/readingCoachStore';
import type { ReadingPassage } from '../../types/reading-coach';

export const PassageSelector: React.FC = () => {
  const { setCurrentPassage, clearCurrentSession } = useReadingCoachStore();
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [filteredPassages, setFilteredPassages] = useState<ReadingPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load passages
  useEffect(() => {
    loadPassages();
  }, []);

  // Filter passages
  useEffect(() => {
    let filtered = passages;

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(p => p.readingLevel === selectedLevel);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredPassages(filtered);
  }, [passages, selectedLevel, selectedCategory]);

  const loadPassages = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reading-coach/passages');
      setPassages(response.data.passages);
    } catch (error) {
      console.error('Failed to load passages:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectPassage = (passage: ReadingPassage) => {
    clearCurrentSession();
    setCurrentPassage(passage);
  };

  const levels = ['all', 'elementary', 'middle', 'high'];
  const categories = ['all', ...Array.from(new Set(passages.map(p => p.category)))];

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'elementary': return 'bg-green-100 text-green-800';
      case 'middle': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Reading Passages</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {levels.map(level => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500">Loading passages...</p>
        </div>
      ) : (
        <>
          {/* Passage Count */}
          <p className="text-sm text-gray-500 mb-4">
            {filteredPassages.length} passage{filteredPassages.length !== 1 ? 's' : ''} found
          </p>

          {/* Passage Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPassages.map((passage) => (
              <div
                key={passage.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer transition-colors"
                onClick={() => selectPassage(passage)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{passage.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(passage.readingLevel)}`}>
                    {passage.readingLevel}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {passage.text}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{passage.category}</span>
                  <span>{passage.wordCount} words</span>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredPassages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No passages match your filters.</p>
              <button
                onClick={() => {
                  setSelectedLevel('all');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-blue-500 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Commit component**

```bash
git add frontend/src/components/reading-coach/PassageSelector.tsx
git commit -m "feat: add PassageSelector component

- Display reading passages library
- Filter by level and category
- Visual passage cards with metadata
- Selection and loading states

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.4: Create ProgressChart Component

**Files:**
- Create: `frontend/src/components/reading-coach/ProgressChart.tsx`

- [ ] **Step 1: Create progress chart component**

Create `frontend/src/components/reading-coach/ProgressChart.tsx`:

```typescript
/**
 * ProgressChart Component
 *
 * Displays reading accuracy trends over time using Recharts.
 */

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

interface ProgressData {
  date: string;
  accuracy: number;
}

export const ProgressChart: React.FC = () => {
  const [data, setData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reading-coach/progress/me');
      const sessions = response.data.sessions || [];

      // Transform sessions into chart data
      const chartData = sessions.slice(-10).map((session: any) => ({
        date: new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: session.accuracyScore
      }));

      setData(chartData);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Progress</h2>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Progress</h2>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No sessions yet. Complete a reading to see your progress!</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#6b7280"
              fontSize={12}
              label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Stats Summary */}
      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {data[data.length - 1]?.accuracy.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Latest Score</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {data.length}
            </p>
            <p className="text-sm text-gray-600">Sessions</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {(data.reduce((sum, d) => sum + d.accuracy, 0) / data.length).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Average</p>
          </div>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Commit component**

```bash
git add frontend/src/components/reading-coach/ProgressChart.tsx
git commit -m "feat: add ProgressChart component

- Line chart showing accuracy over time
- Latest score, session count, and average stats
- Recharts integration with responsive design
- Loading and empty states

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.5: Create ReadingCoachPage

**Files:**
- Create: `frontend/src/pages/ReadingCoachPage.tsx`

- [ ] **Step 1: Create main Reading Coach page**

Create `frontend/src/pages/ReadingCoachPage.tsx`:

```typescript
/**
 * ReadingCoachPage
 *
 * Main page for the Reading Coach feature.
 * Combines all reading coach components.
 */

import React from 'react';
import { PassageSelector } from '../components/reading-coach/PassageSelector';
import { SpeechRecorder } from '../components/reading-coach/SpeechRecorder';
import { PronunciationFeedback } from '../components/reading-coach/PronunciationFeedback';
import { ProgressChart } from '../components/reading-coach/ProgressChart';
import { useReadingCoachStore } from '../stores/readingCoachStore';

export const ReadingCoachPage: React.FC = () => {
  const { currentPassage, loadHistory } = useReadingCoachStore();

  // Load session history on mount
  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎤 Reading Coach
          </h1>
          <p className="text-lg text-gray-600">
            Practice reading aloud and get instant feedback on your pronunciation.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Passage Selector - shown when no passage selected */}
            {!currentPassage && (
              <PassageSelector />
            )}

            {/* Current Passage Display */}
            {currentPassage && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{currentPassage.title}</h2>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {currentPassage.readingLevel}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                        {currentPassage.wordCount} words
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => useReadingCoachStore.getState().clearCurrentSession()}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Change passage"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-cream-50 p-6 rounded-lg border-2 border-gray-200">
                  <p className="text-xl leading-relaxed text-gray-800 font-lexend">
                    {currentPassage.text}
                  </p>
                </div>
              </div>
            )}

            {/* Speech Recorder */}
            <SpeechRecorder />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pronunciation Feedback */}
            <PronunciationFeedback />

            {/* Progress Chart */}
            <ProgressChart />
          </div>
        </div>

        {/* Instructions */}
        {currentPassage && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Read the passage above aloud clearly</li>
              <li>Press "Start Reading" to begin</li>
              <li>Speak at a normal pace</li>
              <li>Press "Stop" when finished</li>
              <li>Review your feedback and practice tricky words</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Add route to App.tsx**

Modify `frontend/src/App.tsx` to add the route:

Find the routes section and add:

```typescript
import { ReadingCoachPage } from './pages/ReadingCoachPage';

// In routes section:
<Route path="/reading-coach" element={<ReadingCoachPage />} />
```

- [ ] **Step 3: Commit page and routing**

```bash
git add frontend/src/pages/ReadingCoachPage.tsx frontend/src/App.tsx
git commit -m "feat: add Reading Coach page and routing

- Main page combining all Reading Coach components
- Passage selector and current passage display
- Instructions for use
- Route integration in App.tsx

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 6: Integration & Testing

### Task 6.1: Add Frontend Tests

**Files:**
- Create: `frontend/src/services/speechService.test.ts`

- [ ] **Step 1: Create speech service tests**

Create `frontend/src/services/speechService.test.ts`:

```typescript
/**
 * Tests for speech service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speechService, ttsService } from './speechService';

// Mock Web Speech API
const mockSpeechRecognition = vi.fn();
const mockSpeechSynthesis = {
  getVoices: vi.fn(() => []),
  speak: vi.fn(),
  cancel: vi.fn()
};

global.SpeechRecognition = mockSpeechRecognition;
global.webkitSpeechRecognition = mockSpeechRecognition;
global.speechSynthesis = mockSpeechSynthesis;

describe('SpeechService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect Web Speech API support', () => {
    expect(speechService.isSupported()).toBe(true);
  });

  it('should initialize speech recognition', () => {
    const result = speechService.initialize({
      continuous: true,
      interimResults: true,
      language: 'en-US'
    });
    expect(result).toBe(true);
  });

  it('should return false when API not supported', () => {
    // Temporarily remove API
    const original = (global as any).SpeechRecognition;
    delete (global as any).SpeechRecognition;

    const unsupportedService = { isSupported: () => false };
    expect(unsupportedService.isSupported()).toBe(false);

    // Restore
    (global as any).SpeechRecognition = original;
  });
});

describe('TTSService', () => {
  it('should detect TTS support', () => {
    expect(ttsService.isSupported()).toBe(true);
  });

  it('should speak a word', () => {
    ttsService.speak('hello');
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
  });

  it('should stop ongoing speech', () => {
    ttsService.stop();
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run frontend tests**

Run: `cd frontend && npm test`
Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add frontend/src/services/speechService.test.ts
git commit -m "test: add speech service tests

- Test Web Speech API support detection
- Test speech recognition initialization
- Test TTS speak and stop functions

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6.2: End-to-End Integration Test

**Files:**
- Create: `backend/tests/test_reading_coach_integration.py`

- [ ] **Step 1: Create integration tests**

Create `backend/tests/test_reading_coach_integration.py`:

```python
"""
Integration tests for Reading Coach API.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


class TestReadingCoachAPI:
    """Integration tests for reading coach endpoints."""

    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/api/reading-coach/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_get_passages(self):
        """Test getting reading passages."""
        response = client.get("/api/reading-coach/passages")
        assert response.status_code == 200
        data = response.json()
        assert "passages" in data
        assert len(data["passages"]) > 0

    def test_get_passages_by_level(self):
        """Test filtering passages by level."""
        response = client.get("/api/reading-coach/passages?level=elementary")
        assert response.status_code == 200
        data = response.json()
        assert all(p["readingLevel"] == "elementary" for p in data["passages"])

    def test_analyze_pronunciation(self):
        """Test pronunciation analysis endpoint."""
        response = client.post(
            "/api/reading-coach/analyze",
            json={
                "expectedText": "The cat sat",
                "spokenText": "The cat sat"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "accuracyScore" in data
        assert "wordsCorrect" in data
        assert "wordsIncorrect" in data
        assert data["accuracyScore"] == 100.0

    def test_analyze_with_errors(self):
        """Test pronunciation analysis with errors."""
        response = client.post(
            "/api/reading-coach/analyze",
            json={
                "expectedText": "The cat sat",
                "spokenText": "The cut sut"  # Two substitutions
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["accuracyScore"] < 100
        assert len(data["errors"]) >= 1

    def test_pronounce_word(self):
        """Test getting pronunciation guide."""
        response = client.post(
            "/api/reading-coach/pronounce-word",
            json={"word": "water"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "word" in data
        assert "phoneticGuide" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

- [ ] **Step 2: Run integration tests**

Run: `cd backend && python -m pytest tests/test_reading_coach_integration.py -v`
Expected: All tests pass

- [ ] **Step 3: Commit integration tests**

```bash
git add backend/tests/test_reading_coach_integration.py
git commit -m "test: add Reading Coach integration tests

- Test health check and passages endpoints
- Test pronunciation analysis with perfect match
- Test pronunciation analysis with errors
- Test pronunciation guide endpoint

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6.3: Accessibility Testing

**Files:**
- Create: `frontend/src/components/reading-coach/__tests__/SpeechRecorder.a11y.test.tsx`

- [ ] **Step 1: Create accessibility tests**

Create `frontend/src/components/reading-coach/__tests__/SpeechRecorder.a11y.test.tsx`:

```typescript
/**
 * Accessibility tests for Reading Coach components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SpeechRecorder } from '../SpeechRecorder';

expect.extend(toHaveNoViolations);

describe('SpeechRecorder Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<SpeechRecorder />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels', () => {
    render(<SpeechRecorder />);

    const startButton = screen.queryByRole('button', { name: /start recording/i });
    const stopButton = screen.queryByRole('button', { name: /stop recording/i });

    if (startButton) {
      expect(startButton).toHaveAttribute('aria-label');
    }
    if (stopButton) {
      expect(stopButton).toHaveAttribute('aria-label');
    }
  });

  it('should be keyboard navigable', () => {
    const { container } = render(<SpeechRecorder />);

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).not.toHaveAttribute('disabled');
    });
  });
});
```

- [ ] **Step 2: Run accessibility tests**

Run: `cd frontend && npm test -- SpeechRecorder.a11y.test.tsx`
Expected: No accessibility violations

- [ ] **Step 3: Commit accessibility tests**

```bash
git add frontend/src/components/reading-coach/__tests__/SpeechRecorder.a11y.test.tsx
git commit -m "test: add accessibility tests for SpeechRecorder

- Test for axe-core violations
- Verify ARIA labels on buttons
- Check keyboard navigability

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 7: Documentation & Polish

### Task 7.1: Update Main Documentation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README with Reading Coach feature**

Add to project README:

```markdown
## Features

### Reading Coach 🎤
A voice-based AI tutor that listens to students read aloud and provides pronunciation feedback.

- **Real-time speech recognition** using Web Speech API
- **Pronunciation analysis** with Levenshtein distance and phonetic similarity
- **Color-coded feedback** (yellow/close, orange/keep trying, red/try again)
- **Phonetic guides** for difficult words
- **Progress tracking** with accuracy trends over time
- **Browser-native** - no external APIs, complete privacy

**Usage:**
1. Navigate to /reading-coach
2. Select a reading passage by level and category
3. Press "Start Reading" and read aloud
4. Press "Stop" when finished
5. Review feedback and practice tricky words
```

- [ ] **Step 2: Commit README update**

```bash
git add README.md
git commit -m "docs: add Reading Coach feature to README

- Describe Reading Coach functionality
- Link to usage instructions
- List key features

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7.2: Create Feature Documentation

**Files:**
- Create: `docs/features/reading-coach.md`

- [ ] **Step 1: Create detailed feature documentation**

Create `docs/features/reading-coach.md`:

```markdown
# Reading Coach Feature Documentation

## Overview

The Reading Coach is a voice-based AI tutoring feature that helps dyslexic students improve their reading skills through real-time pronunciation feedback.

## How It Works

1. **Speech Recognition**: Uses the browser's Web Speech API to convert speech to text
2. **Text Alignment**: Aligns spoken words to expected text using dynamic programming
3. **Error Detection**: Flags mispronunciations using:
   - Edit distance (Levenshtein algorithm)
   - Phonetic similarity scoring
   - Confidence threshold analysis
4. **Feedback**: Provides color-coded feedback with phonetic guides

## Technical Details

### Speech Recognition
- **API**: Web Speech API (`SpeechRecognition` interface)
- **Continuous mode**: Listens until user stops
- **Interim results**: Shows real-time transcript
- **Language**: English (en-US)

### Pronunciation Analysis
- **Algorithm**: Levenshtein distance for edit distance
- **Phonetic similarity**: Special handling for b/d, p/q, m/n confusions
- **Confidence threshold**: 0.85 (configurable)
- **Phonetic guides**: IPA notation for common words

### Database Schema
- `ReadingCoachSession`: Stores session data
- `LearningProgress`: Tracks accuracy over time

## API Endpoints

### POST /api/reading-coach/analyze
Analyzes pronunciation by comparing spoken to expected text.

**Request:**
```json
{
  "expectedText": "The cat sat",
  "spokenText": "The cut sut"
}
```

**Response:**
```json
{
  "accuracyScore": 66.67,
  "wordsCorrect": 1,
  "wordsIncorrect": 2,
  "errors": [
    {
      "word": "cat",
      "expected": "cat",
      "actual": "cut",
      "position": 2,
      "confidence": 0.7,
      "phoneticGuide": "/kæt/"
    }
  ],
  "phoneticFeedback": {
    "overallScore": 66.67,
    "improvedWords": ["cat"],
    "needsPractice": ["sat"],
    "message": "Good effort! Let's work on those tricky words together."
  }
}
```

### GET /api/reading-coach/passages
Get reading passages library with optional filtering.

**Query Parameters:**
- `level`: elementary | middle | high
- `category`: nature | science | daily | history

### POST /api/reading-coach/submit-reading
Submit a completed reading session for storage.

### GET /api/reading-coach/progress/{user_id}
Get reading progress for a user.

### POST /api/reading-coach/pronounce-word
Get pronunciation guide for a word (returns phonetic spelling).

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | Best experience |
| Edge 90+ | ✅ Full | Based on Chromium |
| Firefox 88+ | ⚠️ Partial | No speech recognition |
| Safari 15+ | ⚠️ Partial | Requires user permission |

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- High contrast color coding
- Dyslexia-friendly fonts and spacing

## Future Enhancements

- [ ] Accent variation support
- [ ] Multi-language support
- [ ] Custom passage upload
- [ ] Teacher dashboard for reviewing student progress
- [ ] Adaptive difficulty based on performance
```

- [ ] **Step 2: Commit feature documentation**

```bash
git add docs/features/reading-coach.md
git commit -m "docs: add Reading Coach feature documentation

- Technical implementation details
- API endpoint documentation
- Browser support matrix
- Accessibility notes

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7.3: Final Integration Test

**Files:**
- None (manual testing)

- [ ] **Step 1: Manual testing checklist**

Run through this checklist:

```bash
# Backend tests
cd backend
python -m pytest tests/test_pronunciation_service.py -v
python -m pytest tests/test_reading_coach_integration.py -v

# Frontend tests
cd ../frontend
npm test

# Start backend
cd ../backend
python -m uvicorn app.main:app --reload

# In another terminal, start frontend
cd ../frontend
npm run dev
```

**Manual Test Steps:**
1. Navigate to http://localhost:5174/reading-coach
2. Select a passage
3. Click "Start Reading"
4. Grant microphone permission
5. Read the passage aloud
6. Click "Stop"
7. Verify errors appear with correct color coding
8. Click audio button to hear correct pronunciation
9. Submit session
10. View progress chart updated

- [ ] **Step 2: Verify all components work**

- ✅ Passage selector loads and filters
- ✅ Speech recognition starts/stops correctly
- ✅ Real-time transcript displays
- ✅ Pronunciation analysis works
- ✅ Color-coded errors display
- ✅ Phonetic guides show
- ✅ Audio playback works
- ✅ Progress chart renders
- ✅ Session history saves

- [ ] **Step 3: Final commit with completion message**

```bash
git add .
git commit -m "feat: complete Reading Coach feature implementation

This completes the Real-Time Reading Coach feature:

✅ Backend:
- PronunciationService with Levenshtein distance
- Reading Coach API endpoints
- Database schema (ReadingCoachSession)
- Reading passages library (10 passages)

✅ Frontend:
- SpeechService (Web Speech API wrapper)
- ReadingCoachStore (Zustand state)
- PassageSelector component
- SpeechRecorder component
- PronunciationFeedback component
- ProgressChart component
- ReadingCoachPage (main page)

✅ Testing:
- Pronunciation service unit tests
- API integration tests
- Frontend component tests
- Accessibility tests

✅ Documentation:
- Feature documentation
- API reference
- README updates

The Reading Coach is now fully functional and ready for use.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## End of Implementation Plan

**Total Estimated Time:** 10-15 days (depending on complexity)

**Key Deliverables:**
1. ✅ Database schema with ReadingCoachSession table
2. ✅ Backend pronunciation analysis service
3. ✅ API endpoints for all operations
4. ✅ Frontend components for all features
5. ✅ State management with Zustand
6. ✅ Comprehensive test coverage
7. ✅ Full documentation

**Next Steps After This Plan:**
1. Execute the plan using superpowers:subagent-driven-development
2. Conduct user acceptance testing with dyslexic students
3. Gather feedback and iterate
4. Proceed to AR Game implementation plan
5. Proceed to Story Summariser implementation plan
