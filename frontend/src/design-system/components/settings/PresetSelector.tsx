import { useDyslexiaSettings } from '../../DyslexiaProvider'
import { DyslexiaCard } from '../DyslexiaCard'
import { DyslexiaButton } from '../DyslexiaButton'
import type { PresetLevel } from '../../types/dyslexia'
import './PresetSelector.css'

export interface PresetSelectorProps {
  className?: string
  onApply?: (preset: PresetLevel) => void
}

/**
 * Preset Selector Component
 *
 * Pre-configured settings for different dyslexia support levels:
 * - Mild Dyslexia Support
 * - Moderate Dyslexia Support
 * - Significant Dyslexia Support
 * - Custom (current settings)
 */
export const PresetSelector: React.FC<PresetSelectorProps> = ({ className = '', onApply }) => {
  const { settings, applyPreset } = useDyslexiaSettings()

  const presets: Array<{
    level: PresetLevel
    name: string
    description: string
    icon: string
    features: string[]
  }> = [
    {
      level: 'mild',
      name: 'Mild Support',
      description: 'For readers who need minimal assistance',
      icon: '🌱',
      features: [
        'Font: 20px',
        'Line spacing: 1.6x',
        'Word spacing: Normal',
        'Basic TTS available',
      ],
    },
    {
      level: 'moderate',
      name: 'Moderate Support',
      description: 'For readers who need some assistance',
      icon: '🌿',
      features: [
        'Font: 22px',
        'Line spacing: 1.8x',
        'Word spacing: Enhanced',
        'Line focus enabled',
        'Phonetic chunking',
        'High contrast',
      ],
    },
    {
      level: 'significant',
      name: 'Significant Support',
      description: 'Maximum dyslexia optimization',
      icon: '🌳',
      features: [
        'Font: 24px',
        'Line spacing: 2.0x',
        'Word spacing: Maximum',
        'All reading aids enabled',
        'AI-assisted chunking',
        'Very high contrast',
      ],
    },
  ]

  const handleApplyPreset = (level: PresetLevel) => {
    applyPreset(level)
    onApply?.(level)
  }

  const isCustom = settings.presetLevel === 'custom'

  return (
    <DyslexiaCard variant="elevated" padding="lg" className={`preset-selector ${className}`.trim()}>
      {/* Header */}
      <div className="preset-selector__header">
        <span className="preset-selector__icon" aria-hidden="true">⚙️</span>
        <div>
          <h2 className="preset-selector__title">Quick Presets</h2>
          {isCustom && (
            <p className="preset-selector__custom-badge">Currently using custom settings</p>
          )}
        </div>
      </div>

      {/* Preset Cards */}
      <div className="preset-selector__presets">
        {presets.map((preset) => {
          const isActive = settings.presetLevel === preset.level

          return (
            <button
              key={preset.level}
              className={`preset-card ${isActive ? 'preset-card--active' : ''}`}
              onClick={() => handleApplyPreset(preset.level)}
              aria-pressed={isActive}
            >
              <div className="preset-card__icon">{preset.icon}</div>
              <div className="preset-card__content">
                <h3 className="preset-card__name">{preset.name}</h3>
                <p className="preset-card__description">{preset.description}</p>
                <ul className="preset-card__features">
                  {preset.features.map((feature) => (
                    <li key={feature} className="preset-card__feature">
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
              </div>
              {isActive && (
                <div className="preset-card__active-indicator">
                  <span>Currently Active</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Reset to Defaults */}
      <div className="preset-selector__actions">
        <DyslexiaButton
          variant="ghost"
          icon={<span aria-hidden="true">↺</span>}
          onClick={() => {
            // Apply mild preset as default
            applyPreset('mild')
          }}
        >
          Reset to Defaults
        </DyslexiaButton>
      </div>
    </DyslexiaCard>
  )
}
