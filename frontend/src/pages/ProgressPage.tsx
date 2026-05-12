import { useEffect } from 'react'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { DyslexiaCard, DyslexiaHeading, DyslexiaCardGrid } from '@/design-system'
import { StatsOverview } from '@/components/analytics/StatsOverview'
import { ReadingChart } from '@/components/analytics/ReadingChart'
import { GameScoresChart } from '@/components/analytics/GameScoresChart'
import { useProgressStore } from '@/stores/progressStore'
import { Link } from 'react-router-dom'

export function ProgressPage() {
  const { isLoading, loadProgress } = useProgressStore()

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-dyslexia-cream flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        {/* Header */}
        <DyslexiaCard variant="flat" padding="md" className="mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="dyslexia-button dyslexia-button--link dyslexia-button--ghost"
            >
              ← Back
            </Link>
            <DyslexiaHeading level={1} className="m-0">
              My Progress
            </DyslexiaHeading>
          </div>
        </DyslexiaCard>

        <main className="container mx-auto px-6 py-8">
          {/* Stats Overview */}
          <DyslexiaCard variant="elevated" padding="lg" className="mb-8">
            <StatsOverview
              readingSpeed={0}
              spellingAccuracy={0}
              gamesCompleted={0}
              totalTimeMinutes={0}
              currentStreak={0}
              longestStreak={0}
              todayReadingTime={0}
              todayWordsRead={0}
            />
          </DyslexiaCard>

          {/* Charts Grid */}
          <DyslexiaCardGrid columns={2} gap="lg">
            <DyslexiaCard variant="elevated" padding="lg" icon="📈">
              <DyslexiaHeading level={3} className="mb-4">
                Reading Progress
              </DyslexiaHeading>
              <ReadingChart data={[]} />
            </DyslexiaCard>

            <DyslexiaCard variant="elevated" padding="lg" icon="🏆">
              <DyslexiaHeading level={3} className="mb-4">
                Game Scores
              </DyslexiaHeading>
              <GameScoresChart data={[]} />
            </DyslexiaCard>
          </DyslexiaCardGrid>
        </main>
      </div>
    </ProtectedRoute>
  )
}
