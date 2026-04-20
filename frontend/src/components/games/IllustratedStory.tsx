// frontend/src/components/games/IllustratedStory.tsx
import { useState } from 'react';
import { DyslexiaText } from '@/components/common/DyslexiaText';
import { useGameStore } from '@/stores/gameStore';

interface StoryPage {
  image: string;
  sentence: string;
  wordHighlights?: {
    word: string;
    definition: string;
  }[];
}

interface IllustratedStory {
  id: string;
  title: string;
  readingLevel: 'elementary' | 'middle' | 'high';
  topic: string;
  pages: StoryPage[];
  quiz?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

// Mock story data
const mockStories: IllustratedStory[] = [
  {
    id: 'story-1',
    title: 'The Little Seed',
    readingLevel: 'elementary',
    topic: 'nature',
    pages: [
      {
        image: '🌱',
        sentence: 'A little seed sleeps in the soil.',
        wordHighlights: [
          { word: 'seed', definition: 'A small part of a plant that can grow into a new plant' },
          { word: 'soil', definition: 'The dirt that plants grow in' }
        ]
      },
      {
        image: '🌧️',
        sentence: 'The rain falls and waters the seed.',
        wordHighlights: [
          { word: 'waters', definition: 'To give water to plants' }
        ]
      },
      {
        image: '☀️',
        sentence: 'The sun warms the soil and helps it grow.',
        wordHighlights: [
          { word: 'warms', definition: 'Makes something warm' }
        ]
      },
      {
        image: '🌱',
        sentence: 'A small green sprout pushes up from the ground!',
        wordHighlights: [
          { word: 'sprout', definition: 'A young plant that just starts growing' }
        ]
      },
      {
        image: '🌻',
        sentence: 'The seed grows into a beautiful flower!',
        wordHighlights: []
      }
    ],
    quiz: [
      {
        question: 'What does the seed need to grow?',
        options: ['Only sun', 'Rain and sun', 'Only rain', 'Nothing'],
        correctAnswer: 1
      },
      {
        question: 'What comes out of the ground first?',
        options: ['A flower', 'A sprout', 'A fruit', 'A leaf'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'story-2',
    title: 'The Brave Cat',
    readingLevel: 'elementary',
    topic: 'adventure',
    pages: [
      {
        image: '😺',
        sentence: 'There was once a small cat named Whiskers.',
        wordHighlights: [
          { word: 'once', definition: 'One time in the past' }
        ]
      },
      {
        image: '🌳',
        sentence: 'Whiskers liked to climb tall trees.',
        wordHighlights: [
          { word: 'climb', definition: 'To go up something using hands and feet' }
        ]
      },
      {
        image: '😰',
        sentence: 'One day, Whiskers climbed too high and got stuck!',
        wordHighlights: [
          { word: 'stuck', definition: 'Not able to move or go anywhere' }
        ]
      },
      {
        image: '🚒',
        sentence: 'A firefighter came and helped Whiskers down.',
        wordHighlights: [
          { word: 'firefighter', definition: 'A person who puts out fires and helps people' }
        ]
      },
      {
        image: '😸',
        sentence: 'Whiskers was happy to be safe on the ground.',
        wordHighlights: [
          { word: 'safe', definition: 'Not in danger' }
        ]
      }
    ],
    quiz: [
      {
        question: 'What was the cat\'s name?',
        options: ['Fluffy', 'Whiskers', 'Tom', 'Max'],
        correctAnswer: 1
      },
      {
        question: 'Who helped the cat?',
        options: ['A doctor', 'A firefighter', 'A teacher', 'A friend'],
        correctAnswer: 1
      }
    ]
  }
];

export function IllustratedStory() {
  const { score, addPoints, endGame } = useGameStore();
  const [currentStory, setCurrentStory] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const story = mockStories[currentStory];
  const page = story.pages[currentPage];
  const isLastPage = currentPage === story.pages.length - 1;
  const quiz = story.quiz ?? [];

  const handleNext = () => {
    if (isLastPage && quiz) {
      setShowQuiz(true);
    } else if (isLastPage && !quiz) {
      // Move to next story or end game
      if (currentStory < mockStories.length - 1) {
        setCurrentStory(currentStory + 1);
        setCurrentPage(0);
      } else {
        endGame(score + 20, 100);
      }
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const currentQuiz = quiz![0]; // Simple one-quiz-per-story for now

    if (answerIndex === currentQuiz.correctAnswer) {
      addPoints(10);
      setFeedback('✓ Correct! Great job!');
      setTimeout(() => {
        setFeedback(null);
        setShowQuiz(false);
        setSelectedAnswer(null);
        if (currentStory < mockStories.length - 1) {
          setCurrentStory(currentStory + 1);
          setCurrentPage(0);
        } else {
          endGame(score + 10, 100);
        }
      }, 1500);
    } else {
      setFeedback('Not quite. Try again!');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Story Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <DyslexiaText size="lg" className="font-bold text-dyslexia-calmBlue">
              {story.title}
            </DyslexiaText>
            <DyslexiaText size="md" className="opacity-70">
              Page {currentPage + 1} of {story.pages.length}
            </DyslexiaText>
          </div>
          <div className="text-right">
            <DyslexiaText size="lg" className="font-bold text-dyslexia-calmBlue">Score: {score}</DyslexiaText>
          </div>
        </div>
      </div>

      {!showQuiz ? (
        <>
          {/* Story Page */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-center mb-8">
              <div className="text-9xl mb-4">{page.image}</div>
              <DyslexiaText size="xl" className="text-dyslexia-darkGray">
                {page.sentence}
              </DyslexiaText>
            </div>

            {/* Word Highlights */}
            {page.wordHighlights && page.wordHighlights.length > 0 && (
              <div className="bg-dyslexia-pastelBlue rounded-xl p-4">
                <DyslexiaText size="md" className="font-bold mb-2">Click to learn new words:</DyslexiaText>
                <div className="flex flex-wrap gap-2">
                  {page.wordHighlights.map((highlight, index) => (
                    <button
                      key={index}
                      onClick={() => alert(`${highlight.word}: ${highlight.definition}`)}
                      className="bg-white px-3 py-2 rounded-lg border-2 border-dyslexia-calmBlue hover:bg-dyslexia-calmBlue hover:text-white transition-colors"
                    >
                      <DyslexiaText size="md">{highlight.word}</DyslexiaText>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleBack}
              disabled={currentPage === 0}
              className="px-6 py-3 border-2 border-dyslexia-calmBlue text-dyslexia-calmBlue rounded-lg font-medium hover:bg-dyslexia-pastelBlue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-dyslexia-calmBlue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              {isLastPage && quiz ? 'Take Quiz' : 'Next →'}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Quiz */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <DyslexiaText as="h3" size="xl" className="mb-6 text-center">
              Quiz Time! 🎯
            </DyslexiaText>
            {quiz.map((q, qIndex) => (
              <div key={qIndex}>
                <DyslexiaText size="lg" className="mb-4 text-center">
                  {q.question}
                </DyslexiaText>
                <div className="space-y-3">
                  {q.options.map((option, oIndex) => (
                    <button
                      key={oIndex}
                      onClick={() => handleQuizAnswer(oIndex)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                        selectedAnswer === oIndex
                          ? selectedAnswer === q.correctAnswer
                            ? 'bg-dyslexia-softGreen border-dyslexia-softGreen'
                            : 'bg-red-100 border-red-400'
                          : 'border-dyslexia-calmBlue hover:bg-dyslexia-pastelBlue'
                      }`}
                    >
                      <DyslexiaText size="md">{option}</DyslexiaText>
                    </button>
                  ))}
                </div>
              </div>
            ))}

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
        </>
      )}
    </div>
  );
}
