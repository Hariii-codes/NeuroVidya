import { DyslexiaText } from '@/components/common/DyslexiaText'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { clsx } from 'clsx'
import { type Theme } from '@/types'

const themes: Array<{ id: Theme; name: string; color: string }> = [
  { id: 'cream', name: 'Cream', color: '#F7F3E9' },
  { id: 'dark', name: 'Dark', color: '#1F2937' },
  { id: 'pastel-blue', name: 'Pastel Blue', color: '#E8F4FC' },
  { id: 'pastel-green', name: 'Pastel Green', color: '#E8F8F0' },
  { id: 'light-yellow', name: 'Light Yellow', color: '#FEF9E7' },
]

export function ThemeSettings() {
  const { theme, updatePreference } = usePreferenceStore()

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <DyslexiaText as="h3" size="lg" className="mb-6">
        Theme
      </DyslexiaText>

      <div className="grid grid-cols-2 gap-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => updatePreference('theme', t.id)}
            className={clsx(
              'p-4 rounded-lg border-2 transition-colors',
              theme === t.id
                ? 'border-dyslexia-calmBlue ring-2 ring-dyslexia-calmBlue ring-offset-2'
                : 'border-gray-200 hover:border-dyslexia-calmBlue'
            )}
            style={{ backgroundColor: t.color }}
          >
            <DyslexiaText
              size="md"
              className={t.id === 'dark' ? 'text-white' : 'text-gray-800'}
            >
              {t.name}
            </DyslexiaText>
          </button>
        ))}
      </div>
    </div>
  )
}
