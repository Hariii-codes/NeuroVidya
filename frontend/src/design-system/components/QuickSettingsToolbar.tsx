import { useState } from 'react'
import { useDyslexiaSettings } from '../DyslexiaProvider'
import './QuickSettingsToolbar.css'

export interface QuickSettingsToolbarProps {
  className?: string
}

/**
 * Quick Settings Floating Toolbar
 *
 * A floating button that expands to show common dyslexia setting toggles:
 * - Line focus on/off
 * - Word spacing toggle
 * - TTS toggle
 * - Theme quick switch
 *
 * Collapses when not in use to avoid visual clutter
 */
export const QuickSettingsToolbar: React.FC<QuickSettingsToolbarProps> = ({ className = '' }) => {
  const { settings, updateSetting } = useDyslexiaSettings()
  const [isExpanded, setIsExpanded] = useState(false)

  // Toggle handlers
  const toggleLineFocus = () => {
    updateSetting('lineFocusEnabled', !settings.lineFocusEnabled)
  }

  const toggleWordSpacing = () => {
    // Toggle between normal (0.2em) and enhanced (0.6em) word spacing
    updateSetting('wordSpacing', settings.wordSpacing > 0.3 ? 0.2 : 0.6)
  }

  const toggleTTS = () => {
    updateSetting('ttsAlwaysVisible', !settings.ttsAlwaysVisible)
  }

  const cycleTheme = () => {
    const themes: Array<'cream' | 'pastel-blue' | 'pastel-green' | 'light-yellow' | 'dark'> =
      ['cream', 'pastel-blue', 'pastel-green', 'light-yellow', 'dark']
    const currentIndex = themes.indexOf(settings.theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    updateSetting('theme', nextTheme)
  }

  const toolbarClasses = [
    'quick-settings-toolbar',
    isExpanded && 'quick-settings-toolbar--expanded',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={toolbarClasses}>
      {/* Quick Settings Button (always visible) */}
      <button
        className="quick-settings-button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Quick settings"
        aria-expanded={isExpanded}
        title="Quick dyslexia settings"
      >
        <span className="quick-settings-icon" aria-hidden="true">⚙️</span>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="quick-settings-panel">
          <div className="quick-settings-header">
            <span className="quick-settings-title">Quick Settings</span>
            <button
              className="quick-settings-close"
              onClick={() => setIsExpanded(false)}
              aria-label="Close quick settings"
            >
              ×
            </button>
          </div>

          <div className="quick-settings-toggles">
            {/* Line Focus Toggle */}
            <button
              className={`quick-toggle ${settings.lineFocusEnabled ? 'quick-toggle--active' : ''}`}
              onClick={toggleLineFocus}
              title={settings.lineFocusEnabled ? 'Disable line focus' : 'Enable line focus'}
            >
              <span className="quick-toggle__icon">🔍</span>
              <span className="quick-toggle__label">Focus</span>
            </button>

            {/* Word Spacing Toggle */}
            <button
              className={`quick-toggle ${settings.wordSpacing > 0.3 ? 'quick-toggle--active' : ''}`}
              onClick={toggleWordSpacing}
              title={`Word spacing: ${settings.wordSpacing > 0.3 ? 'High' : 'Normal'}`}
            >
              <span className="quick-toggle__icon">📏</span>
              <span className="quick-toggle__label">Spacing</span>
            </button>

            {/* TTS Toggle */}
            <button
              className={`quick-toggle ${settings.ttsAlwaysVisible ? 'quick-toggle--active' : ''}`}
              onClick={toggleTTS}
              title={settings.ttsAlwaysVisible ? 'Hide TTS controls' : 'Show TTS controls'}
            >
              <span className="quick-toggle__icon">🔊</span>
              <span className="quick-toggle__label">TTS</span>
            </button>

            {/* Theme Cycle */}
            <button
              className="quick-toggle"
              onClick={cycleTheme}
              title={`Theme: ${settings.theme}`}
            >
              <span className="quick-toggle__icon">🎨</span>
              <span className="quick-toggle__label">{settings.theme}</span>
            </button>
          </div>

          {/* Current Settings Summary */}
          <div className="quick-settings-summary">
            <div className="quick-settings-summary-item">
              <span>Font:</span>
              <strong>{settings.fontFamily}</strong>
            </div>
            <div className="quick-settings-summary-item">
              <span>Size:</span>
              <strong>{settings.fontSize}px</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
