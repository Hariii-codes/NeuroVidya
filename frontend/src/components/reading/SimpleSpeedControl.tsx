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

export function SimpleSpeedControl() {
  const { speechSpeed, updatePreference } = usePreferenceStore()
  const { isPlaying, speak, stop } = useTTS()
  const [selectedSpeed, setSelectedSpeed] = useState(speechSpeed)

  // Sync with store when it changes
  useEffect(() => {
    setSelectedSpeed(speechSpeed)
  }, [speechSpeed])

  const handleSpeedSelect = async (speed: number) => {
    // Update local state immediately for visual feedback
    setSelectedSpeed(speed)

    try {
      // Update in store (async)
      await updatePreference('speechSpeed', speed)
    } catch (error) {
      // Handle error silently
    }

    // Restart audio if playing
    if (isPlaying) {
      const { currentText } = useReadingStore.getState()
      if (currentText) {
        stop()
        setTimeout(() => speak(currentText), 100)
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
      <DyslexiaText size="md" className="mb-3 text-dyslexia-calmBlue font-medium">
        🎚️ Choose Reading Speed:
      </DyslexiaText>
      <div className="flex flex-wrap gap-2">
        {SPEED_OPTIONS.map((option) => {
          const isSelected = selectedSpeed === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSpeedSelect(option.value)}
              onMouseDown={(e) => {
                e.preventDefault()
              }}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-dyslexia-calmBlue text-white scale-105 font-bold shadow-md'
                  : 'bg-dyslexia-pastelBlue text-gray-700 hover:scale-105 hover:shadow-md'
              }`}
              style={{
                minWidth: '140px',
                border: isSelected ? '3px solid #3B82F6' : '2px solid transparent',
                pointerEvents: 'auto'
              }}
            >
              <span className="text-xl">{option.icon}</span>
              <div className="text-left">
                <DyslexiaText size="md" className="font-medium">
                  {option.label}
                </DyslexiaText>
                <DyslexiaText size="sm" className="opacity-75">
                  {option.value}x
                </DyslexiaText>
              </div>
            </button>
          )
        })}
      </div>
      <div className="mt-2 text-sm text-gray-600 px-2">
        <DyslexiaText size="sm">
          Selected: {selectedSpeed}x | Current: {speechSpeed}x
        </DyslexiaText>
      </div>
    </div>
  )
}
