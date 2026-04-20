import { DyslexiaText } from '@/components/common/DyslexiaText'

interface ReadingMetricsProps {
  metrics: {
    wpm: number
    difficultyScore: number
    wordCount: number
    duration: number
    hesitations: number
  }
}

export function ReadingMetrics({ metrics }: ReadingMetricsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Easy'
    if (score >= 50) return 'Moderate'
    return 'Challenging'
  }

  const getWpmLabel = (wpm: number) => {
    if (wpm >= 150) return 'Excellent'
    if (wpm >= 120) return 'Good'
    if (wpm >= 80) return 'Average'
    return 'Needs Practice'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
      <DyslexiaText as="h3" size="lg" className="mb-4">
        Reading Session Complete!
      </DyslexiaText>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dyslexia-cream rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Speed</div>
          <DyslexiaText as="div" size="xl" className="font-bold">
            {Math.round(metrics.wpm)} WPM
          </DyslexiaText>
          <div className="text-xs text-gray-500 mt-1">{getWpmLabel(metrics.wpm)}</div>
        </div>

        <div className="bg-dyslexia-cream rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Difficulty</div>
          <DyslexiaText as="div" size="xl" className={`font-bold ${getScoreColor(metrics.difficultyScore)}`}>
            {metrics.difficultyScore}/100
          </DyslexiaText>
          <div className="text-xs text-gray-500 mt-1">{getScoreLabel(metrics.difficultyScore)}</div>
        </div>

        <div className="bg-dyslexia-cream rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Words</div>
          <DyslexiaText as="div" size="xl" className="font-bold">
            {metrics.wordCount}
          </DyslexiaText>
          <div className="text-xs text-gray-500 mt-1">Read</div>
        </div>

        <div className="bg-dyslexia-cream rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Pauses</div>
          <DyslexiaText as="div" size="xl" className="font-bold">
            {metrics.hesitations}
          </DyslexiaText>
          <div className="text-xs text-gray-500 mt-1">Hesitations</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-dyslexia-pastelBlue rounded-lg">
        <div className="text-sm text-gray-700">
          Time spent: <span className="font-bold">{Math.floor(metrics.duration / 60)}:{String(Math.floor(metrics.duration % 60)).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  )
}
