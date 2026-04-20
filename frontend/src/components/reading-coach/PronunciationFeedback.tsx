/**
 * PronunciationFeedback Component
 *
 * Displays pronunciation errors with color coding,
 * phonetic guides, and audio playback.
 */

import React, { useState } from 'react';
import { useReadingCoachStore } from '../../stores/readingCoachStore';
import type { PronunciationError } from '../../types/reading-coach';

// Helper to break words into syllables (simplified)
const breakIntoSyllables = (word: string): string[] => {
  // Simple vowel-based syllable breakdown
  const syllables: string[] = [];
  let current = '';

  for (let i = 0; i < word.length; i++) {
    current += word[i];
    // Check if next char is a vowel and we have consonants
    if (i < word.length - 1 && 'aeiou'.includes(word[i + 1].toLowerCase()) && current.length > 0) {
      if (current.length > 0 && !'aeiou'.includes(current[current.length - 1].toLowerCase())) {
        syllables.push(current);
        current = '';
      }
    }
  }
  if (current) syllables.push(current);

  // Fallback: just split in half for short words
  if (syllables.length === 0 && word.length > 3) {
    const mid = Math.ceil(word.length / 2);
    return [word.slice(0, mid), word.slice(mid)];
  }
  if (syllables.length === 0) return [word];

  return syllables;
};

