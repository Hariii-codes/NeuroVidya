import { Link } from 'react-router-dom'
import { DyslexiaCard, DyslexiaHeading, DyslexiaText, DyslexiaCardGrid } from '@/design-system'
import { useAuthStore } from '@/stores/authStore'
import { DailyProgressCard } from '@/components/dashboard/DailyProgressCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { StreakDisplay } from '@/components/dashboard/StreakDisplay'
import { SuggestedExercises } from '@/components/dashboard/SuggestedExercises'

export function DashboardPage() {
  const { user } = useAuthStore()

  // Mock data - will be replaced with real API calls
  const mockProgress = {
    readingTime: 15,
    wordsRead: 350,
    dailyGoal: 500,
  }

  const mockStreak = {
    currentStreak: 3,
    longestStreak: 7,
  }

  return (
    <div className="min-h-screen">
      {/* Header - User Info and Settings Link */}
      <DyslexiaCard variant="flat" padding="md" className="mb-6">
        <div className="flex items-center justify-between">
          <DyslexiaHeading level={1} className="m-0">
            NeuroVidya
          </DyslexiaHeading>
          <div className="flex items-center gap-4">
            <DyslexiaText>
              {user?.name || user?.email}
            </DyslexiaText>
            <Link
              to="/settings"
              className="dyslexia-button dyslexia-button--link dyslexia-button--accent"
            >
              Settings
            </Link>
          </div>
        </div>
      </DyslexiaCard>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <DyslexiaCard variant="elevated" padding="lg" className="mb-8">
          <DyslexiaHeading level={2} className="mb-2">
            Welcome back, {user?.name || user?.email}!
          </DyslexiaHeading>
          <DyslexiaText size="lg">
            Ready to continue your learning journey?
          </DyslexiaText>
        </DyslexiaCard>

        {/* Dashboard Grid */}
        <DyslexiaCardGrid columns={3} gap="lg">
          {/* Progress Card */}
          <div className="space-y-6">
            <DailyProgressCard {...mockProgress} />
            <StreakDisplay {...mockStreak} />
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Suggested Exercises */}
          <SuggestedExercises />
        </DyslexiaCardGrid>
      </main>
    </div>
  )
}

export default DashboardPage
