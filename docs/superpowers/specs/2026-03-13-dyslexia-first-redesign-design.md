# Dyslexia-First Redesign Design Spec

**Date:** 2026-03-13
**Status:** Approved
**Author:** Claude + User

## Overview

Transform NeuroVidya from a generic reading app with minimal dyslexia features into a fully dyslexia-optimized application. Every aspect of the UI/UX will be designed specifically for dyslexic users, with full customization capabilities.

## Problem Statement

The current NeuroVidya application has some dyslexia-friendly features (Lexend font, theme colors, basic spacing controls) but does not differentiate itself from a normal reading application. Users report that the experience is not meaningfully different for dyslexic readers compared to non-dyslexic readers.

## Goals

1. Create a truly dyslexia-first experience across all pages
2. Provide full customization for each user's specific needs
3. Implement research-backed dyslexia design principles
4. Maintain excellent performance and usability

## Requirements

### Functional Requirements

#### FR1: Word Spacing
- Users can adjust spacing between words (0-1em, default 0.5em)
- Applied globally to all text content
- Instant visual feedback

#### FR2: Line-by-Line Reading Focus
- Highlight current line being read
- Dim non-focused lines (adjustable intensity)
- Reading guide follows scroll or click
- Auto-scroll option available

#### FR3: Phonetic/Syllable Chunking
- Split words into syllables using linguistic rules
- Color-code syllables for visual separation
- AI enhancement option for complex words
- Multiple chunking styles: syllables, sounds, or both

#### FR4: Icons + Text Everywhere (Dual Coding)
- Every action has an accompanying icon/emoji
- Visual reinforcement for all navigation items
- Icon library integrated throughout

#### FR5: Audio-First Design
- TTS controls always visible
- Word-by-word reading mode
- Adjustable speech speed (0.5x - 2x)
- Multiple voice options

#### FR6: Full Customization Panel
- All settings adjustable via Settings page
- Quick-access floating toolbar for common toggles
- Presets: Mild, Moderate, Significant dyslexia support
- Settings persist to database and localStorage

### Non-Functional Requirements

#### NFR1: Performance
- All UI updates must be instant (<16ms)
- Phonetic chunking should use fast rules by default
- AI calls only when explicitly requested

#### NFR2: Accessibility
- WCAG 2.1 AA compliance minimum
- Keyboard navigation for all features
- Screen reader compatible

#### NFR3: Maintainability
- Centralized design system
- Clear separation of concerns
- Well-documented components

## Architecture

### Directory Structure

```
src/design-system/
├── DyslexiaProvider.tsx          # Main context provider
├── DyslexiaTheme.ts              # Theme definitions & CSS variables
├── hooks/
│   ├── useDyslexiaSettings.ts    # Access settings anywhere
│   ├── useWordSpacing.ts         # Word spacing logic
│   ├── useLineFocus.ts           # Line-by-line focus
│   └── usePhoneticChunking.ts    # Syllable chunking
├── components/
│   ├── DyslexiaText.tsx          # Enhanced text component
│   ├── DyslexiaButton.tsx        # Large, accessible buttons
│   ├── DyslexiaCard.tsx          # High-contrast cards
│   ├── DyslexiaInput.tsx         # Accessible form inputs
│   ├── ReadingGuide.tsx          # Line-by-line guide
│   └── PhoneticHighlighter.tsx   # Syllable chunking
├── types/
│   └── dyslexia.ts               # Dyslexia-specific types
└── utils/
    ├── syllableRules.ts          # Linguistic rules for chunking
    └── colorGenerator.ts         # Generate syllable colors
```

### Data Flow

```
User changes setting in UI
        ↓
DyslexiaContext updates immediately (UI reflects change instantly)
        ↓
Debounced API call to save to database (500ms delay)
        ↓
If API fails → Revert to previous value + show error
        ↓
Settings also persisted to localStorage (backup/offline)
```

### State Management

- **React Context** (DyslexiaProvider): Global settings, instant UI updates
- **Zustand** (preferenceStore): Persist to API, cache locally
- **CSS Variables**: All settings mapped to CSS vars for instant component updates

