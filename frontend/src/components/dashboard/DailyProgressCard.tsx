import { DyslexiaCard, DyslexiaHeading, DyslexiaStatsCard } from '@/design-system'

interface DailyProgressCardProps {
  readingTime: number // minutes
  wordsRead: number // count
  dailyGoal: number // words
}

export function DailyProgressCard({ readingTime, wordsRead, dailyGoal }: DailyProgressCardProps) {
  const progress = Math.min((wordsRead / dailyGoal) * 100, 100)

  return (
    <DyslexiaCard variant="elevated" padding="lg" icon="📊">
      <DyslexiaHeading level={3} className="mb-4">
        Today's Progress
      </DyslexiaHeading>

      <div className="flex items-center gap-6">
        {/* Progress circle */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#E8F4FC"
              strokeWidth="12"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#5C8DF6"
              strokeWidth="12"
              strokeDasharray={`${progress * 3.52} 352`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-dyslexia-calmBlue">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2">
          <DyslexiaStatsCard value={`${readingTime} min`} label="Reading Time" />
          <DyslexiaStatsCard value={`${wordsRead} / ${dailyGoal}`} label="Words Read" />
          <DyslexiaStatsCard
            value={wordsRead >= dailyGoal ? '✓ Complete!' : 'In Progress'}
            label="Daily Goal"
          />
        </div>
      </div>
    </DyslexiaCard>
  )
}
