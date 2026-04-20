import { useNavigate } from 'react-router-dom'
import { DyslexiaCard, DyslexiaHeading, DyslexiaText } from '@/design-system'

interface Exercise {
  id: string
  title: string
  type: 'reading' | 'game' | 'ai'
  icon: string
  time: string
  path: string
}

const suggestedExercises: Exercise[] = [
  {
    id: '1',
    title: 'Practice Letter Recognition',
    type: 'game',
    icon: '🔤',
    time: '5 min',
    path: '/games?type=letter-recognition',
  },
  {
    id: '2',
    title: 'Read a Short Story',
    type: 'reading',
    icon: '📚',
    time: '10 min',
    path: '/reading',
  },
  {
    id: '3',
    title: 'Ask About Photosynthesis',
    type: 'ai',
    icon: '🌱',
    time: '5 min',
    path: '/assistant',
  },
]

export function SuggestedExercises() {
  const navigate = useNavigate()

  return (
    <DyslexiaCard variant="elevated" padding="lg" icon="💡">
      <DyslexiaHeading level={3} className="mb-4">
        Suggested For You
      </DyslexiaHeading>

      <div className="space-y-3">
        {suggestedExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => navigate(exercise.path)}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-dyslexia-text-secondary hover:border-dyslexia-accent cursor-pointer transition-colors"
          >
            <div className="text-3xl">{exercise.icon}</div>
            <div className="flex-1">
              <DyslexiaText weight="medium">
                {exercise.title}
              </DyslexiaText>
              <DyslexiaText size="sm" className="opacity-70">
                {exercise.time}
              </DyslexiaText>
            </div>
            <div className="text-dyslexia-accent text-xl">
              →
            </div>
          </div>
        ))}
      </div>
    </DyslexiaCard>
  )
}
