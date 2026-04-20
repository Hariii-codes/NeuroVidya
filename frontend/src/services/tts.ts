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

export interface TTSConfig {
  rate: number       // 0.5 to 2.0
  pitch: number      // 0.5 to 2.0
  volume: number     // 0 to 1
  voice?: string     // Voice URI
}

export interface TTSState {
  isPlaying: boolean
  isPaused: boolean
  currentWord: string
  currentWordIndex: number
  availableVoices: SpeechSynthesisVoice[]
}

export type TTSWordCallback = (index: number, word: string) => void
export type TTSEndCallback = () => void

class DyslexiaTTS {
  private synth: SpeechSynthesis
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private wordIndex: number = 0
  private words: string[] = []

  constructor() {
    this.synth = window.speechSynthesis
    // Load voices (they load asynchronously in some browsers)
    if (this.synth.getVoices().length === 0) {
      this.synth.onvoiceschanged = () => {
        // Voices loaded
      }
    }
  }

  get availableVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices()
  }

  get isSupported(): boolean {
    return 'speechSynthesis' in window
  }

  /**
   * Speak a letter using phonics pronunciation
   * @param letter - Single letter to pronounce phonetically
   */
  speakLetterPhonics(letter: string): void {
    if (!this.isSupported) {
      throw new Error('TTS not supported')
    }

    this.stop()

    // Get phonics sound for the letter
    const phonicsSound = PHONICS_MAP[letter] || letter
    console.log(`[TTS] Speaking letter "${letter}" with phonics: "${phonicsSound}"`)

    const utterance = new SpeechSynthesisUtterance(phonicsSound)
    utterance.rate = 0.5
    utterance.pitch = 1.1
    utterance.volume = 1
    utterance.lang = 'en-US'

    this.currentUtterance = utterance
    this.synth.speak(utterance)
  }

  speak(
    text: string,
    config: TTSConfig,
    onWordHighlight: TTSWordCallback,
    onEnd: TTSEndCallback
  ): void {
    if (!this.isSupported) {
      throw new Error('TTS not supported in this browser')
    }

    this.stop()
    this.words = text.split(/\s+/)
    this.wordIndex = 0

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = config.rate
    utterance.pitch = config.pitch
    utterance.volume = config.volume

    if (config.voice) {
      const voice = this.availableVoices.find(v => v.name === config.voice)
      if (voice) {
        utterance.voice = voice
      }
    }

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const word = this.words[this.wordIndex] || ''
        onWordHighlight(this.wordIndex, word)
        this.wordIndex++
      }
    }

    utterance.onend = () => {
      this.wordIndex = 0
      this.currentUtterance = null
      onEnd()
    }

    utterance.onerror = (event) => {
      console.error('TTS error:', event.error)
      this.currentUtterance = null
      onEnd()
    }

    this.currentUtterance = utterance
    this.synth.speak(utterance)
  }

  pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause()
    }
  }

  resume(): void {
    if (this.synth.paused) {
      this.synth.resume()
    }
  }

  stop(): void {
    if (this.currentUtterance) {
      this.synth.cancel()
      this.currentUtterance = null
      this.wordIndex = 0
    }
  }

  get isPlaying(): boolean {
    return this.synth.speaking && !this.synth.paused
  }

  get isPaused(): boolean {
    return this.synth.paused
  }
}

// Singleton instance
export const ttsService = new DyslexiaTTS()
