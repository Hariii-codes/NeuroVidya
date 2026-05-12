import { useDyslexiaSettings } from '../../DyslexiaProvider'
import { DyslexiaCard } from '../DyslexiaCard'
import { DyslexiaLabel } from '../DyslexiaText'
import type { DyslexiaFont as DyslexiaFontType } from '../../types/dyslexia'
import './TextDisplaySettings.css'

export interface TextDisplaySettingsProps {
  className?: string
}

/**
 * Text Display Settings Component
 *
 * Controls:
 * - Font Size slider (16px - 32px, default 22px)
 * - Letter Spacing slider (0 - 0.3em, default 0.15em)
 * - Word Spacing slider (0 - 1em, default 0.5em)
 * - Line Height slider (1.4 - 2.2, default 1.8)
 * - Font Family dropdown (Lexend, OpenDyslexic, Arial)
 */
export const TextDisplaySettings: React.FC<TextDisplaySettingsProps> = ({ className = '' }) => {
  const { settings, updateSetting } = useDyslexiaSettings()

  const fonts: Array<{ value: DyslexiaFontType; label: string; description: string }> = [
    { value: 'Lexend', label: 'Lexend', description: 'Optimized for readability' },
    { value: 'OpenDyslexic', label: 'OpenDyslexic', description: 'Designed for dyslexia' },
    { value: 'Arial', label: 'Arial', description: 'Widely available' },
  ]

  return (
    <DyslexiaCard variant="default" padding="lg" className={`text-display-settings ${className}`.trim()}>
      {/* Header */}
      <div className="text-display-settings__header">
        <span className="text-display-settings__icon" aria-hidden="true">📝</span>
        <h2 className="text-display-settings__title">Text Display</h2>
      </div>

      {/* Font Family Selection */}
      <div className="text-display-settings__section">
        <DyslexiaLabel htmlFor="font-family">Font Family</DyslexiaLabel>
        <div className="text-display-settings__fonts">
          {fonts.map((font) => (
            <button
              key={font.value}
              className={`text-display-settings__font-option ${settings.fontFamily === font.value ? 'text-display-settings__font-option--active' : ''}`}
              onClick={() => updateSetting('fontFamily', font.value)}
              aria-pressed={settings.fontFamily === font.value}
            >
              <span style={{ fontFamily: font.value }}>{font.label}</span>
              <span className="text-display-settings__font-description">{font.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size Slider */}
      <div className="text-display-settings__section">
        <div className="text-display-settings__slider-header">
          <DyslexiaLabel htmlFor="font-size">Font Size</DyslexiaLabel>
          <span className="text-display-settings__value">{settings.fontSize}px</span>
        </div>
        <input
          id="font-size"
          type="range"
          min="16"
          max="32"
          step="1"
          value={settings.fontSize}
          onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
          className="text-display-settings__slider"
          aria-valuemin={16}
          aria-valuemax={32}
          aria-valuenow={settings.fontSize}
          aria-valuetext={`${settings.fontSize} pixels`}
        />
        <div className="text-display-settings__slider-labels">
          <span>16px</span>
          <span>32px</span>
        </div>
      </div>

      {/* Letter Spacing Slider */}
      <div className="text-display-settings__section">
        <div className="text-display-settings__slider-header">
          <DyslexiaLabel htmlFor="letter-spacing">Letter Spacing</DyslexiaLabel>
          <span className="text-display-settings__value">{settings.letterSpacing}em</span>
        </div>
        <input
          id="letter-spacing"
          type="range"
          min="0"
          max="0.3"
          step="0.01"
          value={settings.letterSpacing}
          onChange={(e) => updateSetting('letterSpacing', parseFloat(e.target.value))}
          className="text-display-settings__slider"
          aria-valuemin={0}
          aria-valuemax={0.3}
          aria-valuenow={settings.letterSpacing}
          aria-valuetext={`${settings.letterSpacing} em`}
        />
        <div className="text-display-settings__slider-labels">
          <span>Tight</span>
          <span>Wide</span>
        </div>
      </div>

      {/* Word Spacing Slider */}
      <div className="text-display-settings__section">
        <div className="text-display-settings__slider-header">
          <DyslexiaLabel htmlFor="word-spacing">Word Spacing</DyslexiaLabel>
          <span className="text-display-settings__value">{settings.wordSpacing}em</span>
        </div>
        <input
          id="word-spacing"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.wordSpacing}
          onChange={(e) => updateSetting('wordSpacing', parseFloat(e.target.value))}
          className="text-display-settings__slider"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={settings.wordSpacing}
          aria-valuetext={`${settings.wordSpacing} em`}
        />
        <div className="text-display-settings__slider-labels">
          <span>Narrow</span>
          <span>Wide</span>
        </div>
        <p className="text-display-settings__hint">
          💡 Extra space between words helps reduce reading fatigue
        </p>
      </div>

      {/* Line Height Slider */}
      <div className="text-display-settings__section">
        <div className="text-display-settings__slider-header">
          <DyslexiaLabel htmlFor="line-height">Line Height</DyslexiaLabel>
          <span className="text-display-settings__value">{settings.lineHeight}</span>
        </div>
        <input
          id="line-height"
          type="range"
          min="1.4"
          max="2.2"
          step="0.1"
          value={settings.lineHeight}
          onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
          className="text-display-settings__slider"
          aria-valuemin={1.4}
          aria-valuemax={2.2}
          aria-valuenow={settings.lineHeight}
          aria-valuetext={`${settings.lineHeight} line height`}
        />
        <div className="text-display-settings__slider-labels">
          <span>Compact</span>
          <span>Spacious</span>
        </div>
      </div>
    </DyslexiaCard>
  )
}
