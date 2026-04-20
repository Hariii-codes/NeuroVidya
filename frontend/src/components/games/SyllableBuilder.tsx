// frontend/src/components/games/SyllableBuilder.tsx
import { useState } from 'react';
import { DyslexiaText } from '@/components/common/DyslexiaText';
import { useGameStore } from '@/stores/gameStore';

interface SyllableGame {
  id: string;
  targetWord: string;
  syllables: string[];
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Mock data - syllable building games
const mockGames: SyllableGame[] = [
  {
    id: '1',
    targetWord: 'information',
    syllables: ['in', 'for', 'ma', 'tion'],
    hint: 'Something you learn from reading',
    difficulty: 'medium'
  },
  {
    id: '2',
    targetWord: 'basketball',
    syllables: ['bas', 'ket', 'ball'],
    hint: 'A sport with hoops',
    difficulty: 'easy'
  },
  {
    id: '3',
    targetWord: 'celebration',
    syllables: ['cel', 'e', 'bra', 'tion'],
    hint: 'A happy event',
    difficulty: 'hard'
  },
  {
    id: '4',
    targetWord: 'adventure',
    syllables: ['ad', 'ven', 'ture'],
    hint: 'An exciting journey',
    difficulty: 'medium'
  },
];

export function SyllableBuilder() {
  const { score, addPoints, endGame } = useGameStore();
  const [currentGame, setCurrentGame] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shuffledSyllables, setShuffledSyllables] = useState<string[]>([]);
  const [placedSyllables, setPlacedSyllables] = useState<string[]>([]);
  const [availableSyllables, setAvailableSyllables] = useState<string[]>([]);

  const game = mockGames[currentGame];

  // Initialize game on mount and when game changes
  useState(() => {
    const shuffled = [...game.syllables].sort(() => Math.random() - 0.5);
    setShuffledSyllables(shuffled);
    setAvailableSyllables(shuffled);
    setPlacedSyllables([]);
  });

  const handlePlaceSyllable = (syllable: string, index: number) => {
    setPlacedSyllables([...placedSyllables, syllable]);
    setAvailableSyllables(availableSyllables.filter((_, i) => i !== index));
  };

  const handleRemoveSyllable = (index: number) => {
    const syllable = placedSyllables[index];
    setAvailableSyllables([...availableSyllables, syllable]);
    setPlacedSyllables(placedSyllables.filter((_, i) => i !== index));
  };

  const checkAnswer = () => {
    const answer = placedSyllables.join('');
    if (answer === game.targetWord) {
      addPoints(15);
      setFeedback(`✓ Correct! ${game.targetWord}`);
      setTimeout(() => {
        setFeedback(null);
        if (currentGame < mockGames.length - 1) {
          setCurrentGame(currentGame + 1);
          const nextGame = mockGames[currentGame + 1];
          const shuffled = [...nextGame.syllables].sort(() => Math.random() - 0.5);
          setShuffledSyllables(shuffled);
          setAvailableSyllables(shuffled);
          setPlacedSyllables([]);
        } else {
          endGame(score + 15, 100);
        }
      }, 1500);
    } else {
      setFeedback('Not quite right. Try again!');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const resetPuzzle = () => {
    setAvailableSyllables(shuffledSyllables);
    setPlacedSyllables([]);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Game Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <DyslexiaText size="md" className="opacity-70">Puzzle {currentGame + 1} of {mockGames.length}</DyslexiaText>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded text-sm ${
                game.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                game.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {game.difficulty}
              </span>
            </div>
          </div>
          <div className="text-right">
            <DyslexiaText size="lg" className="font-bold text-dyslexia-calmBlue">Score: {score}</DyslexiaText>
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className="bg-dyslexia-pastelBlue rounded-xl p-4 mb-6 text-center">
        <DyslexiaText size="md">💡 Hint: {game.hint}</DyslexiaText>
      </div>

      {/* Answer Area */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <DyslexiaText size="md" className="mb-4 block opacity-70">
          Drag syllables in order to make the word:
        </DyslexiaText>
        <div className="min-h-[80px] bg-dyslexia-cream rounded-xl p-4 flex flex-wrap gap-3 items-center justify-center">
          {placedSyllables.length === 0 ? (
            <DyslexiaText size="md" className="opacity-50">Place syllables here</DyslexiaText>
          ) : (
            placedSyllables.map((syllable, index) => (
              <button
                key={index}
                onClick={() => handleRemoveSyllable(index)}
                className="bg-dyslexia-calmBlue text-white px-4 py-2 rounded-lg font-bold text-xl hover:bg-blue-600 transition-colors"
              >
                {syllable}
              </button>
            ))
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={checkAnswer}
            disabled={placedSyllables.length !== game.syllables.length}
            className="flex-1 bg-dyslexia-softGreen text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
          <button
            onClick={resetPuzzle}
            className="px-6 py-3 border-2 border-dyslexia-calmBlue text-dyslexia-calmBlue rounded-lg font-medium hover:bg-dyslexia-pastelBlue transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Available Syllables */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <DyslexiaText size="md" className="mb-4 block opacity-70">
          Available syllables:
        </DyslexiaText>
        <div className="flex flex-wrap gap-3 justify-center">
          {availableSyllables.map((syllable, index) => (
            <button
              key={index}
              onClick={() => handlePlaceSyllable(syllable, index)}
              className="bg-white border-4 border-dyslexia-softGreen px-5 py-3 rounded-lg font-bold text-xl hover:bg-dyslexia-pastelGreen transition-all hover:scale-105 active:scale-95"
            >
              {syllable}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mt-6 text-center p-4 rounded-xl ${
          feedback.includes('✓')
            ? 'bg-dyslexia-softGreen bg-opacity-20'
            : 'bg-dyslexia-softOrange bg-opacity-20'
        }`}>
          <DyslexiaText size="xl" className={
            feedback.includes('✓') ? 'text-dyslexia-softGreen' : 'text-dyslexia-softOrange'
          }>
            {feedback}
          </DyslexiaText>
        </div>
      )}
    </div>
  );
}
