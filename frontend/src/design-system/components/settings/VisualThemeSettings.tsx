import { useDyslexiaSettings } from '../../DyslexiaProvider'
import { DyslexiaCard } from '../DyslexiaCard'
import { DyslexiaLabel } from '../DyslexiaText'
import type { DyslexiaTheme, ContrastLevel } from '../../types/dyslexia'
import './VisualThemeSettings.css'

export interface VisualThemeSettingsProps {
  className?: string
}

/**
 * Visual Theme Settings Component
 *
 * Controls:
 * - Theme presets (Cream, Pastel Blue, Pastel Green, Light Yellow, Dark)
 * - Accent Color picker
 * - Contrast Level (Normal, High, Very High)
 */
export const VisualThemeSettings: React.FC<VisualThemeSettingsProps> = ({ className = '' }) => {
  const { settings, updateSetting } = useDyslexiaSettings()

  const themes: Array<{ value: DyslexiaTheme; label: string; color: string; textColor: string }> = [
    { value: 'cream', label: 'Cream', color: '#F7F3E9', textColor: '#1f2937' },
    { value: 'pastel-blue', label: 'Pastel Blue', color: '#E8F4FC', textColor: '#1e3a5f' },
    { value: 'pastel-green', label: 'Pastel Green', color: '#E8F8F0', textColor: '#1a4d2e' },
    { value: 'light-yellow', label: 'Light Yellow', color: '#FEF9E7', textColor: '#423c08' },
    { value: 'dark', label: 'Dark', color: '#111827', textColor: '#F9FAFB' },
  ]

  const accentColors = [
    { name: 'Calm Blue', value: '#3b82f6', color: '#3b82f6' },
    { name: 'Success Green', value: '#059669', color: '#059669' },
    { name: 'Soft Orange', value: '#f97316', color: '#f97316' },
    { name: 'Focus Yellow', value: '#fbbf24', color: '#fbbf24' },
    { name: 'Vibrant Purple', value: '#8b5cf6', color: '#8b5cf6' },
    { name: 'Soft Pink', value: '#ec4899', color: '#ec4899' },
  ]

  const contrastLevels: Array<{ value: ContrastLevel; label: string; description: string }> = [
    { value: 'normal', label: 'Normal', description: 'Standard contrast' },
    { value: 'high', label: 'High', description: 'Increased contrast' },
    { value: 'very-high', label: 'Very High', description: 'Maximum contrast' },
  ]

  return (
    <DyslexiaCard variant="default" padding="lg" className={`visual-theme-settings ${className}`.trim()}>
      {/* Header */}
      <div className="visual-theme-settings__header">
        <span className="visual-theme-settings__icon" aria-hidden="true">🎨</span>
        <h2 className="visual-theme-settings__title">Visual Theme</h2>
      </div>

      {/* Theme Presets */}
      <div className="visual-theme-settings__section">
        <DyslexiaLabel>Theme</DyslexiaLabel>
        <div className="visual-theme-settings__themes">
          {themes.map((theme) => (
            <button
              key={theme.value}
              className={`visual-theme-option ${settings.theme === theme.value ? 'visual-theme-option--active' : ''}`}
              onClick={() => updateSetting('theme', theme.value)}
              style={{ backgroundColor: theme.color, color: theme.textColor }}
              aria-pressed={settings.theme === theme.value}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="visual-theme-settings__section">
        <DyslexiaLabel>Accent Color</DyslexiaLabel>
        <div className="visual-theme-settings__colors">
          {accentColors.map((color) => (
            <button
              key={color.value}
              className={`visual-theme-color-option ${settings.accentColor === color.value ? 'visual-theme-color-option--active' : ''}`}
              onClick={() => updateSetting('accentColor', color.value)}
              style={{ backgroundColor: color.color }}
              aria-label={`Use ${color.name} accent color`}
              aria-pressed={settings.accentColor === color.value}
              title={color.name}
            >
              {settings.accentColor === color.value && (
                <span className="visual-theme-color-option__check">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contrast Level */}
      <div className="visual-theme-settings__section">
        <DyslexiaLabel>Contrast Level</DyslexiaLabel>
        <div className="visual-theme-settings__contrast">
          {contrastLevels.map((level) => (
            <button
              key={level.value}
              className={`visual-theme-contrast-option ${settings.contrastLevel === level.value ? 'visual-theme-contrast-option--active' : ''}`}
              onClick={() => updateSetting('contrastLevel', level.value)}
              aria-pressed={settings.contrastLevel === level.value}
            >
              <span className="visual-theme-contrast-option__icon">
                {level.value === 'normal' ? '◐' : level.value === 'high' ? '●' : '⬤'}
              </span>
              <div className="visual-theme-contrast-option__info">
                <span className="visual-theme-contrast-option__label">{level.label}</span>
                <span className="visual-theme-contrast-option__description">{level.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="visual-theme-settings__preview">
        <DyslexiaLabel>Preview</DyslexiaLabel>
        <div className="visual-theme-settings__preview-box">
          <p className="visual-theme-settings__preview-text">
            This is how your text will look with the current settings.
          </p>
          <div className="visual-theme-settings__preview-elements">
            <button className="visual-theme-preview-btn">Button</button>
            <span className="visual-theme-preview-badge">Badge</span>
            <a href="#" className="visual-theme-preview-link">Link</a>
          </div>
        </div>
      </div>
    </DyslexiaCard>
  )
}
