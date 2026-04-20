import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { toHaveNoViolations } from 'jest-axe'

// Extend Vitest expect with Testing Library matchers
expect.extend(matchers)

// Extend Vitest expect with jest-axe matchers
expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

// Mock window.getComputedStyle for testing
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn((element) => ({
    getPropertyValue: (prop) => {
      // Return default values for common properties
      const defaults: Record<string, string> = {
        'min-height': '48px',
        'background-color': '#ffffff',
        color: '#000000',
        'font-size': '16px',
        'line-height': '1.5',
        opacity: '1',
        'min-width': '48px',
        'touch-action': 'manipulation',
      }
      return defaults[prop] || ''
    },
  })),
})

// Mock Element.scrollIntoView for ReadingGuide tests
Element.prototype.scrollIntoView = vi.fn()

// Mock HTMLCanvasElement.getContext for jest-axe accessibility testing
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillStyle: '',
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({ data: [] })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: [] })),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  arc: vi.fn(),
  arcTo: vi.fn(),
  ellipse: vi.fn(),
  rect: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  clip: vi.fn(),
  clearRect: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  fillText: vi.fn(),
  strokeText: vi.fn(),
})) as any

// Mock Web Speech API (Speech Synthesis) for TTS tests
class MockSpeechSynthesisUtterance {
  text: string = ''
  rate: number = 1
  pitch: number = 1
  volume: number = 1
  lang: string = 'en-US'
  voice?: SpeechSynthesisVoice
  onend: (() => void) | null = null
  onboundary: (() => void) | null = null
  onerror: ((event: any) => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

const mockSpeak = vi.fn()
const mockCancel = vi.fn()
const mockPause = vi.fn()
const mockResume = vi.fn()

global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as any
global.speechSynthesis = {
  speak: mockSpeak,
  cancel: mockCancel,
  pause: mockPause,
  resume: mockResume,
  getVoices: () => [],
  speaking: false,
  paused: false,
  onvoiceschanged: null,
} as any

// Mock Speech Recognition (for speech-to-text)
const mockSpeechRecognition = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  onresult: null,
  onerror: null,
  onend: null,
}))

global.SpeechRecognition = mockSpeechRecognition as any
global.webkitSpeechRecognition = mockSpeechRecognition as any


