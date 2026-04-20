/**
 * StorySummariserPage
 *
 * Main page for the Story Summariser feature.
 * Displays comic panels with navigation and audio controls.
 */

import React from 'react';
import { StoryInput } from '../components/story-summariser/StoryInput';
import { ComicPanel } from '../components/story-summariser/ComicPanel';
import { useStorySummariserStore } from '../stores/storySummariserStore';

export const StorySummariserPage: React.FC = () => {
  const {
    currentSummary,
    currentPanelIndex,
    nextPanel,
    previousPanel,
    goToPanel,
    playNarration
  } = useStorySummariserStore();

  const hasSummary = currentSummary && currentSummary.panels.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            📚 AI Story Summariser
          </h1>
          <p className="text-lg text-gray-600">
            Transform any text into an illustrated 5-panel comic with audio narration
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Input */}
          <div className="lg:col-span-1">
            <StoryInput />
          </div>

          {/* Right Column - Comic Panels */}
          <div className="lg:col-span-2">
            {hasSummary ? (
              <>
                {/* Story Title */}
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {currentSummary.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {currentSummary.panelCount} panels • {currentSummary.level} level • {currentSummary.originalLength} words
                  </p>
                </div>

                {/* Panel Navigation */}
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={previousPanel}
                    disabled={currentPanelIndex === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010-1.414l-5 5a1 1 0 01-1.414 0l5-5a1 1 0 011.414 0l5 5z" clipRule="evenodd" />
                    </svg>
                    Previous
                  </button>

                  {/* Panel Indicators */}
                  <div className="flex gap-2">
                    {currentSummary.panels.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToPanel(index)}
                        className={`w-10 h-10 rounded-full font-bold transition-all ${
                          index === currentPanelIndex
                            ? 'bg-blue-500 text-white scale-110'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={nextPanel}
                    disabled={currentPanelIndex === currentSummary.panels.length - 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 0l-5-5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Current Panel */}
                <ComicPanel
                  panel={currentSummary.panels[currentPanelIndex]}
                  panelNumber={currentPanelIndex + 1}
                  isActive={true}
                  onPlayNarration={(panelIndex, onStart, onEnd) => playNarration(panelIndex, onStart, onEnd)}
                />

                {/* Story Info */}
                <div className="mt-6 p-4 bg-white rounded-lg shadow text-center">
                  <h3 className="font-bold text-lg mb-2">About This Feature</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    The Story Summariser helps students understand complex texts by breaking them into
                    visual, easy-to-digest comic panels with audio narration.
                  </p>
                  <ul className="text-sm text-gray-600 text-left list-disc list-inside space-y-1">
                    <li>📖 Visual learners see illustrations</li>
                    <li>🔊 Audio learners can hear narrations</li>
                    <li>🧠 Reduced reading anxiety</li>
                    <li>✨ Pre-reading preparation</li>
                  </ul>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    No Story Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Enter some text on the left to generate your own illustrated comic story!
                  </p>
                  <div className="flex flex-col gap-2 text-left bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700">
                      💡 <strong>Tips:</strong>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Use sample texts for quick testing</li>
                      <li>Paste articles, stories, or any text</li>
                      <li>Choose the right reading level</li>
                      <li>Click "Generate" to create your comic</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
