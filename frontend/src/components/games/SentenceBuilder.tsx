// frontend/src/components/games/SentenceBuilder.tsx
import { useState } from 'react';
import { DyslexiaText } from '@/components/common/DyslexiaText';
import { useGameStore } from '@/stores/gameStore';

interface SentenceGame {
  id: string;
  correctSentence: string;
  shuffledWords: string[];
  hintImage?: string;
  difficulty: 'easy' | 'medium';
}

// Mock data - sentence building games
const mockGames: SentenceGame[] = [
  {
    id: '1',
    correctSentence: 'The cat is sleeping',
    shuffledWords: ['cat', 'the', 'sleeping', 'is'],
    hintImage: '😺',
    difficulty: 'easy'
  },
  {
    id: '2',
    correctSentence: 'I like to read books',
    shuffledWords: ['read', 'books', 'I', 'like', 'to'],
    hintImage: '📚',
    difficulty: 'easy'
  },
  {
    id: '3',
    correctSentence: 'The sun is bright today',
    shuffledWords: ['bright', 'sun', 'today', 'The', 'is'],
    hintImage: '☀️',
    difficulty: 'medium'
  },
  {
    id: '4',
    correctSentence: 'Dogs are good friends',
    shuffledWords: ['good', 'are', 'Dogs', 'friends'],
    hintImage: '🐕',
    difficulty: 'medium'
  },
];

export function SentenceBuilder() {
  const { score, addPoints, endGame } = useGameStore();
  const [currentGame, setCurrentGame] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  const game = mockGames[currentGame];

  // Initialize game
  useState(() => {
    setAvailableWords([...game.shuffledWords]);
    setPlacedWords([]);
  });

  const handlePlaceWord = (word: string, index: number) => {
    setPlacedWords([...placedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (index: number) => {
    const word = placedWords[index];
    setAvailableWords([...availableWords, word]);
    setPlacedWords(placedWords.filter((_, i) => i !== index));
  };

  const checkAnswer = () => {
    const sentence = placedWords.join(' ');
    if (sentence === game.correctSentence) {
      addPoints(12);
      setFeedback(`✓ Perfect! "${game.correctSentence}"`);
      setTimeout(() => {
        setFeedback(null);
        if (currentGame < mockGames.length - 1) {
          setCurrentGame(currentGame + 1);
          const nextGame = mockGames[currentGame + 1];
          setAvailableWords([...nextGame.shuffledWords]);
          setPlacedWords([]);
        } else {
          endGame(score + 12, 100);
        }
      }, 1500);
    } else {
      setFeedback('Not quite. Try rearranging the words!');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const resetPuzzle = () => {
    setAvailableWords([...game.shuffledWords]);
    setPlacedWords([]);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Game Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <DyslexiaText size="md" className="opacity-70">Sentence {currentGame + 1} of {mockGames.length}</DyslexiaText>
          </div>
          <div className="text-right">
            <DyslexiaText size="lg" className="font-bold text-dyslexia-calmBlue">Score: {score}</DyslexiaText>
          </div>
        </div>
      </div>

      {/* Hint Image */}
      {game.hintImage && (
        <div className="text-center mb-6">
          <div className="text-6xl">{game.hintImage}</div>
          <DyslexiaText size="md" className="opacity-70 mt-2">
            What sentence describes this?
          </DyslexiaText>
        </div>
      )}

      {/* Sentence Building Area */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <DyslexiaText size="md" className="mb-4 block opacity-70">
          Build the sentence:
        </DyslexiaText>
        <div className="min-h-[100px] bg-dyslexia-cream rounded-xl p-4 flex flex-wrap gap-3 items-center justify-center">
          {placedWords.length === 0 ? (
            <DyslexiaText size="md" className="opacity-50">Click words below to build your sentence</DyslexiaText>
          ) : (
            placedWords.map((word, index) => (
              <button
                key={index}
                onClick={() => handleRemoveWord(index)}
                className="bg-dyslexia-calmBlue text-white px-4 py-2 rounded-lg font-medium text-lg hover:bg-blue-600 transition-colors"
              >
                {word}
              </button>
            ))
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={checkAnswer}
            disabled={placedWords.length !== game.shuffledWords.length}
            className="flex-1 bg-dyslexia-softGreen text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Sentence
          </button>
          <button
            onClick={resetPuzzle}
            className="px-6 py-3 border-2 border-dyslexia-calmBlue text-dyslexia-calmBlue rounded-lg font-medium hover:bg-dyslexia-pastelBlue transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Available Words */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <DyslexiaText size="md" className="mb-4 block opacity-70">
          Available words:
        </DyslexiaText>
        <div className="flex flex-wrap gap-3 justify-center">
          {availableWords.map((word, index) => (
            <button
              key={index}
              onClick={() => handlePlaceWord(word, index)}
              className="bg-white border-4 border-dyslexia-softOrange px-4 py-2 rounded-lg font-medium text-lg hover:bg-dyslexia-lightYellow transition-all hover:scale-105 active:scale-95"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Sentence Tips */}
      <div className="mt-6 bg-dyslexia-pastelGreen rounded-xl p-4">
        <DyslexiaText size="md" className="font-bold mb-2">Sentence Tips:</DyslexiaText>
        <ul className="list-disc list-inside space-y-1">
          <li><DyslexiaText size="md">Sentences start with a capital letter</DyslexiaText></li>
          <li><DyslexiaText size="md">A sentence needs a subject (who/what) and an action</DyslexiaText></li>
        </ul>
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