## Components

### Core Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| DyslexiaText | All text display | Adjustable spacing, phonetic chunking, syllable highlighting |
| DyslexiaButton | All actions | 60px min touch target, icon + text, high contrast focus |
| DyslexiaCard | Content containers | High contrast borders, generous padding, reduced visual noise |
| DyslexiaInput | Form inputs | Large text, clear labels, real-time validation feedback |
| ReadingGuide | Line-by-line focus | Highlights current line, dims others, follows scroll/click |
| PhoneticHighlighter | Syllable chunking | Rule-based + AI fallback, color-coded syllables |
| TTSControl | Audio-first | Always-visible play/pause, speed control, word-by-word mode |

### Component Replacement Strategy

All existing components will be replaced with design system equivalents:

```tsx
// Before
import { DyslexiaText } from '@/components/common/DyslexiaText'

// After (design system)
import { DyslexiaText } from '@/design-system/components/DyslexiaText'
// Enhanced with spacing, chunking, line-focus hooks built in
```

### Pages to Update

All pages will use the new design system components:
- LandingPage
- LoginPage
- RegisterPage
- DashboardPage
- ReadingWorkspacePage
- AssistantPage
- GamesPage
- ProgressPage
- SettingsPage (new full customization UI)

## Color & Typography System

### Research-Backed Color Palette

```css
/* Backgrounds - Cream is proven best for dyslexia */
--dyslexia-cream: #F7F3E9;        /* Primary background */
--dyslexia-pastelBlue: #E8F4FC;   /* Alternative */
--dyslexia-pastelGreen: #E8F8F0;  /* Alternative */
--dyslexia-lightYellow: #FEF9E7;  /* Alternative */
--dyslexia-dark: #111827;         /* Dark mode */

/* Text Colors - High contrast, low glare */
--dyslexia-textPrimary: #1f2937;   /* Dark gray (softer than black) */
--dyslexia-textSecondary: #4b5563;
--dyslexia-textMuted: #9ca3af;

/* Accent Colors - Calm, focused */
--dyslexia-calmBlue: #3b82f6;     /* Primary actions */
--dyslexia-successGreen: #059669;  /* Success/progress */
--dyslexia-softOrange: #f97316;    /* Warnings */
--dyslexia-focusYellow: #fbbf24;   /* Highlights */

/* Phonetic Chunking Colors */
--syllable-color-1: #DBEAFE;       /* Light blue */
--syllable-color-2: #D1FAE5;       /* Light green */
--syllable-color-3: #FEF3C7;       /* Light yellow */
--syllable-color-4: #EDE9FE;       /* Light purple */
```

### Typography Hierarchy

| Use Case | Font | Size | Letter Spacing | Line Height |
|----------|------|------|----------------|-------------|
| Body text | Lexend | 22px | 0.15em | 1.8 |
| Headings | Lexend Bold | 28-40px | 0.1em | 1.4 |
| Buttons | Lexend Medium | 20px | 0.12em | 1.6 |
| Labels | Lexend | 18px | 0.1em | 1.5 |

## Customization Panel

### Settings Page Structure

```
Settings Page
├── Text Display
│   ├── Font Size slider (16px - 32px, default 22px)
│   ├── Letter Spacing slider (0 - 0.3em, default 0.15em)
│   ├── Word Spacing slider (0 - 1em, default 0.5em)
│   ├── Line Height slider (1.4 - 2.2, default 1.8)
│   └── Font Family dropdown (Lexend, OpenDyslexic, Arial)
│
├── Reading Aids
│   ├── Line-by-Line Focus toggle
│   │   ├── Highlight Color picker
│   │   ├── Dim Other Lines slider
│   │   └── Auto-scroll toggle
│   ├── Phonetic Chunking toggle
│   │   ├── Chunk Style (syllables, sounds, both)
│   │   ├── Color Scheme picker
│   │   └── Use AI for Complex Words toggle
│   └── Word Spacing toggle
│
├── Audio
│   ├── TTS Always Visible toggle
│   ├── Speech Speed slider (0.5x - 2x)
│   ├── Word-by-Word mode toggle
│   └── Voice Selection
│
├── Visual Theme
│   ├── Theme presets (Cream, Pastel Blue, Pastel Green, Light Yellow, Dark)
│   ├── Accent Color picker
│   └── Contrast Level (Normal, High, Very High)
│
└── Presets
    ├── Mild Dyslexia Support
    ├── Moderate Dyslexia Support
    ├── Significant Dyslexia Support
    └── Custom (current settings)
```

