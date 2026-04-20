import { useDyslexiaSettings } from '../../DyslexiaProvider'
import { DyslexiaCard } from '../DyslexiaCard'
import { DyslexiaLabel } from '../DyslexiaText'
import { ChunkStyleSelector } from '../PhoneticHighlighter'
import './ReadingAidsSettings.css'

export interface ReadingAidsSettingsProps {
  className?: string
}

/**
 * Reading Aids Settings Component
 *
 * Controls:
 * - Line-by-Line Focus toggle + color picker + dim intensity slider
 * - Phonetic Chunking toggle + style selector + AI toggle
 * - Word Spacing toggle
 */
export const ReadingAidsSettings: React.FC<ReadingAidsSettingsProps> = ({ className = '' }) => {
  const { settings, updateSetting } = useDyslexiaSettings()

  const lineFocusColors = [
    { value: '#fbbf24', name: 'Yellow', label: '🟡' },
    { value: '#059669', name: 'Green', label: '🟢' },
    { value: '#3b82f6', name: 'Blue', label: '🔵' },
    { value: '#f97316', name: 'Orange', label: '🟠' },
  ]

  return (
    <DyslexiaCard variant="default" padding="lg" className={`reading-aids-settings ${className}`.trim()}>
      {/* Header */}
      <div className="reading-aids-settings__header">
        <span className="reading-aids-settings__icon" aria-hidden="true">📖</span>
        <h2 className="reading-aids-settings__title">Reading Aids</h2>
      </div>

      {/* Line-by-Line Focus */}
      <div className="reading-aids-settings__section">
        <div className="reading-aids-settings__toggle-header">
          <DyslexiaLabel htmlFor="line-focus-toggle">Line-by-Line Focus</DyslexiaLabel>
          <button
            id="line-focus-toggle"
            className={`reading-aids-toggle ${settings.lineFocusEnabled ? 'reading-aids-toggle--on' : ''}`}
            onClick={() => updateSetting('lineFocusEnabled', !settings.lineFocusEnabled)}
            aria-pressed={settings.lineFocusEnabled}
            role="switch"
          >
            <span className="reading-aids-toggle__slider" />
            <span className="reading-aids-toggle__label">
              {settings.lineFocusEnabled ? 'On' : 'Off'}
            </span>
          </button>
        </div>
        <p className="reading-aids-settings__description">
          Highlights the current line being read and dims other lines
        </p>

        {/* Line Focus Sub-settings */}
        {settings.lineFocusEnabled && (
          <div className="reading-aids-settings__sub-settings">
            {/* Highlight Color */}
            <div className="reading-aids-settings__subsection">
              <DyslexiaLabel>Highlight Color</DyslexiaLabel>
              <div className="reading-aids-settings__color-options">
                {lineFocusColors.map((color) => (
                  <button
                    key={color.value}
                    className={`reading-aids-color-option ${settings.lineFocusColor === color.value ? 'reading-aids-color-option--active' : ''}`}
                    onClick={() => updateSetting('lineFocusColor', color.value)}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    aria-label={`Use ${color.name} highlight`}
                    aria-pressed={settings.lineFocusColor === color.value}
                  >
                    {color.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dim Intensity */}
            <div className="reading-aids-settings__subsection">
              <div className="reading-aids-settings__slider-header">
                <DyslexiaLabel htmlFor="dim-intensity">Dim Other Lines</DyslexiaLabel>
                <span className="reading-aids-settings__value">
                  {Math.round(settings.lineDimIntensity * 100)}%
                </span>
              </div>
              <input
                id="dim-intensity"
                type="range"
                min="0"
                max="0.7"
                step="0.05"
                value={settings.lineDimIntensity}
                onChange={(e) => updateSetting('lineDimIntensity', parseFloat(e.target.value))}
                className="reading-aids-settings__slider"
              />
            </div>

            {/* Auto-scroll */}
            <div className="reading-aids-settings__subsection">
              <label className="reading-aids-settings__checkbox">
                <input
                  type="checkbox"
                  checked={settings.lineFocusAutoScroll}
                  onChange={(e) => updateSetting('lineFocusAutoScroll', e.target.checked)}
                />
                <span>Auto-scroll through text</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Phonetic Chunking */}
      <div className="reading-aids-settings__section">
        <div className="reading-aids-settings__toggle-header">
          <DyslexiaLabel htmlFor="chunking-toggle">Phonetic Chunking</DyslexiaLabel>
          <button
            id="chunking-toggle"
            className={`reading-aids-toggle ${settings.phoneticChunkingEnabled ? 'reading-aids-toggle--on' : ''}`}
            onClick={() => updateSetting('phoneticChunkingEnabled', !settings.phoneticChunkingEnabled)}
            aria-pressed={settings.phoneticChunkingEnabled}
            role="switch"
          >
            <span className="reading-aids-toggle__slider" />
            <span className="reading-aids-toggle__label">
              {settings.phoneticChunkingEnabled ? 'On' : 'Off'}
            </span>
          </button>
        </div>
        <p className="reading-aids-settings__description">
          Color-code syllables to help with word recognition
        </p>

        {/* Chunking Sub-settings */}
        {settings.phoneticChunkingEnabled && (
          <div className="reading-aids-settings__sub-settings">
            {/* Chunk Style Selector */}
            <div className="reading-aids-settings__subsection">
              <DyslexiaLabel>Chunking Style</DyslexiaLabel>
              <ChunkStyleSelector
                value={settings.chunkStyle}
                onChange={(value) => updateSetting('chunkStyle', value as any)}
                disabled={!settings.phoneticChunkingEnabled}
              />
            </div>

            {/* AI Enhancement Toggle */}
            <div className="reading-aids-settings__subsection">
              <label className="reading-aids-settings__checkbox">
                <input
                  type="checkbox"
                  checked={settings.useAIForChunking}
                  onChange={(e) => updateSetting('useAIForChunking', e.target.checked)}
                />
                <span>
                  Use AI for complex words
                  <span className="reading-aids-settings__hint">
                    More accurate syllable division for difficult words
                  </span>
                </span>
              </label>
            </div>

            {/* Preview */}
            <div className="reading-aids-settings__preview">
              <DyslexiaLabel>Preview</DyslexiaLabel>
              <div className="reading-aids-settings__preview-text">
                <span className="syllable-chunk color-1">car</span>
                <span className="syllable-chunk color-2">dio</span>
                <span className="syllable-chunk color-3">vas</span>
                <span className="syllable-chunk color-4">cu</span>
                <span className="syllable-chunk color-1">lar</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Word Spacing Quick Toggle */}
      <div className="reading-aids-settings__section reading-aids-settings__section--compact">
        <div className="reading-aids-settings__toggle-header">
          <DyslexiaLabel htmlFor="spacing-toggle">Enhanced Word Spacing</DyslexiaLabel>
          <button
            id="spacing-toggle"
            className={`reading-aids-toggle ${settings.wordSpacing > 0.3 ? 'reading-aids-toggle--on' : ''}`}
            onClick={() => updateSetting('wordSpacing', settings.wordSpacing > 0.3 ? 0.2 : 0.6)}
            aria-pressed={settings.wordSpacing > 0.3}
            role="switch"
          >
            <span className="reading-aids-toggle__slider" />
            <span className="reading-aids-toggle__label">
              {settings.wordSpacing > 0.3 ? 'Enhanced' : 'Normal'}
            </span>
          </button>
        </div>
        <p className="reading-aids-settings__description">
          Extra space between words to reduce reading fatigue
        </p>
      </div>
    </DyslexiaCard>
  )
}
