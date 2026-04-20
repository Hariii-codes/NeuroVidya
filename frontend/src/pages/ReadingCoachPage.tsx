/**
 * ReadingCoachPage
 *
 * Main page for the Reading Coach feature.
 * Combines all reading coach components.
 */

import React from 'react';
import { PassageSelector } from '../components/reading-coach/PassageSelector';
import { SpeechRecorder } from '../components/reading-coach/SpeechRecorder';
import { PronunciationFeedback } from '../components/reading-coach/PronunciationFeedback';
import { ProgressChart } from '../components/reading-coach/ProgressChart';
import { useReadingCoachStore } from '../stores/readingCoachStore';

export const ReadingCoachPage: React.FC = () => {
  const { currentPassage, loadHistory } = useReadingCoachStore();

  // Load session history on mount
  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎤 Reading Coach
          </h1>
          <p className="text-lg text-gray-600">
            Practice reading aloud and get instant feedback on your pronunciation.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Passage Selector - shown when no passage selected */}
            {!currentPassage && (
              <PassageSelector />
            )}

            {/* Current Passage Display */}
            {currentPassage && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{currentPassage.title}</h2>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {currentPassage.readingLevel}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                        {currentPassage.wordCount} words
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => useReadingCoachStore.getState().clearCurrentSession()}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Change passage"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-cream-50 p-6 rounded-lg border-2 border-gray-200">
                  <p className="text-xl leading-relaxed text-gray-800 font-lexend">
                    {currentPassage.text}
                  </p>
                </div>
              </div>
            )}

            {/* Speech Recorder */}
            <SpeechRecorder />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pronunciation Feedback */}
            <PronunciationFeedback />

            {/* Progress Chart */}
            <ProgressChart />
          </div>
        </div>

        {/* Instructions */}
        {currentPassage && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Read the passage above aloud clearly</li>
              <li>Press "Start Reading" to begin</li>
              <li>Speak at a normal pace</li>
              <li>Press "Stop" when finished</li>
              <li>Review your feedback and practice tricky words</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
