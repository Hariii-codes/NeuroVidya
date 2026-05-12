# Changelog

All notable changes to NeuroVidya will be documented in this file.

## [1.0.0] - 2026-03-15

### Added - Complete Dyslexia-First Redesign

#### Design System
- ✅ Full dyslexia-optimized design system
- ✅ DyslexiaProvider with context-based settings
- ✅ Research-backed color palette (cream backgrounds, calm blue accents)
- ✅ Typography system (22px base, 1.8 line-height)
- ✅ OpenDyslexic font integration

#### Core Components
- ✅ DyslexiaButton - 60px touch targets, keyboard accessible
- ✅ DyslexiaInput - WCAG compliant form inputs
- ✅ DyslexiaCard - Accessible content containers
- ✅ DyslexiaText & DyslexiaHeading - Typography components
- ✅ ReadingGuide - Line-by-line reading focus
- ✅ PhoneticHighlighter - Syllable chunking with colors

#### Settings & Customization
- ✅ QuickSettingsToolbar - Floating quick access panel
- ✅ TextDisplaySettings - Font, size, spacing controls
- ✅ ReadingAidsSettings - Line focus, phonetic chunking
- ✅ AudioSettings - TTS controls
- ✅ VisualThemeSettings - Theme and color options
- ✅ PresetSelector - Mild/Moderate/Significant presets

#### Pages Redesigned
- ✅ Landing page with dyslexia-friendly design
- ✅ Login/Register pages
- ✅ Dashboard with progress cards
- ✅ Reading workspace with guides
- ✅ AI assistant integration
- ✅ Games page
- ✅ Progress tracking
- ✅ Settings page

#### Backend Integration
- ✅ API endpoints for settings persistence
- ✅ User profile schema updates
- ✅ Auto-save with debouncing

#### Testing
- ✅ 109 tests passing (79%)
- ✅ Component tests for design system
- ✅ Accessibility tests with jest-axe
- ✅ Page tests for key pages

#### Performance
- ✅ Code splitting with lazy loading
- ✅ Vendor chunks (React, charts, state)
- ✅ Build size ~700 kB (200 kB gzipped)

### Technical Details

#### Dependencies
- React 18.2.0
- Zustand 4.4.7 (state management)
- TanStack Query 5.90.21 (data fetching)
- Vitest 1.6.1 (testing)
- Vite 5.0.8 (build tool)

#### File Structure
```
frontend/src/
├── design-system/        # Dyslexia design system
│   ├── components/       # 20+ accessible components
│   ├── hooks/            # Custom hooks
│   └── utils/            # Helper functions
├── pages/               # Application pages
├── stores/              # Zustand stores
└── services/            # API services
```

### Known Issues
- 29 tests failing (mostly due to mock configuration)
- Minor TypeScript type issues in some hooks
- Some pages still need final polish

### Migration Notes

If upgrading from a previous version:
1. All pages now use DyslexiaProvider wrapper
2. Import components from `@/design-system`
3. Text size/spacing now controlled by user settings
4. Custom hooks available for dyslexia features

---

## [0.2.0] - Previous Version

Basic reading application with standard UI.

### Changed
- Added basic reading workspace
- Simple text analysis
- Basic user authentication

### Known Issues
- Not dyslexia-optimized
- Limited customization
- No accessibility features

---

**For older versions, see git history.**
