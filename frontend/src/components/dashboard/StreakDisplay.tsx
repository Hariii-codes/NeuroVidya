import { DyslexiaCard, DyslexiaText } from '@/design-system'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <DyslexiaCard variant="elevated" padding="lg" className="!bg-gradient-to-br !from-orange-400 !to-orange-500" icon="🔥">
      <div className="text-white">
        <DyslexiaText size="md" className="opacity-90 mb-1">
          Current Streak
        </DyslexiaText>
        <DyslexiaText size="xl" weight="bold">
          {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
        </DyslexiaText>

        {currentStreak > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <DyslexiaText size="md" className="opacity-90">
              Best: {longestStreak} days
            </DyslexiaText>
          </div>
        )}

        {currentStreak === 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <DyslexiaText size="md">
              Start learning today to build your streak!
            </DyslexiaText>
          </div>
        )}
      </div>
    </DyslexiaCard>
  )
}
