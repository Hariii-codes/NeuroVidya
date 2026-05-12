// frontend/src/components/games/LetterRecognition.tsx
import { useState } from 'react';
import { DyslexiaText } from '@/components/common/DyslexiaText';
import { useGameStore } from '@/stores/gameStore';

interface LetterGame {
  id: string;
  targetLetter: string;
  options: string[];
  type: 'similar-letters' | 'uppercase-lowercase';
  hint?: string;
}

// Mock data - commonly confused letters for dyslexic learners
const mockGames: LetterGame[] = [
  { id: '1', targetLetter: 'b', options: ['b', 'd', 'p', 'q'], type: 'similar-letters' },
  { id: '2', targetLetter: 'd', options: ['b', 'd', 'p', 'q'], type: 'similar-letters' },
  { id: '3', targetLetter: 'p', options: ['b', 'd', 'p', 'q'], type: 'similar-letters' },
  { id: '4', targetLetter: 'q', options: ['b', 'd', 'p', 'q'], type: 'similar-letters' },
  { id: '5', targetLetter: 'm', options: ['m', 'n', 'w', 'u'], type: 'similar-letters' },
  { id: '6', targetLetter: 'n', options: ['m', 'n', 'h', 'u'], type: 'similar-letters' },
  { id: '7', targetLetter: 'A', options: ['A', 'a', 'R', 'r'], type: 'uppercase-lowercase' },
  { id: '8', targetLetter: 'E', options: ['E', 'e', 'F', 'f'], type: 'uppercase-lowercase' },
];

export function LetterRecognition() {
  const { score, addPoints, endGame } = useGameStore();
  const [currentGame, setCurrentGame] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showTarget, _setShowTarget] = useState(true);
  const [streak, setStreak] = useState(0);

  const game = mockGames[currentGame];

  const handleAnswer = (answer: string) => {
    if (answer === game.targetLetter) {
      const points = 10 + streak * 2; // Bonus for streak
      addPoints(points);
      setStreak(streak + 1);
      setFeedback(`✓ Correct! ${game.targetLetter === answer ? 'Great!' : ''}`);

      setTimeout(() => {
        setFeedback(null);
        if (currentGame < mockGames.length - 1) {
          setCurrentGame(currentGame + 1);
        } else {
          endGame(score + points, 100);
        }
      }, 1200);
    } else {
      setStreak(0);
      setFeedback(`That's ${answer}. Find ${game.targetLetter}`);
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Game Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <DyslexiaText size="md" className="opacity-70">Question {currentGame + 1} of {mockGames.length}</DyslexiaText>
          </div>
          <div className="text-right">
            <DyslexiaText size="lg" className="font-bold text-dyslexia-calmBlue">Score: {score}</DyslexiaText>
            {streak > 0 && (
              <DyslexiaText size="md" className="text-dyslexia-softOrange">🔥 {streak} streak!</DyslexiaText>
            )}
          </div>
        </div>
      </div>

      {/* Target Letter Display */}
      {showTarget && (
        <div className="text-center mb-8">
          <div className="bg-dyslexia-pastelBlue rounded-2xl p-8 inline-block">
            <DyslexiaText size="md" className="mb-2 block opacity-70">
              Find this letter:
            </DyslexiaText>
            <div className="text-9xl font-bold text-dyslexia-calmBlue">
              {game.targetLetter}
            </div>
          </div>

          {game.type === 'similar-letters' && (
            <div className="mt-4 text-dyslexia-softOrange">
              <DyslexiaText size="md">
                Tip: Look carefully! These letters can look similar.
              </DyslexiaText>
            </div>
          )}
        </div>
      )}

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {game.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="bg-white border-4 border-dyslexia-calmBlue rounded-2xl p-8 text-center hover:bg-dyslexia-pastelBlue transition-all hover:scale-105 active:scale-95"
          >
            <div className="text-7xl font-bold text-dyslexia-darkGray mb-2">
              {option}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center p-4 rounded-xl ${
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

      {/* Letter Tips */}
      <div className="mt-8 bg-dyslexia-lightYellow rounded-xl p-4">
        <DyslexiaText size="md" className="font-bold mb-2">Letter Tips:</DyslexiaText>
        <DyslexiaText size="md">
          {game.targetLetter === 'b' && "b has a belly - it sticks out to the right"}
          {game.targetLetter === 'd' && "d stands tall - the line goes up"}
          {game.targetLetter === 'p' && "p has a paddle at the bottom"}
          {game.targetLetter === 'q' && "q has a question mark tail"}
          {game.targetLetter === 'm' && "m has two mountains"}
          {game.targetLetter === 'n' && "n has one mountain"}
          {game.targetLetter === 'A' && "A points up like a mountain"}
          {game.targetLetter === 'E' && "E has three legs"}
        </DyslexiaText>
      </div>
    </div>
  );
}
