# NeuroVidya Dyslexia-First Redesign - Task Tracking

**Created:** 2026-03-14
**Last Updated:** 2026-03-14 (Sessions 1-3 Complete)
**Design Spec:** `docs/superpowers/specs/2026-03-13-dyslexia-first-redesign-design.md`

---

## Overview

Transform NeuroVidya from a generic reading app into a **fully dyslexia-optimized application** with complete customization capabilities for dyslexic users.

**User Requirements:**
- Full customization (Option A)
- All pages redesigned (Option A)
- Phonetic chunking with rules + AI (Option C)
- Research-backed color palette (Option A)
- Global design system approach (Option B)

---

## What Was Assigned

### Core Features to Implement

| Feature | Description | Status |
|---------|-------------|--------|
| **Word Spacing** | Adjustable space between words (0-1em, default 0.5em) | ✅ Done (useWordSpacing hook) |
| **Line-by-Line Focus** | Highlight current line, dim others, reading guide | ✅ Done (ReadingGuide + useLineFocus) |
| **Phonetic/Syllable Chunking** | Split words into syllables, color-code, AI enhancement | ✅ Done (PhoneticHighlighter + rules) |
| **Icons + Text Everywhere** | Dual coding - every action has visual icon | ⏳ Pending (during page updates) |
| **Audio-First Design** | TTS always visible, word-by-word mode | ⏳ Pending (TTSControl update) |
| **Full Customization Panel** | Settings page with all controls + quick toolbar | ⏳ Pending (Phase 4) |

### Pages to Redesign (9 total)

- [ ] LandingPage
- [ ] LoginPage
- [ ] RegisterPage
- [ ] DashboardPage
- [ ] ReadingWorkspacePage
- [ ] AssistantPage
- [ ] GamesPage
- [ ] ProgressPage
- [ ] SettingsPage (complete redesign)

---

## What Was Completed

### Phase 0: Design & Planning ✅

| Task | Date | Status |
|------|------|--------|
| User requirements gathering | 2026-03-13 | ✅ Done |
| Design approach selection | 2026-03-13 | ✅ Done |
| Component architecture design | 2026-03-13 | ✅ Done |
| Color & typography system design | 2026-03-13 | ✅ Done |
| Data flow & state management design | 2026-03-13 | ✅ Done |
| Customization panel structure | 2026-03-13 | ✅ Done |
| **Design spec document created** | 2026-03-13 | ✅ Done |

**Design Deliverables:**
- Complete design spec at `docs/superpowers/specs/2026-03-13-dyslexia-first-redesign-design.md`
- Approved architecture with DyslexiaProvider + design system approach
- Research-backed color palette defined
- Typography hierarchy established
- Component replacement strategy defined

### Phase 1: Foundation (Design System) ✅

| Task | File(s) | Status |
|------|---------|--------|
| Create design-system directory structure | `frontend/src/design-system/` | ✅ Done |
| Create TypeScript types | `types/dyslexia.ts` | ✅ Done |
| Implement DyslexiaTheme with CSS variables | `DyslexiaTheme.ts` | ✅ Done |
| Implement DyslexiaProvider context | `DyslexiaProvider.tsx` | ✅ Done |
| Create useDyslexiaSettings hook | Built into DyslexiaProvider | ✅ Done |
| Update App.tsx to wrap with provider | `App.tsx` | ✅ Done |
| Create main index export file | `index.ts` | ✅ Done |

### Phase 2: Core Components ✅

| Task | Component | Status |
|------|-----------|--------|
| Enhanced text with spacing | `DyslexiaText.tsx` + CSS | ✅ Done |
| Large accessible buttons | `DyslexiaButton.tsx` + CSS | ✅ Done |
| High-contrast cards | `DyslexiaCard.tsx` + CSS | ✅ Done |
| Accessible form inputs | `DyslexiaInput.tsx` + CSS | ✅ Done |

### Phase 3: Advanced Features ✅

