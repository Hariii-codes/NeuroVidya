// frontend/src/components/games/WordImageMatching.tsx
import { useState, useEffect } from 'react';
import { DyslexiaText } from '@/components/common/DyslexiaText';
import { useGameStore } from '@/stores/gameStore';

interface WordImageGame {
  id: string;
  image: string;
  correctWord: string;
  options: string[];
}

export function WordImageMatching() {
  const { score, addPoints, endGame, reset } = useGameStore();
  const [currentGame, setCurrentGame] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [games, setGames] = useState<WordImageGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE}/games/word-images`);
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      } else {
        // Fallback mock data
        setGames(getMockData());
      }
    } catch {
      setGames(getMockData());
    }
    setLoading(false);
  };

  const getMockData = (): WordImageGame[] => [
    { id: '1', image: '🍎', correctWord: 'Apple', options: ['Apple', 'Banana', 'Orange', 'Grape'] },
    { id: '2', image: '🐕', correctWord: 'Dog', options: ['Dog', 'Cat', 'Bird', 'Fish'] },
    { id: '3', image: '🌞', correctWord: 'Sun', options: ['Sun', 'Moon', 'Star', 'Cloud'] },
    { id: '4', image: '📖', correctWord: 'Book', options: ['Book', 'Pen', 'Paper', 'Desk'] },
    { id: '5', image: '🏠', correctWord: 'House', options: ['House', 'Car', 'Tree', 'Road'] },
    { id: '6', image: '💧', correctWord: 'Water', options: ['Water', 'Fire', 'Air', 'Earth'] },
  ];

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (games.length === 0) {
    return <div className="text-center p-8">No games available</div>;
  }

  const game = games[currentGame];

  const handleAnswer = (answer: string) => {
    if (answer === game.correctWord) {
      addPoints(10);
      setFeedback('✓ Correct!');
      setTimeout(() => {
        setFeedback(null);
        if (currentGame < games.length - 1) {
          setCurrentGame(currentGame + 1);
        } else {
          endGame(score + 10, 100);
        }
      }, 1000);
    } else {
      setFeedback('Try again!');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const restart = () => {
    reset();
    setCurrentGame(0);
    setFeedback(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-8xl mb-4">{game.image}</div>
        <DyslexiaText size="xl">What is this?</DyslexiaText>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {game.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="bg-white border-2 border-dyslexia-calmBlue rounded-xl p-6 text-xl hover:bg-dyslexia-pastelBlue transition-colors"
          >
            <DyslexiaText size="lg">{option}</DyslexiaText>
          </button>
        ))}
      </div>

      {feedback && (
        <div className="mt-6 text-center">
          <DyslexiaText size="xl" className={feedback.includes('✓') ? 'text-dyslexia-softGreen' : 'text-dyslexia-softOrange'}>
            {feedback}
          </DyslexiaText>
        </div>
      )}

      <div className="mt-6 text-center">
        <DyslexiaText size="lg">Score: {score}</DyslexiaText>
      </div>
    </div>
  );
}
