import { useState } from 'react'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { DyslexiaCard, DyslexiaHeading } from '@/design-system'
import { useSpellingChecker } from '@/hooks/useSpellingChecker'

export function SpellingPatternsPage() {
  const [text, setText] = useState('')
  const { checkSpelling, getErrorPatterns, result, patterns, isChecking } = useSpellingChecker()

  const handleCheck = async () => {
    if (text.trim()) {
      await checkSpelling(text)
      await getErrorPatterns()
    }
  }

  const getErrorTypeColor = (type: string) => {
    if (type.includes('SWAP')) return 'bg-purple-100 text-purple-800'
    if (type.includes('MISSING')) return 'bg-orange-100 text-orange-800'
    if (type.includes('REVERSAL')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dyslexia-cream">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-dyslexia-calmBlue">
              Spelling Pattern Analyzer
            </h1>
            <p className="text-gray-600 mt-1">
              AI-powered dyslexia error pattern detection
            </p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {/* Text Input */}
          <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <DyslexiaHeading level={2} size="lg" className="mb-4">
              Check Your Spelling
            </DyslexiaHeading>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here to check for spelling patterns..."
              className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-dyslexia-calmBlue focus:outline-none resize-none text-lg mb-4"
            />

            <button
              onClick={handleCheck}
              disabled={!text.trim() || isChecking}
              className="w-full px-8 py-4 bg-dyslexia-calmBlue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isChecking ? 'Analyzing...' : 'Check Spelling Patterns'}
            </button>
          </DyslexiaCard>

          {/* Results */}
          {result && result.errors.length > 0 && (
            <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <DyslexiaHeading level={2} size="lg" className="mb-4">
                Errors Found: {result.errors.length}
              </DyslexiaHeading>

              <div className="space-y-4">
                {result.errors.map((error, index) => (
                  <div key={index} className="p-4 bg-dyslexia-cream rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg line-through text-red-500">
                          {error.original}
                        </span>
                        <span className="text-lg">→</span>
                        <span className="text-lg font-bold text-green-600">
                          {error.correction}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getErrorTypeColor(error.errorType)}`}>
                        {error.errorType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {error.suggestions.length > 1 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">Other suggestions: </span>
                        <span className="text-sm text-gray-700">
                          {error.suggestions.slice(1).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {result.correctedText !== text && (
                <div className="mt-6 p-4 bg-green-50 rounded-xl">
                  <DyslexiaHeading level={3} size="md" className="mb-2">
                    Corrected Text:
                  </DyslexiaHeading>
                  <p className="text-gray-700">{result.correctedText}</p>
                </div>
              )}
            </DyslexiaCard>
          )}

          {/* User Patterns */}
          {patterns && (
            <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6">
              <DyslexiaHeading level={2} size="lg" className="mb-4">
                Your Error Patterns
              </DyslexiaHeading>

              {patterns.commonErrors.length > 0 ? (
                <>
                  <div className="mb-6">
                    <DyslexiaHeading level={3} size="md" className="mb-3">
                      Common Error Types:
                    </DyslexiaHeading>
                    <div className="space-y-2">
                      {patterns.commonErrors.map((error, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-dyslexia-cream rounded-lg">
                          <span className="capitalize">
                            {error.type.replace(/_/g, ' ')}
                          </span>
                          <span className="px-3 py-1 bg-dyslexia-calmBlue text-white rounded-full text-sm">
                            {error.count} times
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {patterns.strugglingPatterns.length > 0 && (
                    <div className="mb-6">
                      <DyslexiaHeading level={3} size="md" className="mb-3">
                        Areas to Work On:
                      </DyslexiaHeading>
                      <div className="flex flex-wrap gap-2">
                        {patterns.strugglingPatterns.map((pattern, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {patterns.recommendedExercises.length > 0 && (
                    <div>
                      <DyslexiaHeading level={3} size="md" className="mb-3">
                        Recommended Exercises:
                      </DyslexiaHeading>
                      <ul className="space-y-2">
                        {patterns.recommendedExercises.map((exercise, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-dyslexia-calmBlue">✓</span>
                            <span>{exercise}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  Start checking your spelling to see your personalized patterns!
                </p>
              )}
            </DyslexiaCard>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
