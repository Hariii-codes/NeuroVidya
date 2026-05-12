import { useDyslexiaSettings } from '../../DyslexiaProvider'
import { DyslexiaCard } from '../DyslexiaCard'
import { DyslexiaLabel } from '../DyslexiaText'
import './AudioSettings.css'

export interface AudioSettingsProps {
  className?: string
}

/**
 * Audio Settings Component
 *
 * Controls:
 * - TTS Always Visible toggle
 * - Speech Speed slider (0.5x - 2x)
 * - Word-by-Word mode toggle
 * - Voice Selection
 */
export const AudioSettings: React.FC<AudioSettingsProps> = ({ className = '' }) => {
  const { settings, updateSetting } = useDyslexiaSettings()

  const speechSpeedOptions = [
    { value: 0.5, label: '0.5x (Very Slow)' },
    { value: 0.75, label: '0.75x (Slow)' },
    { value: 1.0, label: '1.0x (Normal)' },
    { value: 1.25, label: '1.25x (Fast)' },
    { value: 1.5, label: '1.5x (Faster)' },
    { value: 2.0, label: '2.0x (Very Fast)' },
  ]

  return (
    <DyslexiaCard variant="default" padding="lg" className={`audio-settings ${className}`.trim()}>
      {/* Header */}
      <div className="audio-settings__header">
        <span className="audio-settings__icon" aria-hidden="true">🔊</span>
        <h2 className="audio-settings__title">Audio Settings</h2>
      </div>

      {/* TTS Always Visible */}
      <div className="audio-settings__section">
        <div className="audio-settings__toggle-row">
          <div className="audio-settings__toggle-info">
            <DyslexiaLabel htmlFor="tts-visible">TTS Always Visible</DyslexiaLabel>
            <p className="audio-settings__description">
              Keep text-to-speech controls visible on screen for easy access
            </p>
          </div>
          <button
            id="tts-visible"
            className={`audio-settings-toggle ${settings.ttsAlwaysVisible ? 'audio-settings-toggle--on' : ''}`}
            onClick={() => updateSetting('ttsAlwaysVisible', !settings.ttsAlwaysVisible)}
            aria-pressed={settings.ttsAlwaysVisible}
            role="switch"
          >
            <span className="audio-settings-toggle__slider" />
          </button>
        </div>
      </div>

      {/* Speech Speed */}
      <div className="audio-settings__section">
        <div className="audio-settings__slider-header">
          <DyslexiaLabel htmlFor="speech-speed">Speech Speed</DyslexiaLabel>
          <span className="audio-settings__speed-badge">{settings.speechSpeed}x</span>
        </div>
        <input
          id="speech-speed"
          type="range"
          min="0.5"
          max="2"
          step="0.05"
          value={settings.speechSpeed}
          onChange={(e) => updateSetting('speechSpeed', parseFloat(e.target.value))}
          className="audio-settings__slider"
          aria-valuemin={0.5}
          aria-valuemax={2}
          aria-valuenow={settings.speechSpeed}
          aria-valuetext={`${settings.speechSpeed}x speed`}
        />
        <div className="audio-settings__speed-presets">
          {speechSpeedOptions.map((option) => (
            <button
              key={option.value}
              className={`audio-settings__speed-preset ${settings.speechSpeed === option.value ? 'audio-settings__speed-preset--active' : ''}`}
              onClick={() => updateSetting('speechSpeed', option.value)}
              aria-pressed={settings.speechSpeed === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Word-by-Word Mode */}
      <div className="audio-settings__section">
        <div className="audio-settings__toggle-row">
          <div className="audio-settings__toggle-info">
            <DyslexiaLabel htmlFor="word-by-word">Word-by-Word Mode</DyslexiaLabel>
            <p className="audio-settings__description">
              Read one word at a time for focused listening
            </p>
          </div>
          <button
            id="word-by-word"
            className={`audio-settings-toggle ${settings.wordByWordMode ? 'audio-settings-toggle--on' : ''}`}
            onClick={() => updateSetting('wordByWordMode', !settings.wordByWordMode)}
            aria-pressed={settings.wordByWordMode}
            role="switch"
          >
            <span className="audio-settings-toggle__slider" />
          </button>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="audio-settings__section">
        <DyslexiaLabel htmlFor="voice-select">Voice</DyslexiaLabel>
        <select
          id="voice-select"
          className="audio-settings__select"
          value={settings.voiceSelection}
          onChange={(e) => updateSetting('voiceSelection', e.target.value)}
        >
          <option value="default">Default System Voice</option>
          <option value="female1">Female Voice 1</option>
          <option value="female2">Female Voice 2</option>
          <option value="male1">Male Voice 1</option>
          <option value="male2">Male Voice 2</option>
        </select>
        <p className="audio-settings__hint">
          💡 Voice options depend on your browser and system
        </p>
      </div>

      {/* Test TTS Button */}
      <div className="audio-settings__test">
        <button className="audio-settings__test-btn">
          <span aria-hidden="true">▶️</span>
          Test Speech
        </button>
      </div>
    </DyslexiaCard>
  )
}
