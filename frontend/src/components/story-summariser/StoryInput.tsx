/**
 * StoryInput Component
 *
 * Input area for text/URL and generation controls.
 */

import React, { useState } from 'react';
import { useStorySummariserStore } from '../../stores/storySummariserStore';

export const StoryInput: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [readingLevel, setReadingLevel] = useState('elementary');

  const {
    generateFromText,
    isGenerating,
    errorMessage,
    resetSummary
  } = useStorySummariserStore();

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      return;
    }

    await generateFromText(inputText, inputTitle || undefined, readingLevel);
  };

  const handleClear = () => {
    setInputText('');
    setInputTitle('');
    resetSummary();
  };

  // Sample texts for quick testing
  const sampleTexts = {
    elementary: `The sun heats the water. Water evaporates and rises to form clouds. Rain falls from the clouds. Water collects in rivers and oceans. This is called the water cycle.`,

    middle: `Photosynthesis is how plants make food. Plants use sunlight, water, and air. The leaves catch sunlight. The roots drink water. Plants turn these into sugar and oxygen.`,

    high: `The water cycle is a continuous process. Solar energy causes evaporation from surface water. Water vapor condenses into clouds. Precipitation returns water to Earth, completing the cycle.`
  };

  const loadSample = (level: string) => {
    setInputText(sampleTexts[level as keyof typeof sampleTexts]);
    setInputTitle(`${level.charAt(0).toUpperCase() + level.slice(1)} Level Sample`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📖 Story Summariser</h2>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> Paste any text below and click "Generate Comic Summary".
          The AI will create a 5-panel comic with illustrations and narration!
        </p>
      </div>

      {/* Sample Texts */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Samples:
        </label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => loadSample('elementary')}
            className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors"
          >
            Elementary
          </button>
          <button
            onClick={() => loadSample('middle')}
            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
          >
            Middle
          </button>
          <button
            onClick={() => loadSample('high')}
            className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition-colors"
          >
            High
          </button>
        </div>
      </div>

      {/* Title Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Story Title (Optional):
        </label>
        <input
          type="text"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          placeholder="My Story"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isGenerating}
        />
      </div>

      {/* Text Area */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Story Text:
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your story text here..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-lexend resize-none"
          disabled={isGenerating}
        />
        <p className="text-xs text-gray-500 mt-1">
          {inputText.length} / 5000 characters
        </p>
      </div>

      {/* Reading Level Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reading Level:
        </label>
        <select
          value={readingLevel}
          onChange={(e) => setReadingLevel(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isGenerating}
        >
          <option value="elementary">Elementary (Grades 1-3)</option>
          <option value="middle">Middle (Grades 4-6)</option>
          <option value="high">High (Grades 7-12)</option>
        </select>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={!inputText.trim() || isGenerating}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            !inputText.trim() || isGenerating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 018 0v10a8 8 0 01-8 8v-2a8 8 0 00-8-8zm0 18a8 8 0 01-8-8V2a8 8 0 018 0v10a8 8 0 01-8 8v-2z" />
              </svg>
              Generate Comic Summary
            </>
          )}
        </button>

        {(inputText || isGenerating) && (
          <button
            onClick={handleClear}
            disabled={isGenerating}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