| Task | Component | Status |
|------|-----------|--------|
| Word spacing logic hook | `hooks/useWordSpacing.ts` | ✅ Done |
| Line-by-line focus component | `ReadingGuide.tsx` + CSS | ✅ Done |
| Line focus hook | `hooks/useLineFocus.ts` | ✅ Done |
| Syllable chunking rules utility | `utils/syllableRules.ts` | ✅ Done |
| Color generator utility | `utils/colorGenerator.ts` | ✅ Done |
| Phonetic highlighter component | `PhoneticHighlighter.tsx` + CSS | ✅ Done |
| Phonetic chunking hook | `hooks/usePhoneticChunking.ts` | ✅ Done |
| TTS control component (enhanced) | Uses existing, needs update | ⏳ Pending |

**Total Progress: 21/47 tasks complete (45%)**

---

## What Is Left To Do

### Phase 1: Foundation (Design System) ✅ COMPLETE

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1.1 | Create design-system directory structure | `frontend/src/design-system/` | ✅ Done |
| 1.2 | Create TypeScript types | `types/dyslexia.ts` | ✅ Done |
| 1.3 | Implement DyslexiaTheme with CSS variables | `DyslexiaTheme.ts` | ✅ Done |
| 1.4 | Implement DyslexiaProvider context | `DyslexiaProvider.tsx` | ✅ Done |
| 1.5 | Create useDyslexiaSettings hook | Built into DyslexiaProvider | ✅ Done |
| 1.6 | Update App.tsx to wrap with provider | `App.tsx` | ✅ Done |

### Phase 2: Core Components ✅ COMPLETE

| # | Task | Component | Status |
|---|------|-----------|--------|
| 2.1 | Enhanced text with spacing | `DyslexiaText.tsx` + CSS | ✅ Done |
| 2.2 | Large accessible buttons | `DyslexiaButton.tsx` + CSS | ✅ Done |
| 2.3 | High-contrast cards | `DyslexiaCard.tsx` + CSS | ✅ Done |
| 2.4 | Accessible form inputs | `DyslexiaInput.tsx` + CSS | ✅ Done |

### Phase 3: Advanced Features ✅ COMPLETE

| # | Task | Component | Status |
|---|------|-----------|--------|
| 3.1 | Word spacing logic hook | `hooks/useWordSpacing.ts` | ✅ Done |
| 3.2 | Line-by-line focus component | `ReadingGuide.tsx` + CSS | ✅ Done |
| 3.3 | Line focus hook | `hooks/useLineFocus.ts` | ✅ Done |
| 3.4 | Syllable chunking rules utility | `utils/syllableRules.ts` | ✅ Done |
| 3.5 | Color generator utility | `utils/colorGenerator.ts` | ✅ Done |
| 3.6 | Phonetic highlighter component | `PhoneticHighlighter.tsx` + CSS | ✅ Done |
| 3.7 | Phonetic chunking hook | `hooks/usePhoneticChunking.ts` | ✅ Done |
| 3.8 | TTS control component (enhanced) | Will use existing TTSControl | ⏳ Pending |

### Phase 4: Settings & Customization (NEXT UP)

| # | Task | Description | Status |
|---|------|-------------|--------|
| 4.1 | Settings page redesign | Full customization panel UI | Not Started |
| 4.2 | Text display settings | Font size, letter/word spacing, line height controls | Not Started |
| 4.3 | Reading aids settings | Line focus, phonetic chunking toggles | Not Started |
| 4.4 | Audio settings | TTS controls, speech speed, voice selection | Not Started |
| 4.5 | Visual theme settings | Theme presets, accent colors, contrast levels | Not Started |
| 4.6 | Preset system | Mild/Moderate/Significant support presets | Not Started |
| 4.7 | Quick settings toolbar | Floating button with common toggles | Not Started |
| 4.8 | Settings persistence | API integration + localStorage backup | Not Started |

### Phase 5: Page Updates

| # | Page | Components to Replace | Status |
|---|------|---------------------|--------|
| 5.1 | LandingPage | Hero, features, CTA sections | Not Started |
| 5.2 | LoginPage | Form, inputs, buttons | Not Started |
| 5.3 | RegisterPage | Form, inputs, buttons | Not Started |
| 5.4 | DashboardPage | Cards, progress displays, navigation | Not Started |
| 5.5 | ReadingWorkspacePage | Reading guide, text display, TTS | Not Started |
| 5.6 | AssistantPage | Chat interface, input areas | Not Started |
| 5.7 | GamesPage | Game cards, instructions | Not Started |
| 5.8 | ProgressPage | Charts, stats displays | Not Started |
| 5.9 | SettingsPage | Complete redesign (see Phase 4) | Not Started |

