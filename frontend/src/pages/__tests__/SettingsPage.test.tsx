// frontend/src/pages/__tests__/SettingsPage.test.tsx
import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SettingsPage } from '../SettingsPage'
import { DyslexiaProvider } from '@/design-system/DyslexiaProvider'

// Mock the dyslexia store
const mockSettings = {
  fontFamily: 'Lexend',
  fontSize: 22,
  letterSpacing: 0.15,
  wordSpacing: 0.5,
  lineHeight: 1.8,
  theme: 'cream',
  accentColor: '#2196F3',
  contrastLevel: 'normal' as const,
  lineFocusEnabled: false,
  lineFocusColor: '#4CAF50',
  lineDimIntensity: 0.3,
  lineFocusAutoScroll: false,
  phoneticChunkingEnabled: false,
  chunkStyle: 'syllables' as const,
  useAIForChunking: false,
  ttsAlwaysVisible: false,
  speechSpeed: 1.0,
  wordByWordMode: false,
  voiceSelection: 'default',
  presetLevel: 'custom' as const,
}

vi.mock('@/stores/dyslexiaStore', () => ({
  useDyslexiaStore: () => ({
    settings: mockSettings,
    updateSettings: vi.fn(),
    updatePreset: vi.fn(),
  }),
}))

// Mock the API service
vi.mock('@/services/dyslexiaSettings', () => ({
  dyslexiaSettingsApi: {
    getSettings: vi.fn().mockResolvedValue(mockSettings),
    updateSettings: vi.fn().mockResolvedValue(mockSettings),
  },
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderSettingsPage = () => {
    return render(
      <MemoryRouter>
        <DyslexiaProvider>
          <SettingsPage />
        </DyslexiaProvider>
      </MemoryRouter>
    )
  }

  describe('Rendering', () => {
    test('renders settings page heading', () => {
      renderSettingsPage()
      expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
    })

    test('renders tab navigation', () => {
      renderSettingsPage()

      expect(screen.getByRole('tab', { name: /text display/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /reading aids/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /audio/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /theme/i })).toBeInTheDocument()
    })

    test('renders preset selector', () => {
      renderSettingsPage()
      expect(screen.getByText(/presets/i)).toBeInTheDocument()
    })

    test('renders text display settings tab by default', () => {
      renderSettingsPage()
      expect(screen.getByRole('tab', { name: /text display/i, selected: true })).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    test('switches to reading aids tab when clicked', async () => {
      renderSettingsPage()

      const readingAidsTab = screen.getByRole('tab', { name: /reading aids/i })
      await userEvent.click(readingAidsTab)

      expect(readingAidsTab).toHaveAttribute('aria-selected', 'true')
    })

    test('switches to audio tab when clicked', async () => {
      renderSettingsPage()

      const audioTab = screen.getByRole('tab', { name: /audio/i })
      await userEvent.click(audioTab)

      expect(audioTab).toHaveAttribute('aria-selected', 'true')
    })

    test('switches to theme tab when clicked', async () => {
      renderSettingsPage()

      const themeTab = screen.getByRole('tab', { name: /theme/i })
      await userEvent.click(themeTab)

      expect(themeTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Text Display Settings', () => {
    test('renders font family selector', () => {
      renderSettingsPage()
      expect(screen.getByLabelText(/font/i)).toBeInTheDocument()
    })

    test('renders font size slider', () => {
      renderSettingsPage()
      expect(screen.getByLabelText(/font size/i)).toBeInTheDocument()
    })

    test('renders letter spacing control', () => {
      renderSettingsPage()
      expect(screen.getByLabelText(/letter spacing/i)).toBeInTheDocument()
    })

    test('renders word spacing control', () => {
      renderSettingsPage()
      expect(screen.getByLabelText(/word spacing/i)).toBeInTheDocument()
    })

    test('updates font family when changed', async () => {
      const { useDyslexiaStore } = require('@/stores/dyslexiaStore')
      const mockUpdateSettings = vi.fn()
      useDyslexiaStore.mockReturnValue({
        settings: mockSettings,
        updateSettings: mockUpdateSettings,
        updatePreset: vi.fn(),
      })

      renderSettingsPage()

      const fontSelect = screen.getByLabelText(/font/i)
      await userEvent.selectOptions(fontSelect, 'OpenDyslexic')

      expect(mockUpdateSettings).toHaveBeenCalled()
    })
  })

  describe('Reading Aids Settings', () => {
    test('renders line focus toggle', async () => {
      renderSettingsPage()

      const readingAidsTab = screen.getByRole('tab', { name: /reading aids/i })
      await userEvent.click(readingAidsTab)

      expect(screen.getByLabelText(/line focus/i)).toBeInTheDocument()
    })

    test('renders phonetic chunking toggle', async () => {
      renderSettingsPage()

      const readingAidsTab = screen.getByRole('tab', { name: /reading aids/i })
      await userEvent.click(readingAidsTab)

      expect(screen.getByLabelText(/phonetic chunking/i)).toBeInTheDocument()
    })

    test('toggles line focus when clicked', async () => {
      const { useDyslexiaStore } = require('@/stores/dyslexiaStore')
      const mockUpdateSettings = vi.fn()
      useDyslexiaStore.mockReturnValue({
        settings: mockSettings,
        updateSettings: mockUpdateSettings,
        updatePreset: vi.fn(),
      })

      renderSettingsPage()

      const readingAidsTab = screen.getByRole('tab', { name: /reading aids/i })
      await userEvent.click(readingAidsTab)

      const lineFocusToggle = screen.getByLabelText(/line focus/i)
      await userEvent.click(lineFocusToggle)

      expect(mockUpdateSettings).toHaveBeenCalled()
    })
  })

  describe('Audio Settings', () => {
    test('renders TTS controls', async () => {
      renderSettingsPage()

      const audioTab = screen.getByRole('tab', { name: /audio/i })
      await userEvent.click(audioTab)

      expect(screen.getByLabelText(/speech speed/i)).toBeInTheDocument()
    })

    test('renders word by word mode toggle', async () => {
      renderSettingsPage()

      const audioTab = screen.getByRole('tab', { name: /audio/i })
      await userEvent.click(audioTab)

      expect(screen.getByLabelText(/word by word/i)).toBeInTheDocument()
    })

    test('updates speech speed when slider changes', async () => {
      const { useDyslexiaStore } = require('@/stores/dyslexiaStore')
      const mockUpdateSettings = vi.fn()
      useDyslexiaStore.mockReturnValue({
        settings: mockSettings,
        updateSettings: mockUpdateSettings,
        updatePreset: vi.fn(),
      })

      renderSettingsPage()

      const audioTab = screen.getByRole('tab', { name: /audio/i })
      await userEvent.click(audioTab)

      const speechSpeedSlider = screen.getByLabelText(/speech speed/i)
      await userEvent.type(speechSpeedSlider, '1.5')

      expect(mockUpdateSettings).toHaveBeenCalled()
    })
  })

  describe('Theme Settings', () => {
    test('renders theme selector', async () => {
      renderSettingsPage()

      const themeTab = screen.getByRole('tab', { name: /theme/i })
      await userEvent.click(themeTab)

      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument()
    })

    test('renders accent color picker', async () => {
      renderSettingsPage()

      const themeTab = screen.getByRole('tab', { name: /theme/i })
      await userEvent.click(themeTab)

      expect(screen.getByLabelText(/accent color/i)).toBeInTheDocument()
    })

    test('renders contrast level selector', async () => {
      renderSettingsPage()

      const themeTab = screen.getByRole('tab', { name: /theme/i })
      await userEvent.click(themeTab)

      expect(screen.getByLabelText(/contrast/i)).toBeInTheDocument()
    })
  })

  describe('Preset System', () => {
    test('renders preset buttons', () => {
      renderSettingsPage()

      expect(screen.getByRole('button', { name: /mild/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /moderate/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /significant/i })).toBeInTheDocument()
    })

    test('applies mild preset when clicked', async () => {
      const { useDyslexiaStore } = require('@/stores/dyslexiaStore')
      const mockUpdatePreset = vi.fn()
      useDyslexiaStore.mockReturnValue({
        settings: mockSettings,
        updateSettings: vi.fn(),
        updatePreset: mockUpdatePreset,
      })

      renderSettingsPage()

      const mildPresetButton = screen.getByRole('button', { name: /mild/i })
      await userEvent.click(mildPresetButton)

      expect(mockUpdatePreset).toHaveBeenCalledWith('mild')
    })

    test('applies moderate preset when clicked', async () => {
      const { useDyslexiaStore } = require('@/stores/dyslexiaStore')
      const mockUpdatePreset = vi.fn()
      useDyslexiaStore.mockReturnValue({
        settings: mockSettings,
        updateSettings: vi.fn(),
        updatePreset: mockUpdatePreset,
      })

      renderSettingsPage()

      const moderatePresetButton = screen.getByRole('button', { name: /moderate/i })
      await userEvent.click(moderatePresetButton)

      expect(mockUpdatePreset).toHaveBeenCalledWith('moderate')
    })

    test('applies significant preset when clicked', async () => {
      const { useDyslexiaStore } = require('@/stores/dyslexiaStore')
      const mockUpdatePreset = vi.fn()
      useDyslexiaStore.mockReturnValue({
        settings: mockSettings,
        updateSettings: vi.fn(),
        updatePreset: mockUpdatePreset,
      })

      renderSettingsPage()

      const significantPresetButton = screen.getByRole('button', { name: /significant/i })
      await userEvent.click(significantPresetButton)

      expect(mockUpdatePreset).toHaveBeenCalledWith('significant')
    })
  })

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      renderSettingsPage()

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toBeInTheDocument()
    })

    test('all tabs are keyboard navigable', async () => {
      renderSettingsPage()

      const firstTab = screen.getByRole('tab', { name: /text display/i })
      firstTab.focus()

      expect(firstTab).toHaveFocus()

      await userEvent.keyboard('{ArrowRight}')

      const secondTab = screen.getByRole('tab', { name: /reading aids/i })
      expect(secondTab).toHaveFocus()
    })

    test('all form controls have labels', () => {
      renderSettingsPage()

      const inputs = screen.getAllByRole('textbox', 'slider', 'combobox')
      inputs.forEach((input) => {
        const label = input.closest('label') || document.querySelector(`[for="${input.id}"]`)
        expect(label).toBeInTheDocument()
      })
    })
  })

  describe('Design System Integration', () => {
    test('uses DyslexiaCard for layout', () => {
      renderSettingsPage()

      const card = screen.getByRole('heading', { name: /settings/i }).closest('.dyslexia-card')
      expect(card).toBeInTheDocument()
    })

    test('uses DyslexiaButton components', () => {
      renderSettingsPage()

      const buttons = document.querySelectorAll('.dyslexia-button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('API Integration', () => {
    test('loads settings from API on mount', async () => {
      const { dyslexiaSettingsApi } = require('@/services/dyslexiaSettings')

      renderSettingsPage()

      await waitFor(() => {
        expect(dyslexiaSettingsApi.getSettings).toHaveBeenCalled()
      })
    })

    test('saves settings to API when changed', async () => {
      const { dyslexiaSettingsApi } = require('@/services/dyslexiaSettings')
      const { useDyslexiaStore } = require('@/stores/dyslexiaStore')
      const mockUpdateSettings = vi.fn()
      useDyslexiaStore.mockReturnValue({
        settings: mockSettings,
        updateSettings: mockUpdateSettings,
        updatePreset: vi.fn(),
      })

      renderSettingsPage()

      const fontSelect = screen.getByLabelText(/font/i)
      await userEvent.selectOptions(fontSelect, 'OpenDyslexic')

      await waitFor(() => {
        expect(dyslexiaSettingsApi.updateSettings).toHaveBeenCalled()
      })
    })
  })
})
