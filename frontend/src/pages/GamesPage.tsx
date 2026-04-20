import { useState } from 'react'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { GameSelector } from '@/components/games/GameSelector'
import { WordImageMatching } from '@/components/games/WordImageMatching'
import { LetterRecognition } from '@/components/games/LetterRecognition'
import { SyllableBuilder } from '@/components/games/SyllableBuilder'
import { SentenceBuilder } from '@/components/games/SentenceBuilder'
import { IllustratedStory } from '@/components/games/IllustratedStory'
import { VisualConceptExplainer } from '@/components/games/VisualConceptExplainer'
import { DyslexiaCard, DyslexiaHeading, DyslexiaText, DyslexiaButton } from '@/design-system'
import { useGameStore } from '@/stores/gameStore'
import { Link } from 'react-router-dom'
import type { GameType } from '@/types'

const gameComponents: Record<GameType, React.ComponentType> = {
  WORD_IMAGE_MATCHING: WordImageMatching,
  LETTER_RECOGNITION: LetterRecognition,
  SYLLABLE_BUILDER: SyllableBuilder,
  SENTENCE_BUILDER: SentenceBuilder,
  ILLUSTRATED_STORY: IllustratedStory,
  VISUAL_CONCEPT: VisualConceptExplainer,
}

export function GamesPage() {
  const { reset } = useGameStore()
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null)

  const handleSelectGame = (type: GameType) => {
    setSelectedGame(type)
    reset()
  }

  const handleBack = () => {
    setSelectedGame(null)
    reset()
  }

  const GameComponent = selectedGame ? gameComponents[selectedGame] : null

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        {!selectedGame ? (
          <>
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
                  Visual Learning Games
                </DyslexiaHeading>
              </div>
            </DyslexiaCard>

            <main className="container mx-auto px-6 py-8">
              <DyslexiaCard variant="elevated" padding="lg" className="mb-8" icon="🎮">
                <DyslexiaHeading level={2} className="mb-2">
                  Choose a Game
                </DyslexiaHeading>
                <DyslexiaText size="lg">
                  Learn through play! Each game helps you practice different skills.
                </DyslexiaText>
              </DyslexiaCard>

              {/* Specialized Learning Tools */}
              <DyslexiaCard variant="flat" padding="md" className="mb-8">
                <DyslexiaHeading level={3} className="mb-4">
                  🎯 Specialized Learning Tools
                </DyslexiaHeading>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/word-analysis" className="block">
                    <DyslexiaCard variant="elevated" padding="md" hover className="hover:shadow-lg transition-all">
                      <div className="text-3xl mb-2">🧠</div>
                      <DyslexiaText size="md">Word Analysis</DyslexiaText>
                      <DyslexiaText size="sm" className="opacity-70">Check word difficulty</DyslexiaText>
                    </DyslexiaCard>
                  </Link>
                  <Link to="/spelling-patterns" className="block">
                    <DyslexiaCard variant="elevated" padding="md" hover className="hover:shadow-lg transition-all">
                      <div className="text-3xl mb-2">🔤</div>
                      <DyslexiaText size="md">Spelling Patterns</DyslexiaText>
                      <DyslexiaText size="sm" className="opacity-70">Error patterns</DyslexiaText>
                    </DyslexiaCard>
                  </Link>
                  <Link to="/visual-learning" className="block">
                    <DyslexiaCard variant="elevated" padding="md" hover className="hover:shadow-lg transition-all">
                      <div className="text-3xl mb-2">🎨</div>
                      <DyslexiaText size="md">Visual Learning</DyslexiaText>
                      <DyslexiaText size="sm" className="opacity-70">Concept diagrams</DyslexiaText>
                    </DyslexiaCard>
                  </Link>
                </div>
              </DyslexiaCard>

              <GameSelector onSelect={handleSelectGame} />
            </main>
          </>
        ) : (
          <main className="container mx-auto px-6 py-8">
            <DyslexiaCard variant="flat" padding="md" className="mb-6">
              <DyslexiaButton
                variant="ghost"
                onClick={handleBack}
              >
                ← Choose a different game
              </DyslexiaButton>
            </DyslexiaCard>
            {GameComponent && <GameComponent />}
          </main>
        )}
      </div>
    </ProtectedRoute>
  )
}
