import { DyslexiaText } from '@/components/common/DyslexiaText'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { clsx } from 'clsx'

export function FontSettings() {
  const { font, fontSize, letterSpacing, lineHeight, updatePreference } = usePreferenceStore()

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <DyslexiaText as="h3" size="lg" className="mb-6">
        Font Settings
      </DyslexiaText>

      {/* Font Family */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Font</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => updatePreference('font', 'Lexend')}
            className={clsx(
              'p-4 rounded-lg border-2 transition-colors',
              font === 'Lexend'
                ? 'border-dyslexia-calmBlue bg-dyslexia-pastelBlue'
                : 'border-gray-200 hover:border-dyslexia-calmBlue'
            )}
          >
            <span style={{ fontFamily: 'Lexend' }} className="text-lg">
              Lexend
            </span>
          </button>
          <button
            onClick={() => updatePreference('font', 'OpenDyslexic')}
            className={clsx(
              'p-4 rounded-lg border-2 transition-colors',
              font === 'OpenDyslexic'
                ? 'border-dyslexia-calmBlue bg-dyslexia-pastelBlue'
                : 'border-gray-200 hover:border-dyslexia-calmBlue'
            )}
          >
            <span style={{ fontFamily: 'OpenDyslexic' }} className="text-lg">
              OpenDyslexic
            </span>
          </button>
        </div>
      </div>

      {/* Font Size */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Font Size: {fontSize}px
        </label>
        <input
          type="range"
          min="16"
          max="32"
          value={fontSize}
          onChange={(e) => updatePreference('fontSize', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Letter Spacing */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Letter Spacing: {letterSpacing}em
        </label>
        <input
          type="range"
          min="0.10"
          max="0.15"
          step="0.01"
          value={letterSpacing}
          onChange={(e) => updatePreference('letterSpacing', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Line Height: {lineHeight}
        </label>
        <input
          type="range"
          min="1.5"
          max="1.8"
          step="0.1"
          value={lineHeight}
          onChange={(e) => updatePreference('lineHeight', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  )
}
