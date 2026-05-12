import { Link } from 'react-router-dom'
import { DyslexiaCard, DyslexiaHeading, DyslexiaButtonGroup } from '@/design-system'

interface QuickAction {
  icon: string
  label: string
  path: string
  color: string
}

const actions: QuickAction[] = [
  { icon: '📖', label: 'Reading', path: '/reading', color: 'bg-dyslexia-calmBlue' },
  { icon: '🎤', label: 'Reading Coach', path: '/reading-coach', color: 'bg-blue-600' },
  { icon: '📚', label: 'Story Summariser', path: '/story-summariser', color: 'bg-purple-600' },
  { icon: '📱', label: 'AR Game', path: '/ar-game', color: 'bg-indigo-600' },
  { icon: '🎮', label: 'Games', path: '/games', color: 'bg-dyslexia-softGreen' },
  { icon: '🤖', label: 'Ask AI', path: '/assistant', color: 'bg-purple-500' },
  { icon: '📊', label: 'Progress', path: '/progress', color: 'bg-orange-500' },
]

export function QuickActions() {
  return (
    <DyslexiaCard variant="elevated" padding="lg" icon="⚡">
      <DyslexiaHeading level={3} className="mb-4">
        Quick Actions
      </DyslexiaHeading>

      <DyslexiaButtonGroup orientation="vertical">
        {actions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className={`${action.color} rounded-xl p-6 text-center hover:opacity-90 transition-opacity`}
          >
            <div className="text-4xl mb-2">{action.icon}</div>
            <div className="text-white font-medium">
              {action.label}
            </div>
          </Link>
        ))}
      </DyslexiaButtonGroup>
    </DyslexiaCard>
  )
}
