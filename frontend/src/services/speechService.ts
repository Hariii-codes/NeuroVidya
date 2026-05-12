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
 * Phonics mapping for letter sounds
 * Maps each letter to a word that STARTS with the correct phonics sound
 * The TTS will pronounce the word correctly, and the user hears the beginning sound
 */
const PHONICS_MAP: Record<string, string> = {
  // Vowels - short vowel sounds
  'a': 'ah',
  'e': 'eh',
  'i': 'ih',
  'o': 'ah',
  'u': 'uh',

  // Consonants - proper phonics sounds
  'b': 'buh',
  'c': 'kuh',
  'd': 'duh',
  'f': 'fuh',
  'g': 'guh',
  'h': 'huh',
  'j': 'juh',
  'k': 'kuh',
  'l': 'luh',
  'm': 'muh',
  'n': 'nuh',
  'p': 'puh',
  'q': 'kuh',
  'r': 'ruh',
  's': 'sss',
  't': 'tuh',
  'v': 'vuh',
  'w': 'wuh',
  'x': 'ks',
  'y': 'yuh',
  'z': 'zzz',

  // Uppercase
  'A': 'ah',
  'B': 'buh',
  'C': 'kuh',
  'D': 'duh',
  'E': 'eh',
  'F': 'fuh',
  'G': 'guh',
  'H': 'huh',
  'I': 'ih',
  'J': 'juh',
  'K': 'kuh',
  'L': 'luh',
  'M': 'muh',
  'N': 'nuh',
  'O': 'ah',
  'P': 'puh',
  'Q': 'kuh',
  'R': 'ruh',
  'S': 'sss',
  'T': 'tuh',
  'U': 'uh',
  'V': 'vuh',
  'W': 'wuh',
  'X': 'ks',
  'Y': 'yuh',
  'Z': 'zzz',

  // Digraphs - two-letter phonics combinations
  'ch': 'chuh',
  'sh': 'shh',
  'th': 'thuh',
  'wh': 'wuh',
  'ng': 'ng',
  'ph': 'fuh',
  'ck': 'kuh',
  'll': 'luh',
  'ss': 'sss',
  'tt': 'tuh',
  'ff': 'fuh',
  'pp': 'puh',
  'nn': 'nuh',
  'mm': 'muh',
  'rr': 'ruh',
  'dd': 'duh',
  'bb': 'buh',
  'gg': 'guh',
  'ee': 'ee',
  'oo': 'oo',
  'ea': 'eh',
  'ai': 'ay',
  'ay': 'ay',
  'oi': 'oy',
  'oy': 'oy',
  'ou': 'ow',
  'ow': 'ow',
  'aw': 'ah',
  'au': 'ah',
  'ue': 'oo',
  'ie': 'ee',
  'kn': 'nuh',
  'wr': 'ruh',
  'gn': 'nuh',
  'mb': 'muh',
  'tion': 'shun',
  'sion': 'zhun',

  // Consonant blends - L blends
  'bl': 'buh-luh',
  'cl': 'kuh-luh',
  'fl': 'fuh-luh',
  'gl': 'guh-luh',
  'pl': 'puh-luh',
  'sl': 'sss-luh',

  // Consonant blends - R blends
  'br': 'buh-ruh',
  'cr': 'kuh-ruh',
  'dr': 'duh-ruh',
  'fr': 'fuh-ruh',
  'gr': 'guh-ruh',
  'pr': 'puh-ruh',
  'tr': 'tuh-ruh',

  // Consonant blends - S blends
  'sc': 'sss-kuh',
  'sk': 'sss-kuh',
  'sm': 'sss-muh',
  'sn': 'sss-nuh',
  'sp': 'sss-puh',
  'st': 'sss-tuh',
  'sw': 'sss-wuh',

  // Other blends
  'tw': 'tuh-wuh',
  'dw': 'duh-wuh',
  'qu': 'kuh-wuh'
};

/**
 * Text-to-Speech Service for pronunciation playback
 */
