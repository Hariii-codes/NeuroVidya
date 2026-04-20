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
