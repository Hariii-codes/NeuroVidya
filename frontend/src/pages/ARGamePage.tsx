/**
 * ARGamePage
 *
 * Main page for the AR Reading Game feature.
 * Includes 2D fallback for devices without WebXR support.
 */

import React, { useEffect, useState } from 'react';
import { useARGameStore } from '../stores/arGameStore';

export const ARGamePage: React.FC = () => {
  const {
    currentLevel,
    gameType,
    score,
    streak,
    levelData,
    isPlaying,
    isLoadingLevel,
    isCorrect,
    errorMessage,
    arSupported,
    startGame,
    submitAnswer,
    nextLevel,
    resetGame,
    checkARSupport
  } = useARGameStore();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Check AR support on mount
  useEffect(() => {
    checkARSupport();
  }, [checkARSupport]);

  const handleStartGame = async (type: 'letter' | 'word' | 'sentence') => {
    await startGame(type);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;

    await submitAnswer(selectedAnswer);
    setSelectedAnswer(null);
  };

  const handleNextLevel = () => {
    nextLevel();
  };

  const handleReset = () => {
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            📱 AR Reading Game
          </h1>
          <p className="text-lg text-gray-600">
            Catch the letters and words in augmented reality!
          </p>
        </div>

        {/* Game Info */}
        <div className="mb-6 flex justify-center gap-6">
          <div className="bg-white rounded-lg px-6 py-3 shadow">
            <span className="text-sm text-gray-500">Level</span>
            <span className="text-2xl font-bold text-blue-600 ml-2">{currentLevel}</span>
          </div>
          <div className="bg-white rounded-lg px-6 py-3 shadow">
            <span className="text-sm text-gray-500">Score</span>
            <span className="text-2xl font-bold text-green-600 ml-2">{score}</span>
          </div>
          {streak > 1 && (
            <div className="bg-white rounded-lg px-6 py-3 shadow">
              <span className="text-sm text-gray-500">Streak</span>
              <span className="text-2xl font-bold text-orange-600 ml-2">{streak}🔥</span>
            </div>
          )}
        </div>

        {/* Game Type Selection */}
        {!levelData && !isLoadingLevel && !isPlaying && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Game</h2>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Letter Game */}
              <button
                onClick={() => handleStartGame('letter')}
                className="p-8 bg-gradient-to-br from-red-100 to-red-200 rounded-xl border-4 border-red-300 hover:border-red-500 transition-all hover:scale-105"
              >
                <div className="text-6xl mb-4">🔤</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Letter Catch</h3>
                <p className="text-sm text-gray-600">
                  Find letters in space! Great for b/d/p/q confusion.
                </p>
              </button>

              {/* Word Game */}
              <button
                onClick={() => handleStartGame('word')}
                className="p-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl border-4 border-blue-300 hover:border-blue-500 transition-all hover:scale-105"
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Word Builder</h3>
                <p className="text-sm text-gray-600">
                  Spell words by tapping letters in order.
                </p>
              </button>

              {/* Sentence Game */}
              <button
                onClick={() => handleStartGame('sentence')}
                className="p-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl border-4 border-purple-300 hover:border-purple-500 transition-all hover:scale-105"
              >
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Word Finder</h3>
                <p className="text-sm text-gray-600">
                  Find the right word floating in space.
                </p>
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>📱 AR Mode:</strong> If your device supports AR, you'll see floating letters in 3D space!
                Otherwise, enjoy the 2D interactive mode.
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoadingLevel && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading level...</p>
          </div>
        )}

        {/* Game Area */}
        {levelData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Prompt */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {levelData.prompt}
              </h2>

              {/* Options Grid */}
              <div className="grid gap-4 grid-cols-4 md:grid-cols-6">
                {levelData.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      if (!isPlaying) return;
                      setSelectedAnswer(option);
                      handleSubmitAnswer();
                    }}
                    disabled={!isPlaying || selectedAnswer !== null}
                    className={`p-6 text-5xl font-bold rounded-xl border-4 transition-all ${
                      !isPlaying
                        ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                        : selectedAnswer === option
                        ? isCorrect
                          ? 'bg-green-500 text-white border-green-600 scale-110'
                          : 'bg-red-500 text-white border-red-600'
                        : isCorrect !== null && !isCorrect
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 hover:border-blue-500 hover:scale-110'
                    }`}
                  >
                    {option.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Feedback */}
              {isCorrect !== null && (
                <div className="mt-8 text-center">
                  {isCorrect ? (
                    <div className="inline-block p-6 bg-green-100 rounded-xl border-4 border-green-500">
                      <div className="text-6xl mb-2">✅</div>
                      <h3 className="text-2xl font-bold text-green-800">Correct!</h3>
                      <p className="text-green-700">+{levelData.points} points</p>
                      <button
                        onClick={handleNextLevel}
                        className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                      >
                        Next Level →
                      </button>
                    </div>
                  ) : (
                    <div className="inline-block p-6 bg-red-100 rounded-xl border-4 border-red-500">
                      <div className="text-6xl mb-2">❌</div>
                      <h3 className="text-2xl font-bold text-red-800">Not quite!</h3>
                      <p className="text-red-700">The answer was: {levelData.target.toUpperCase()}</p>
                      <button
                        onClick={handleNextLevel}
                        className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Reset Button */}
        {isPlaying && (
          <div className="mt-6 text-center">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
            >
              Reset Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
