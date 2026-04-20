# NeuroVidya - Dyslexia-First Learning Platform

## Overview

NeuroVidya is a fully dyslexia-optimized learning platform designed from the ground up to support users with dyslexia. The platform features customizable text display, phonetic chunking, reading guides, and AI-powered assistance tools.

## Features

### 🎨 Dyslexia-First Design System
- **Research-backed color palette** optimized for reduced visual stress
- **22px base font size** with adjustable typography (16px-32px)
- **1.8 line-height** for improved readability
- **Dyslexia-friendly fonts** including OpenDyslexic
- **High contrast ratios** meeting WCAG AA standards

### 📖 Reading Aids
- **Phonetic chunking** - Color-coded syllable highlighting
- **Reading guide** - Focus on current line while reading
- **Word spacing** - Adjustable space between words
- **Line focus mode** - Highlight current reading line
- **TTS (Text-to-Speech)** - Listen to any text content

### 🎮 Gamified Learning
- **Word analysis games** - Learn word structure and pronunciation
- **Spelling patterns** - Visual spelling practice
- **Visual learning diagrams** - AI-generated concept maps
- **Progress tracking** - Track learning journey

### 🎤 Reading Coach
A voice-based AI tutor that listens to students read aloud and provides pronunciation feedback.
- **Real-time speech recognition** using Web Speech API
- **Pronunciation analysis** with Levenshtein distance and phonetic similarity
- **Color-coded feedback** (yellow/close, orange/keep trying, red/try again)
- **Phonetic guides** for difficult words with TTS playback
- **Progress tracking** with accuracy trends over time
- **Browser-native** - no external APIs, complete privacy

**Usage:**
1. Navigate to `/reading-coach`
2. Select a reading passage by level and category
3. Press "Start Reading" and read aloud
4. Press "Stop" when finished
5. Review feedback and practice tricky words

### ⚙️ Customization Presets
- **Mild Support** - For users needing minimal assistance
- **Moderate Support** - For users with moderate dyslexia
- **Significant Support** - Maximum dyslexia-friendly features

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Python 3.8+ (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/neurovidya.git
cd neurovidya

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies (optional - for local development)
cd ../backend
pip install -r requirements.txt
```

### Running the Application

```bash
# Frontend (development)
cd frontend
npm run dev

# Backend (optional - for local development)
cd backend
uvicorn main:app --reload
```

The application will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Project Structure

```
neurovidya/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── design-system/   # Dyslexia design system
│   │   │   ├── components/  # Accessible UI components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── utils/       # Helper functions
│   │   │   └── DyslexiaProvider.tsx
│   │   ├── pages/          # Application pages
│   │   ├── stores/         # State management (Zustand)
│   │   ├── services/       # API services
│   │   └── components/     # Shared components
│   ├── public/             # Static assets
│   └── package.json
└── backend/                # FastAPI backend (optional)
```

## Design System Components

### Core Components
- `DyslexiaButton` - Accessible button with proper touch targets
- `DyslexiaInput` - Form inputs with accessibility features
- `DyslexiaCard` - Content containers with variants
- `DyslexiaText` - Typography component
- `DyslexiaHeading` - Semantic headings

### Advanced Components
- `ReadingGuide` - Line-by-line reading focus
- `PhoneticHighlighter` - Syllable chunking display
- `QuickSettingsToolbar` - Floating settings panel

## Accessibility Features

- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ 60px minimum touch targets
- ✅ Proper ARIA labels and roles
- ✅ Focus indicators
- ✅ High contrast modes

## Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Coverage report
npm run test:coverage
```

**Current Test Status:** 109 passing tests (79%)

## Building for Production

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

The built files in `frontend/dist/` can be deployed to any static hosting service:
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Azure Static Web Apps

## Performance

- **Code splitting** - Lazy-loaded pages reduce initial bundle size
- **Vendor chunks** - Separate bundles for React, charts, etc.
- **Tree shaking** - Unused code eliminated
- **Build size:** ~700 kB (gzipped ~200 kB)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- **British Dyslexia Association** - Design guidelines
- **OpenDyslexic Font** - Open-source dyslexia-friendly font
- **W3C WAI** - Web Accessibility Guidelines

## Support

For support, please open an issue on GitHub or contact support@neurovidya.com

---

**Last Updated:** March 15, 2026
**Version:** 1.0.0