export class TTSService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;

  constructor() {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;

      // Load voices - Chrome loads them asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          this.voices = this.synth!.getVoices();
          this.voicesLoaded = true;
        };
      }

      // Try loading immediately for browsers that don't need onvoiceschanged
      this.voices = this.synth.getVoices();
      if (this.voices.length > 0) {
        this.voicesLoaded = true;
      }
    }
  }

  /**
   * Check if TTS is supported
   */
  isSupported(): boolean {
    return this.synth !== null;
  }

  /**
   * Get the best voice for pronunciation learning
   */
  private getBestVoice(): SpeechSynthesisVoice | undefined {
    if (!this.voicesLoaded || this.voices.length === 0) {
      this.voices = this.synth?.getVoices() || [];
    }

    // Priority order for voice selection
    const priorities = [
      // Google voices are usually clearest
      (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.includes('en-US'),
      (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.includes('en'),
      // Microsoft voices are also good
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.lang.includes('en-US'),
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.lang.includes('en'),
      // Any English US voice
      (v: SpeechSynthesisVoice) => v.lang.includes('en-US'),
      (v: SpeechSynthesisVoice) => v.lang.includes('en-GB'),
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
      // Fallback to any voice
      () => true,
    ];

    for (const priority of priorities) {
      const voice = this.voices.find(priority);
      if (voice) return voice;
    }

    return this.voices[0];
  }

  /**
   * Speak a word with enhanced pronunciation
   * @param word - The word or phrase to speak
   * @param rate - Speech rate (0.1 to 1.0, default 0.5 for learning)
   * @param slowMode - Enable slow mode with pauses between syllables
   */
  speak(word: string, rate: number = 0.5, slowMode: boolean = false): void {
    if (!this.synth) {
      console.error('TTS not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(word);

    // Slower rate for learning (default 0.5 instead of 0.8)
    utterance.rate = rate;

    // Slightly higher pitch for clarity
    utterance.pitch = 1.1;

    // English language
    utterance.lang = 'en-US';

    // Select the best available voice
    const bestVoice = this.getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
      console.log('Using voice:', bestVoice.name, bestVoice.lang);
    }

    // Add pauses for slow mode (between words)
    if (slowMode && word.includes(' ')) {
      utterance.rate = rate * 0.8; // Even slower for phrases
    }

    this.synth.speak(utterance);
  }

  /**
   * Speak a word with syllable-by-syllable breakdown
   */
  speakSyllables(syllables: string[]): void {
    if (!this.synth || syllables.length === 0) {
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    // Speak each syllable with a pause
    let index = 0;
    const speakNext = () => {
      if (index >= syllables.length) {
        return;
      }

      const syllable = syllables[index];

      // Check if this syllable is a single letter OR a two-letter phonics combo - use phonics
      if (/^[A-Za-z]$/.test(syllable) || PHONICS_MAP[syllable]) {
        this.speakLetterPhonics(syllable);
        // Move to next syllable after phonics plays (estimated time)
        index++;
        setTimeout(speakNext, 600);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(syllable);
      utterance.rate = 0.4; // Very slow for syllables
      utterance.pitch = 1.1;
      utterance.lang = 'en-US';

      const bestVoice = this.getBestVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onend = () => {
        index++;
        // Small pause between syllables
        setTimeout(speakNext, 300);
      };

      this.synth!.speak(utterance);
    };

    speakNext();
  }

  /**
   * Speak a letter using phonics pronunciation
   * Instead of spelling (e.g., "ay" for A), uses phonics sound (e.g., "ah" for A)
   * @param letter - Single letter or digraph to pronounce phonetically
   */
  speakLetterPhonics(letter: string): void {
    if (!this.synth) {
      console.error('TTS not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    // Get phonics sound for the letter
    const phonicsSound = PHONICS_MAP[letter] || letter;

    console.log(`Speaking letter "${letter}" with phonics: "${phonicsSound}"`);

    const utterance = new SpeechSynthesisUtterance(phonicsSound);
    utterance.rate = 0.5; // Slow for learning
    utterance.pitch = 1.1;
    utterance.lang = 'en-US';

    const bestVoice = this.getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    this.synth.speak(utterance);
  }

  /**
   * Check if a text is a single letter
   */
  isSingleLetter(text: string): boolean {
    return /^[A-Za-z]$/.test(text);
  }

  /**
   * Speak with automatic phonics detection for single letters
   * @param text - Text to speak (letter or word)
   * @param rate - Speech rate (default 0.5)
   * @param usePhonics - Force phonics mode (default auto-detect for single letters)
   */
  speakAuto(text: string, rate: number = 0.5, usePhonics: boolean = true): void {
    // If it's a single letter and phonics is enabled, use phonics
    if (usePhonics && this.isSingleLetter(text)) {
      this.speakLetterPhonics(text);
    } else {
      this.speak(text, rate);
    }
  }

  /**
   * Stop speaking
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Get available voices (for debugging/settings)
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.voicesLoaded || this.voices.length === 0) {
      this.voices = this.synth?.getVoices() || [];
    }
    return this.voices;
  }
}

// Singleton instance
export const ttsService = new TTSService();