### Quick Settings Toolbar

- Small floating button (bottom-right corner)
- Expands to show most-used toggles
- Line focus on/off, word spacing, TTS, theme
- Collapses when not in use

## Phonetic Chunking Implementation

### Two-Tier System

**Tier 1: Linguistic Rules (Default, Fast)**
- Python-style syllable division rules
- Vowel-consonant pattern matching
- No API call required
- Works offline

**Tier 2: AI Enhancement (On-Demand)**
- Uses existing Anthropic/OpenAI integration
- Triggered for complex words or when user enables "AI Chunking"
- Provides more accurate phonetic breakdown
- Results cached for performance

### Color Coding Pattern

Syllables cycle through 4 colors for visual distinction:
1. Light blue (#DBEAFE)
2. Light green (#D1FAE5)
3. Light yellow (#FEF3C7)
4. Light purple (#EDE9FE)

## Backend Changes

### Database Schema Updates

Extend `ReadingPreferences` model:

```prisma
model ReadingPreferences {
  id        String   @id @default(uuid())
  userId    String   @unique
  font      String   @default("Lexend")
  fontSize  Int      @default(22)
  letterSpacing Float @default(0.15)
  wordSpacing Float  @default(0.5)
  lineHeight Float   @default(1.8)
  theme     String   @default("cream")

  // New fields
  lineFocusEnabled    Boolean @default(false)
  lineFocusColor      String  @default("#fbbf24")
  lineDimIntensity    Float   @default(0.3)
  phoneticChunking    Boolean @default(false)
  chunkStyle          String  @default("syllables")
  useAIForChunking    Boolean @default(false)
  ttsAlwaysVisible    Boolean @default(true)
  wordByWordMode      Boolean @default(false)

  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### API Updates

Update `/api/users/preferences` endpoints to handle new fields.

## Implementation Order

1. **Foundation** (Days 1-2)
   - Create design-system directory structure
   - Implement DyslexiaProvider and context
   - Define TypeScript types
   - Set up CSS variables

2. **Core Components** (Days 3-4)
   - DyslexiaText with spacing hooks
   - DyslexiaButton with accessibility
   - DyslexiaCard with high contrast
   - DyslexiaInput with clear labels

3. **Advanced Features** (Days 5-6)
   - ReadingGuide component
   - PhoneticHighlighter with rules
   - TTSControl integration
   - Syllable chunking utilities

4. **Settings UI** (Days 7-8)
   - Full customization panel
   - Quick settings toolbar
   - Preset system
   - Settings persistence

5. **Page Updates** (Days 9-11)
   - Update all 9 pages with new components
   - Replace old DyslexiaText imports
   - Ensure consistent styling

6. **Backend Integration** (Day 12)
   - Update database schema
   - Extend API endpoints
   - Test settings persistence

7. **Testing & Polish** (Days 13-14)
   - Cross-browser testing
   - Accessibility audit
   - Performance optimization
   - Bug fixes

## Success Criteria

- [ ] All pages use dyslexia-optimized components
- [ ] Settings panel allows full customization
- [ ] Line-by-line focus works smoothly
- [ ] Phonetic chunking displays correctly
- [ ] TTS controls are always accessible
- [ ] Icons appear on all actionable items
- [ ] Settings persist to database
- [ ] Performance is acceptable (<16ms UI updates)
- [ ] WCAG 2.1 AA compliance verified

## References

- British Dyslexia Association Style Guide
- W3C Web Accessibility Initiative
- "Dyslexia and Design" by Open University
- Lexend font research documentation
