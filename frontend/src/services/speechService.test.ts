/**
 * Tests for speech service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock functions
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
const mockGetVoices = vi.fn(() => []);
const mockSpeechRecognition = vi.fn();

// Mock SpeechSynthesisUtterance class
class MockSpeechSynthesisUtterance {
  text: string;
  rate: number = 1;
  pitch: number = 1;
  lang: string = 'en-US';
  voice?: SpeechSynthesisVoice;
  onend: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

// Reset module cache and set up mocks before each test
beforeEach(() => {
  // Set up the mocks
  vi.stubGlobal('SpeechRecognition', mockSpeechRecognition);
  vi.stubGlobal('webkitSpeechRecognition', mockSpeechRecognition);
  vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
  vi.stubGlobal('speechSynthesis', {
    getVoices: mockGetVoices,
    speak: mockSpeak,
    cancel: mockCancel,
    onvoiceschanged: undefined
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Import service after setting up mocks
import { speechService } from './speechService';
import { TTSService } from './speechService';

describe('SpeechService', () => {
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
});

describe('TTSService', () => {
  // Create a new instance for each test to get fresh mocks
  let ttsService: TTSService;

  beforeEach(() => {
    mockSpeak.mockClear();
    mockCancel.mockClear();
    mockGetVoices.mockClear();
    ttsService = new TTSService();
  });

  it('should detect TTS support', () => {
    expect(ttsService.isSupported()).toBe(true);
  });

  it('should speak a word', () => {
    ttsService.speak('hello');
    expect(mockSpeak).toHaveBeenCalled();
  });

  it('should stop ongoing speech', () => {
    ttsService.stop();
    expect(mockCancel).toHaveBeenCalled();
  });
});