### Phase 6: Backend Integration

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 6.1 | Update ReadingPreferences schema | `backend/app/models/models.py` | Not Started |
| 6.2 | Update Pydantic schemas | `backend/app/schemas/auth.py` | Not Started |
| 6.3 | Update preferences endpoints | `backend/app/api/routes/*.py` | Not Started |
| 6.4 | Test settings persistence | API + database | Not Started |

### Phase 7: Testing & Polish

| # | Task | Description | Status |
|---|------|-------------|--------|
| 7.1 | Cross-browser testing | Chrome, Firefox, Safari, Edge | Not Started |
| 7.2 | Accessibility audit | WCAG 2.1 AA compliance check | Not Started |
| 7.3 | Performance testing | Ensure <16ms UI updates | Not Started |
| 7.4 | Dyslexia user testing | Real user feedback | Not Started |
| 7.5 | Bug fixes | Address found issues | Not Started |

---

## Files to Create (Total: ~20 files)

```
frontend/src/design-system/
├── DyslexiaProvider.tsx          # Context provider
├── DyslexiaTheme.ts              # CSS variables & themes
├── hooks/
│   ├── useDyslexiaSettings.ts
│   ├── useWordSpacing.ts
│   ├── useLineFocus.ts
│   └── usePhoneticChunking.ts
├── components/
│   ├── DyslexiaText.tsx
│   ├── DyslexiaButton.tsx
│   ├── DyslexiaCard.tsx
│   ├── DyslexiaInput.tsx
│   ├── ReadingGuide.tsx
│   └── PhoneticHighlighter.tsx
├── types/
│   └── dyslexia.ts
└── utils/
    ├── syllableRules.ts
    └── colorGenerator.ts
```

## Files to Modify (Total: ~15 files)

**Frontend:**
- `App.tsx` - Wrap with DyslexiaProvider
- All 9 page files - Use new components
- `stores/preferenceStore.ts` - Merge dyslexia settings

**Backend:**
- `app/models/models.py` - Update schema
- `app/schemas/auth.py` - Update Pydantic models
- API route files for preferences

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **Total Tasks** | 47 |
| **Completed** | 21 (Phases 0-3) |
| **Remaining** | 26 (Phases 4-7) |
| **New Files Created** | 20 |
| **Files Modified** | 1 (App.tsx) |
| **Progress** | 45% complete |

---

## Design System Files Created ✅

```
frontend/src/design-system/
├── index.ts                       ✅ Main export file
├── DyslexiaProvider.tsx           ✅ Context + hooks
├── DyslexiaTheme.ts               ✅ CSS variables + themes
├── hooks/
│   ├── useWordSpacing.ts          ✅ Word spacing logic
│   ├── useLineFocus.ts            ✅ Line-by-line focus
│   └── usePhoneticChunking.ts     ✅ Syllable chunking
├── components/
│   ├── DyslexiaText.tsx           ✅ + CSS
│   ├── DyslexiaButton.tsx         ✅ + CSS
│   ├── DyslexiaCard.tsx           ✅ + CSS
│   ├── DyslexiaInput.tsx          ✅ + CSS
│   ├── ReadingGuide.tsx           ✅ + CSS
│   └── PhoneticHighlighter.tsx    ✅ + CSS
├── types/
│   └── dyslexia.ts                ✅ All types
└── utils/
    ├── syllableRules.ts           ✅ Linguistic rules
    └── colorGenerator.ts          ✅ Color utilities
```

---

## Next Steps

**Current Status:** Phases 0-3 Complete (Design System Foundation + Core Components)

**Next:** Phase 4 - Settings & Customization Panel

- Create full customization UI with all dyslexia settings
- Build quick settings floating toolbar
- Implement preset system (Mild/Moderate/Significant)

**To continue:** Say "Start Phase 4" or tell me which page you'd like to update first with the new design system components.

---

*Last updated: 2026-03-14*
