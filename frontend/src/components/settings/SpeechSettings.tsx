import { DyslexiaText } from '@/components/common/DyslexiaText'
import { usePreferenceStore } from '@/stores/preferenceStore'

export function SpeechSettings() {
  const { speechSpeed, updatePreference } = usePreferenceStore()

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <DyslexiaText as="h3" size="lg" className="mb-6">
        Speech Settings
      </DyslexiaText>

      {/* Speech Speed */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Reading Speed: {speechSpeed}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={speechSpeed}
          onChange={(e) => updatePreference('speechSpeed', parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Slower</span>
          <span>Faster</span>
        </div>
      </div>
    </div>
  )
}