// Generate phonetic pronunciation guide for any word
const generatePhonetic = (word: string): string => {
  // Simple phonetic guide using common patterns
  const phoneticMap: Record<string, string> = {
    'a': 'ay', 'e': 'ee', 'i': 'eye', 'o': 'oh', 'u': 'you',
    'th': 'th', 'sh': 'sh', 'ch': 'ch', 'ph': 'f',
    'tion': 'shun', 'sion': 'zhun', 'cian': 'shun',
    'ight': 'eyeet', 'ough': 'uff', 'ought': 'awt',
    'kn': 'n', 'wr': 'r', 'gn': 'n', 'mb': 'm',
    'ee': 'ee', 'ea': 'ee', 'oo': 'oo', 'ou': 'ow',
    'ai': 'ay', 'ay': 'ay', 'oi': 'oy', 'oy': 'oy',
    'au': 'aw', 'aw': 'aw', 'ew': 'oo', 'ie': 'ee',
    'll': 'l', 'ss': 's', 'tt': 't', 'pp': 'p', 'kk': 'k',
  };

  let phonetic = word.toLowerCase();
  let result = '';

  // Build phonetic representation
  for (let i = 0; i < phonetic.length; i++) {
    let matched = false;

    // Check multi-character patterns first
    for (const [pattern, sound] of Object.entries(phoneticMap)) {
      if (phonetic.substr(i, pattern.length) === pattern) {
        result += sound;
        i += pattern.length - 1;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Single character sounds
      const char = phonetic[i];
      if ('bcdfghjklmnpqrstvwxyz'.includes(char)) {
        result += char;
      } else if ('aeiou'.includes(char)) {
        result += char;
      }
    }

    // Add hyphen between sounds for readability
    if (i < phonetic.length - 1) {
      result += '-';
    }
  }

  return `/${result}/`;
};

export const PronunciationFeedback: React.FC = () => {
  const {
    errors,
    accuracyScore,
    playWord,
    playSyllables,
    isPlaying,
    submitSession,
    isProcessing,
    currentPassage,
    spokenText,
    isRecording
  } = useReadingCoachStore();

  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const handlePlayWord = (word: string) => {
    setPlayingWord(word);
    playWord(word);
    setTimeout(() => setPlayingWord(null), 2000);
  };

  const getErrorColor = (error: PronunciationError): string => {
    if (error.confidence >= 0.7) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    if (error.confidence >= 0.4) return 'text-orange-600 bg-orange-50 border-orange-300';
    return 'text-red-600 bg-red-50 border-red-300';
  };

  const getErrorLabel = (confidence: number): string => {
    if (confidence >= 0.7) return 'Close!';
    if (confidence >= 0.4) return 'Keep trying';
    return 'Try again';
  };

  if (!currentPassage) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Pronunciation Feedback</h2>

      {/* No errors yet */}
      {errors.length === 0 && !accuracyScore && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <p>Read the passage to see feedback</p>
        </div>
      )}

      {/* Error List */}
      {errors.length > 0 && (
        <>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">
              💡 Tap the 🔊 button to hear the correct pronunciation. Practice each word slowly!
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {errors.map((error, index) => {
              const syllables = breakIntoSyllables(error.expected);
              const isCurrentlyPlaying = playingWord === error.expected;

              // Handle different error types
              const isMissed = error.word === '[skipped]' || error.actual === '[missed]';
              const displayWord = isMissed ? '⏭️ [skipped]' : error.word;

              return (
                <div
                  key={index}
                  className={`p-5 border-2 rounded-lg ${getErrorColor(error)} ${isCurrentlyPlaying ? 'ring-4 ring-blue-400' : ''}`}
                >
                  {/* Word Header - You said vs Correct */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* What you said (in red) */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">You said:</span>
                        <span className={`text-3xl font-bold ${isMissed ? 'text-gray-400' : 'text-red-600'}`}>
                          {displayWord}
                        </span>
                      </div>

                      {/* Arrow */}
                      <span className="text-2xl text-gray-400">→</span>

                      {/* Correct word (in green) */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Should be:</span>
                        <span className="text-3xl font-bold text-green-700">{error.expected}</span>
                      </div>

                      {/* Confidence badge */}
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        error.confidence >= 0.7 ? 'bg-yellow-200 text-yellow-800' :
                        error.confidence >= 0.4 ? 'bg-orange-200 text-orange-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {getErrorLabel(error.confidence)}
                      </span>
                    </div>
                  </div>

                  {/* Additional details for non-missed words */}
                  {!isMissed && error.word !== error.expected && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">
                        <span className="font-bold">❌ You said "{error.word}"</span> instead of <span className="font-bold">"{error.expected}"</span>
                      </p>
                    </div>
                  )}

                  {/* Missed word message */}
                  {isMissed && (
                    <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded">
                      <p className="text-sm text-gray-600">
                        <span className="font-bold">⚠️ You missed this word.</span> Listen to the correct pronunciation and practice!
                      </p>
                    </div>
                  )}

                  {/* Phonetic Guide - Generate for all words */}
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      🔊 Phonetically: <span className="font-mono text-blue-700">{error.phoneticGuide || generatePhonetic(error.expected)}</span>
                    </p>
                    <p className="text-xs text-blue-700">
                      Use this sound guide to pronounce correctly
                    </p>
                  </div>

                  {/* Syllable Breakdown */}
                  <div className="mb-3 p-2 bg-white bg-opacity-50 rounded">
                    <p className="text-sm mb-2 font-medium">📖 Break it down:</p>
                    <div className="flex flex-wrap gap-2">
                      {syllables.map((syllable, i) => (
                        <button
                          key={i}
                          className="px-4 py-3 bg-blue-100 text-blue-800 rounded-lg font-bold text-xl cursor-pointer hover:bg-blue-200 transition-colors border-2 border-blue-300 hover:border-blue-500 disabled:opacity-50"
                          onClick={() => playSyllables([syllable])}
                          disabled={isPlaying}
                        >
                          🔊 {syllable}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">👆 Click each syllable to hear it spoken clearly</p>
                  </div>

                  {/* Play Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePlayWord(error.expected)}
                      disabled={isPlaying}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                        isCurrentlyPlaying
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      } disabled:opacity-50`}
                      aria-label={`Play pronunciation for ${error.expected}`}
                    >
                      {isCurrentlyPlaying ? (
                        <>
                          <span className="flex gap-1">
                            <span className="w-1 h-4 bg-white rounded animate-bounce" style={{animationDelay: '0ms'}}></span>
                            <span className="w-1 h-6 bg-white rounded animate-bounce" style={{animationDelay: '150ms'}}></span>
                            <span className="w-1 h-4 bg-white rounded animate-bounce" style={{animationDelay: '300ms'}}></span>
                          </span>
                          Playing...
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Play "{error.expected}"
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handlePlayWord(error.expected + '. ' + error.expected + '. ' + error.expected)}
                      disabled={isPlaying}
                      className="px-4 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-colors disabled:opacity-50"
                      title="Repeat 3 times slowly"
                    >
                      🔁 Repeat
                    </button>
                  </div>

                  {/* Practice Tip */}
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="text-yellow-800">
                      💡 <strong>Tip:</strong> Listen first, then repeat each syllable slowly. Put them together gradually!
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Score Display */}
      {accuracyScore !== undefined && accuracyScore !== null && (
        <div className={`p-6 rounded-lg text-center ${
          accuracyScore >= 90 ? 'bg-green-50' :
          accuracyScore >= 70 ? 'bg-yellow-50' :
          'bg-orange-50'
        }`}>
          <div className="text-4xl font-bold mb-2">
            {accuracyScore.toFixed(1)}%
          </div>
          <p className="text-gray-600">
            {accuracyScore >= 90 ? 'Excellent reading!' :
             accuracyScore >= 70 ? 'Good effort! Keep practicing.' :
             'Keep working on it!'}
          </p>
        </div>
      )}

      {/* Submit Button */}
      {/* Show when: spoken text exists, not recording, and not yet analyzed */}
      {spokenText && !isRecording && accuracyScore === undefined && (
        <div className="mt-6">
          <div className="text-center mb-3">
            <p className="text-gray-600">You said: <span className="font-medium">"{spokenText.substring(0, 100)}{spokenText.length > 100 ? '...' : ''}"</span></p>
          </div>
          <button
            onClick={submitSession}
            disabled={isProcessing}
            className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
          >
            {isProcessing ? '🔄 Analyzing...' : '✅ Check My Reading'}
          </button>
        </div>
      )}

      {/* Show after analysis is complete with errors */}
      {errors.length > 0 && accuracyScore !== undefined && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-blue-800 font-medium mb-2">Reading completed! Try again to improve.</p>
          <button
            onClick={submitSession}
            disabled={isProcessing}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Analyzing...' : 'Analyze Again'}
          </button>
        </div>
      )}
    </div>
  );
};
