import { useState, useEffect } from 'react'
import { DyslexiaText } from '@/components/common/DyslexiaText'
import { useTTS } from '@/hooks/useTTS'
import { useReadingStore } from '@/stores/readingStore'
import { usePreferenceStore } from '@/stores/preferenceStore'

const SPEED_OPTIONS = [
  { value: 0.5, label: 'Very Slow', icon: '🐢' },
  { value: 0.75, label: 'Slow', icon: '🚶' },
  { value: 1.0, label: 'Normal', icon: '🚶' },
  { value: 1.25, label: 'Fast', icon: '🏃' },
  { value: 1.5, label: 'Very Fast', icon: '⚡' },
]

export function TTSControl() {
  const { currentText } = useReadingStore()
  const { speechSpeed, updatePreference } = usePreferenceStore()
  const { isPlaying, isPaused, speak, pause, resume, stop, isSupported } = useTTS()
  const [showSpeedOptions, setShowSpeedOptions] = useState(false)
  const [localSpeed, setLocalSpeed] = useState(speechSpeed)

  // Update local speed when store changes
  useEffect(() => {
    setLocalSpeed(speechSpeed)
  }, [speechSpeed])

  if (!isSupported) {
    return (
      <div className="bg-dyslexia-softOrange bg-opacity-20 border-l-4 border-dyslexia-softOrange p-4 rounded-lg">
        <DyslexiaText size="md">
          Text-to-speech is not available in your browser. Try Chrome or Edge.
        </DyslexiaText>
      </div>
    )
  }

  const handlePlay = () => {
    if (currentText) {
      if (isPaused) {
        resume()
      } else if (!isPlaying) {
        speak(currentText)
      }
    }
  }

  const handleSpeedChange = async (newSpeed: number, event?: React.MouseEvent) => {
    // Prevent event bubbling if provided
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }

    // Update local state immediately for visual feedback
    setLocalSpeed(newSpeed)

    // Close dropdown after a small delay
    setTimeout(() => {
      setShowSpeedOptions(false)
    }, 150)

    try {
      // Update in store (async)
      await updatePreference('speechSpeed', newSpeed)
    } catch (error) {
      // Silently fail - user might not be authenticated
    }

    // Restart with new speed if playing
    if (isPlaying && currentText) {
      stop()
      // Small delay to ensure stop completes, then speak with new speed
      setTimeout(() => {
        // speak() will use the updated speechSpeed from the store
        speak(currentText)
      }, 200)
    }
  }

  const currentSpeedOption = SPEED_OPTIONS.find(opt => opt.value === localSpeed) || SPEED_OPTIONS[2]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
      <div className="flex flex-col gap-4">
        {/* Main Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              disabled={!currentText}
              className="bg-dyslexia-calmBlue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Play text"
            >
              <span>▶</span>
              <DyslexiaText size="md">Play</DyslexiaText>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resume}
                  className="bg-dyslexia-calmBlue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                  aria-label="Resume"
                >
                  <span>▶</span>
                  <DyslexiaText size="md">Resume</DyslexiaText>
                </button>
              ) : (
                <button
                  onClick={pause}
                  className="bg-dyslexia-calmBlue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                  aria-label="Pause"
                >
                  <span>⏸</span>
                  <DyslexiaText size="md">Pause</DyslexiaText>
                </button>
              )}
              <button
                onClick={stop}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                aria-label="Stop"
              >
                <span>⏹</span>
                <DyslexiaText size="md">Stop</DyslexiaText>
              </button>
            </>
          )}

          {/* Speed Control Button */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedOptions(!showSpeedOptions)}
              className="bg-dyslexia-pastelBlue text-dyslexia-calmBlue px-4 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
              aria-label="Change speech speed"
              aria-expanded={showSpeedOptions}
            >
              <span className="text-xl">{currentSpeedOption.icon}</span>
              <DyslexiaText size="md">{currentSpeedOption.label}</DyslexiaText>
              <DyslexiaText size="sm">({localSpeed}x)</DyslexiaText>
              <span>{showSpeedOptions ? '▲' : '▼'}</span>
            </button>

            {/* Speed Options Dropdown */}
            {showSpeedOptions && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border-2 border-dyslexia-calmBlue z-50 min-w-[200px]">
                <div className="p-2">
                  <DyslexiaText size="sm" className="text-dyslexia-calmBlue mb-2 px-2">
                    Choose Speed:
                  </DyslexiaText>
                  {SPEED_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => handleSpeedChange(option.value, e)}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        localSpeed === option.value
                          ? 'bg-dyslexia-calmBlue text-white'
                          : 'hover:bg-dyslexia-pastelBlue text-gray-700'
                      }`}
                      aria-label={`Set speed to ${option.label}`}
                      aria-pressed={localSpeed === option.value}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <div>
                        <DyslexiaText size="md" className="font-medium">
                          {option.label}
                        </DyslexiaText>
                        <DyslexiaText size="sm" className="opacity-75">
                          {option.value}x
                        </DyslexiaText>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Speed Description */}
        <div className="text-sm text-gray-600 px-2">
          <DyslexiaText size="sm">
            {localSpeed <= 0.75 && '🐢 Very slow - Take your time reading'}
            {localSpeed === 1.0 && '🚶 Normal speed - Comfortable reading'}
            {localSpeed >= 1.25 && '⚡ Fast - For experienced readers'}
          </DyslexiaText>
        </div>
      </div>
    </div>
  )
}
