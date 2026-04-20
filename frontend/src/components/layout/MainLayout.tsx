import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { QuickSettingsToolbar } from '@/design-system'
import { DyslexiaCard, DyslexiaText, DyslexiaButton } from '@/design-system'

export interface MainLayoutProps {
  children: ReactNode
  showQuickSettings?: boolean
}

const navItems = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '📖', label: 'Reading', path: '/reading' },
  { icon: '🎤', label: 'Reading Coach', path: '/reading-coach' },
  { icon: '📚', label: 'Story Summariser', path: '/story-summariser' },
  { icon: '📱', label: 'AR Game', path: '/ar-game' },
  { icon: '🎮', label: 'Games', path: '/games' },
  { icon: '🤖', label: 'AI Assistant', path: '/assistant' },
  { icon: '🧠', label: 'Word Analysis', path: '/word-analysis' },
  { icon: '🔤', label: 'Spelling', path: '/spelling-patterns' },
  { icon: '🎨', label: 'Visual Learning', path: '/visual-learning' },
  { icon: '📊', label: 'Progress', path: '/progress' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
]

/**
 * MainLayout Component
 *
 * Provides consistent layout for all protected pages including:
 * - Quick Settings Toolbar (floating, always accessible)
 * - Navigation bar (top)
 * - Responsive container
 * - Proper spacing and structure
 */
export function MainLayout({ children, showQuickSettings = true }: MainLayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-dyslexia-cream">
      {/* Quick Settings Toolbar - Floating */}
      {showQuickSettings && <QuickSettingsToolbar />}

      {/* Navigation Bar */}
      <DyslexiaCard variant="flat" padding="sm" className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <span className="font-bold text-dyslexia-calmBlue">NeuroVidya</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-dyslexia-calmBlue text-white'
                        : 'text-dyslexia-dark hover:bg-dyslexia-lightBlue'
                    }`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Mobile Menu Button - could add toggle later */}
            <DyslexiaButton size="sm" variant="ghost" className="md:hidden">
              ☰
            </DyslexiaButton>
          </div>
        </div>
      </DyslexiaCard>

      {/* Main Content */}
      <div className="main-layout__content">
        {children}
      </div>

      <style>{`
        .main-layout__content {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  )
}
