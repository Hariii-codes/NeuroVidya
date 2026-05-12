// frontend/src/components/analytics/StatsOverview.tsx
import { DyslexiaText } from '@/components/common/DyslexiaText';

interface StatsOverviewProps {
  readingSpeed?: number;
  spellingAccuracy?: number;
  gamesCompleted: number;
  totalTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  todayReadingTime: number;
  todayWordsRead: number;
}

export function StatsOverview({
  readingSpeed,
  spellingAccuracy,
  gamesCompleted,
  totalTimeMinutes,
  currentStreak,
  longestStreak,
  todayReadingTime,
  todayWordsRead,
}: StatsOverviewProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const stats = [
    {
      label: 'Reading Speed',
      value: readingSpeed ? `${readingSpeed} WPM` : '--',
      icon: '📖',
      color: 'bg-dyslexia-calmBlue',
    },
    {
      label: 'Spelling Accuracy',
      value: spellingAccuracy ? `${spellingAccuracy}%` : '--',
      icon: '✓',
      color: 'bg-dyslexia-softGreen',
    },
    {
      label: 'Games Played',
      value: gamesCompleted.toString(),
      icon: '🎮',
      color: 'bg-purple-500',
    },
    {
      label: 'Total Learning Time',
      value: formatTime(totalTimeMinutes),
      icon: '⏱️',
      color: 'bg-dyslexia-softOrange',
    },
  ];

  return (
    <>
      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">{stat.icon}</div>
              <DyslexiaText size="md" className="opacity-70">
                {stat.label}
              </DyslexiaText>
            </div>
            <DyslexiaText size="xl" className="font-bold">
              {stat.value}
            </DyslexiaText>
          </div>
        ))}
      </div>

      {/* Today's Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <DyslexiaText as="h3" size="lg" className="mb-4">
          Today's Progress
        </DyslexiaText>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <DyslexiaText size="md" className="opacity-70 mb-1">
              Reading Time
            </DyslexiaText>
            <DyslexiaText size="xl" className="font-bold text-dyslexia-calmBlue">
              {todayReadingTime} minutes
            </DyslexiaText>
          </div>
          <div>
            <DyslexiaText size="md" className="opacity-70 mb-1">
              Words Read
            </DyslexiaText>
            <DyslexiaText size="xl" className="font-bold text-dyslexia-calmBlue">
              {todayWordsRead} words
            </DyslexiaText>
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <DyslexiaText as="h3" size="lg" className="mb-2">
              Your Streak
            </DyslexiaText>
            <DyslexiaText size="xl" className="font-bold">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </DyslexiaText>
            {currentStreak > 0 && (
              <DyslexiaText size="md" className="opacity-90 mt-1">
                Best: {longestStreak} days
              </DyslexiaText>
            )}
          </div>
          <div className="text-6xl">🔥</div>
        </div>
        {currentStreak === 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <DyslexiaText size="md">
              Start learning today to build your streak!
            </DyslexiaText>
          </div>
        )}
      </div>
    </>
  );
}
