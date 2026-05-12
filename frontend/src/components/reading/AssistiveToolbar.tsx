import { DyslexiaText } from '@/components/common/DyslexiaText'
import { useReadingStore } from '@/stores/readingStore'
import { clsx } from 'clsx'

export function AssistiveToolbar() {
  const {
    currentText,
    simplifiedText,
    simplify,
    toggleFocus,
    isFocusMode,
    checkSpelling,
    spellCorrections,
    isCheckingSpelling,
    showSpellCorrections,
    toggleSpellCorrections,
  } = useReadingStore()

  const handleSimplify = async () => {
    if (!currentText) return
    try {
      await simplify()
    } catch (error) {
      console.error('Simplification failed:', error)
    }
  }

  const handleSpellCheck = async () => {
    if (!currentText) return
    try {
      await checkSpelling()
    } catch (error) {
      console.error('Spell check failed:', error)
    }
  }

  const displayText = simplifiedText || currentText

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Focus Mode Toggle */}
          <button
            onClick={toggleFocus}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
              isFocusMode
                ? 'bg-dyslexia-calmBlue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <span>🎯</span>
            <DyslexiaText size="md">
              {isFocusMode ? 'Focus On' : 'Focus Off'}
            </DyslexiaText>
          </button>

          {/* Simplify Button */}
          <button
            onClick={handleSimplify}
            disabled={!currentText}
            className="px-4 py-2 bg-dyslexia-softGreen text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>✨</span>
            <DyslexiaText size="md">Simplify</DyslexiaText>
          </button>

          {/* Spell Check Button */}
          <button
            onClick={handleSpellCheck}
            disabled={!currentText || isCheckingSpelling}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
              spellCorrections.length > 0 && showSpellCorrections
                ? 'bg-dyslexia-softOrange text-white'
                : 'bg-purple-500 text-white hover:opacity-90'
            )}
          >
            <span>✓</span>
            <DyslexiaText size="md">
              {isCheckingSpelling ? 'Checking...' : `Check Spelling${spellCorrections.length > 0 ? ` (${spellCorrections.length})` : ''}`}
            </DyslexiaText>
          </button>

          {/* Show/Hide Corrections */}
          {spellCorrections.length > 0 && (
            <button
              onClick={toggleSpellCorrections}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <span>{showSpellCorrections ? '▼' : '▶'}</span>
              <DyslexiaText size="md">{showSpellCorrections ? 'Hide' : 'Show'}</DyslexiaText>
            </button>
          )}

          {/* Text Info */}
          {displayText && (
            <div className="ml-auto px-4 py-2 bg-dyslexia-pastelBlue rounded-lg">
              <DyslexiaText size="md">
                {displayText.split(/\s+/).length} words
              </DyslexiaText>
            </div>
          )}
        </div>
      </div>

      {/* Spell Corrections Panel */}
      {showSpellCorrections && spellCorrections.length > 0 && (
        <div className="bg-dyslexia-softOrange bg-opacity-20 border-l-4 border-dyslexia-softOrange rounded-r-lg p-4 mb-6">
          <DyslexiaText as="h3" size="lg" className="mb-3">
            Spelling Suggestions
          </DyslexiaText>
          <div className="space-y-2">
            {spellCorrections.map((correction, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white rounded-lg p-3"
              >
                <span className="text-red-500 font-medium">{correction.original}</span>
                <span>→</span>
                <span className="text-green-600 font-medium">{correction.correction}</span>
                <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                  {correction.confidence}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
