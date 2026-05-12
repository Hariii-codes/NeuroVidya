import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { MainLayout } from '@/components/layout'
import { Link } from 'react-router-dom'
import {
  DyslexiaText,
  DyslexiaHeading,
  TextDisplaySettings,
  ReadingAidsSettings,
  AudioSettings,
  VisualThemeSettings,
  PresetSelector,
  DyslexiaCard,
} from '@/design-system'
import { useState } from 'react'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'preset' | 'text' | 'reading' | 'audio' | 'theme'>('preset')

  const tabs = [
    { id: 'preset' as const, label: 'Quick Presets', icon: '⚙️' },
    { id: 'text' as const, label: 'Text Display', icon: '🔤' },
    { id: 'reading' as const, label: 'Reading Aids', icon: '📖' },
    { id: 'audio' as const, label: 'Audio & Speech', icon: '🔊' },
    { id: 'theme' as const, label: 'Visual Theme', icon: '🎨' },
  ]

  return (
    <ProtectedRoute>
      <MainLayout showQuickSettings={true}>
        {/* Header */}
        <header className="border-b-4 border-dyslexia-text-secondary">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-3 border-dyslexia-text-secondary hover:border-dyslexia-accent transition-all"
              >
                <span aria-hidden="true">←</span>
                <DyslexiaText variant="body">Back</DyslexiaText>
              </Link>
              <DyslexiaHeading level={1} className="m-0">
                Dyslexia Settings
              </DyslexiaHeading>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mt-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg border-3 font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-dyslexia-accent text-white border-dyslexia-accent'
                      : 'border-dyslexia-text-secondary hover:border-dyslexia-accent'
                  }`}
                  aria-pressed={activeTab === tab.id}
                >
                  <span className="mr-2" aria-hidden="true">
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'preset' && (
              <div className="space-y-6 animate-fade-in">
                <DyslexiaCard padding="lg" variant="elevated">
                  <DyslexiaHeading level={2}>Quick Start</DyslexiaHeading>
                  <DyslexiaText variant="body" className="mt-2">
                    Choose a preset based on your dyslexia support needs. You can fine-tune any setting
                    after selecting a preset.
                  </DyslexiaText>
                </DyslexiaCard>
                <PresetSelector
                  onApply={(_preset) => {
                    // Auto-switch to text display tab after preset is applied
                    setActiveTab('text')
                  }}
                />
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-6 animate-fade-in">
                <TextDisplaySettings />
              </div>
            )}

            {activeTab === 'reading' && (
              <div className="space-y-6 animate-fade-in">
                <ReadingAidsSettings />
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-6 animate-fade-in">
                <AudioSettings />
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-6 animate-fade-in">
                <VisualThemeSettings />
              </div>
            )}
          </div>
        </main>

        {/* Footer Help */}
        <footer className="border-t-4 border-dyslexia-text-secondary mt-12">
          <div className="container mx-auto px-6 py-6">
            <DyslexiaCard padding="md" variant="default">
              <DyslexiaHeading level={3}>Need Help?</DyslexiaHeading>
              <DyslexiaText variant="body" className="mt-2">
                These settings are designed specifically for dyslexic readers. Presets are based on research
                from the British Dyslexia Association and MIT cognitive studies. All settings are saved
                automatically and will persist across all your reading sessions.
              </DyslexiaText>
            </DyslexiaCard>
          </div>
        </footer>
      </MainLayout>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ProtectedRoute>
  )
}
