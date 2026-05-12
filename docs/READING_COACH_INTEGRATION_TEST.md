# Reading Coach - Final Integration Test Checklist

## Backend Tests

Run these commands to verify backend functionality:

```bash
cd backend

# Run pronunciation service tests
python -m pytest tests/test_pronunciation_service.py -v

# Run integration tests
python -m pytest tests/test_reading_coach_integration.py -v

# Expected: All tests pass
```

## Frontend Tests

Run these commands to verify frontend functionality:

```bash
cd frontend

# Run all frontend tests
npm test

# Run speech service tests specifically
npm test -- speechService.test.ts

# Run accessibility tests
npm test -- SpeechRecorder.a11y.test.tsx

# Expected: All tests pass
```

## Manual Testing Checklist

### Prerequisites

1. Start the backend server:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

2. Start the frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

3. Navigate to: `http://localhost:5173/reading-coach`

### Test Steps

#### 1. Passage Selector
- [ ] Page loads without errors
- [ ] Passage selector displays all 10 passages
- [ ] Filter by level works (elementary, middle, high)
- [ ] Filter by category works (nature, science, daily, history)
- [ ] Passage cards display correctly with title, text preview, level badge
- [ ] Clicking a passage selects it
- [ ] Selected passage displays in the main view

#### 2. Current Passage Display
- [ ] Selected passage shows title
- [ ] Reading level badge displays correct color
- [ ] Word count displays correctly
- [ ] Passage text is readable with proper formatting
- [ ] Close (X) button clears the passage

#### 3. Speech Recognition
- [ ] "Start Reading" button is visible
- [ ] Clicking start shows microphone permission prompt
- [ ] Granting permission starts recording
- [ ] Recording indicator appears (red pulsing dot)
- [ ] Real-time transcript updates as you speak
- [ ] "Stop" button stops recording
- [ ] Transcript shows spoken text

#### 4. Pronunciation Analysis
- [ ] After stopping, click "Check My Reading"
- [ ] Processing indicator shows
- [ ] Errors display with color coding:
  - Yellow for close matches (confidence >= 0.7)
  - Orange for keep trying (confidence >= 0.4)
  - Red for try again (confidence < 0.4)
- [ ] Each error shows:
  - Expected word
  - What you said
  - Phonetic guide (if available)
  - Audio playback button

#### 5. Audio Playback
- [ ] Clicking audio button on error pronounces the word correctly
- [ ] TTS uses clear English voice
- [ ] Playback rate is appropriate (0.8)

#### 6. Score Display
- [ ] Accuracy score displays (e.g., "85.3%")
- [ ] Background color matches score:
  - Green for 90%+
  - Yellow for 70-89%
  - Orange for <70%
- [ ] Encouraging message displays

#### 7. Progress Chart
- [ ] Progress chart displays after completing sessions
- [ ] Line chart shows accuracy over time
- [ ] Latest score displays
- [ ] Session count displays
- [ ] Average score displays
- [ ] Chart is responsive on different screen sizes

#### 8. Session History
- [ ] Sessions are saved after submission
- [ ] History persists on page refresh
- [ ] Multiple sessions display in progress chart

#### 9. Error Handling
- [ ] Microphone permission denied shows appropriate error
- [ ] No speech detected shows helpful message
- [ ] Network errors display user-friendly messages

#### 10. Accessibility
- [ ] All buttons have proper ARIA labels
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Focus indicators are visible
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA standards

## Browser Compatibility Testing

Test in each browser:

### Chrome/Edge (Chromium) - Full Support
- [ ] Speech recognition works
- [ ] TTS playback works
- [ ] All features functional

### Safari 15+ - Partial Support
- [ ] Speech recognition requires user permission
- [ ] May require HTTPS for microphone access

### Firefox - Limited Support
- [ ] Speech recognition not supported (show message)
- [ ] TTS playback works

## API Endpoints Verification

Test each endpoint directly:

```bash
# Health check
curl http://localhost:8000/api/reading-coach/health

# Get passages
curl http://localhost:8000/api/reading-coach/passages

# Get passages by level
curl http://localhost:8000/api/reading-coach/passages?level=elementary

# Analyze pronunciation (requires auth token in production)
curl -X POST http://localhost:8000/api/reading-coach/analyze \
  -H "Content-Type: application/json" \
  -d '{"expectedText":"The cat sat","spokenText":"The cat sat"}'
```

## Performance Checks

- [ ] Page loads in < 3 seconds
- [ ] Speech recognition starts within 1 second
- [ ] Analysis completes within 2 seconds
- [ ] No memory leaks after multiple sessions
- [ ] Smooth animation on recording indicator

## Success Criteria

All of the above must pass for the Reading Coach feature to be considered complete:

1. ✅ All backend tests pass
2. ✅ All frontend tests pass
3. ✅ All manual test steps pass
4. ✅ Works in Chrome/Edge (primary browsers)
5. ✅ Graceful degradation in Safari/Firefox
6. ✅ No console errors
7. ✅ Accessibility standards met

## Known Limitations

1. **Firefox**: No speech recognition support (browser limitation)
2. **Safari**: Requires HTTPS for microphone access
3. **Mobile**: Web Speech API support varies by device/browser

## Troubleshooting

**Microphone not working:**
- Check browser permissions
- Ensure HTTPS or localhost
- Try a different browser (Chrome/Edge recommended)

**Speech not detected:**
- Speak clearly and at normal pace
- Check microphone volume
- Ensure quiet environment

**Errors not displaying:**
- Check browser console for errors
- Verify backend is running
- Check network connection
