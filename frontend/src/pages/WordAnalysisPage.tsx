import { useState } from 'react'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { DyslexiaText, DyslexiaCard, DyslexiaHeading } from '@/design-system'
import { useWordDifficulty } from '@/hooks/useWordDifficulty'

export function WordAnalysisPage() {
  const [word, setWord] = useState('')
  const [text, setText] = useState('')
  const { getWordDifficulty, analyzeTextComplexity, wordInfo, textComplexity, isLoading, getDifficultyColor } = useWordDifficulty()

  const handleWordCheck = async () => {
    if (word.trim()) {
      await getWordDifficulty(word)
    }
  }

  const handleTextAnalyze = async () => {
    if (text.trim()) {
      await analyzeTextComplexity(text)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dyslexia-cream">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-dyslexia-calmBlue">
              Word Difficulty Analyzer
            </h1>
            <p className="text-gray-600 mt-1">
              AI-powered word and text complexity analysis
            </p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {/* Single Word Analysis */}
          <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <DyslexiaHeading level={2} size="lg" className="mb-4">
              Check Word Difficulty
            </DyslexiaHeading>

            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Enter a word..."
                className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-dyslexia-calmBlue focus:outline-none text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleWordCheck()}
              />
              <button
                onClick={handleWordCheck}
                disabled={!word.trim() || isLoading}
                className="px-8 py-4 bg-dyslexia-calmBlue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Analyze
              </button>
            </div>

            {wordInfo && (
              <div className="mt-6 p-6 bg-dyslexia-cream rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <DyslexiaHeading level={3} size="xl">
                    {wordInfo.word}
                  </DyslexiaHeading>
                  <span className={`px-4 py-2 rounded-full text-white ${getDifficultyColor(wordInfo.difficultyScore)}`}>
                    Difficulty: {wordInfo.difficultyScore}/10
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Length</div>
                    <DyslexiaText size="xl" className="font-bold">
                      {wordInfo.length}
                    </DyslexiaText>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Syllables</div>
                    <DyslexiaText size="xl" className="font-bold">
                      {wordInfo.syllableCount}
                    </DyslexiaText>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Syllable Breakdown</div>
                    <DyslexiaText size="lg" className="font-medium">
                      {wordInfo.syllables.join(' - ')}
                    </DyslexiaText>
                  </div>
                </div>

                {wordInfo.pronunciation && (
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">Pronunciation</div>
                    <DyslexiaText size="md" className="italic">
                      {wordInfo.pronunciation}
                    </DyslexiaText>
                  </div>
                )}
              </div>
            )}
          </DyslexiaCard>

          {/* Text Complexity Analysis */}
          <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6">
            <DyslexiaHeading level={2} size="lg" className="mb-4">
              Analyze Text Complexity
            </DyslexiaHeading>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here to analyze its complexity..."
              className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-dyslexia-calmBlue focus:outline-none resize-none text-lg mb-4"
            />

            <button
              onClick={handleTextAnalyze}
              disabled={!text.trim() || isLoading}
              className="w-full px-8 py-4 bg-dyslexia-calmBlue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Analyze Text
            </button>

            {textComplexity && (
              <div className="mt-6 p-6 bg-dyslexia-cream rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <DyslexiaHeading level={3} size="xl">
                    Text Analysis Results
                  </DyslexiaHeading>
                  <span className={`px-4 py-2 rounded-full text-white ${getDifficultyColor(textComplexity.overallDifficulty)}`}>
                    Level: {textComplexity.readingLevel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Avg Word Length</div>
                    <DyslexiaText size="xl" className="font-bold">
                      {textComplexity.averageWordLength}
                    </DyslexiaText>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Avg Syllables</div>
                    <DyslexiaText size="xl" className="font-bold">
                      {textComplexity.averageSyllablesPerWord}
                    </DyslexiaText>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Overall Score</div>
                    <DyslexiaText size="xl" className="font-bold">
                      {textComplexity.overallDifficulty}/10
                    </DyslexiaText>
                  </div>
                </div>

                {textComplexity.difficultWords.length > 0 && (
                  <div className="bg-white p-4 rounded-lg">
                    <DyslexiaHeading level={4} size="md" className="mb-3">
                      Difficult Words Found:
                    </DyslexiaHeading>
                    <div className="flex flex-wrap gap-2">
                      {textComplexity.difficultWords.map((w, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-dyslexia-calmBlue text-white rounded-full text-sm"
                        >
                          {w.word} ({w.difficultyScore})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DyslexiaCard>
        </main>
      </div>
    </ProtectedRoute>
  )
}
