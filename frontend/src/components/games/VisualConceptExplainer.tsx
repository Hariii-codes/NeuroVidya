// frontend/src/components/games/VisualConceptExplainer.tsx
import { useState } from 'react';
import { DyslexiaText } from '@/components/common/DyslexiaText';
import { useGameStore } from '@/stores/gameStore';

interface ConceptStep {
  label: string;
  visual: string;
  explanation: string;
}

interface VisualConcept {
  id: string;
  title: string;
  category: string;
  steps: ConceptStep[];
  summary?: string;
}

// Mock visual concepts
const mockConcepts: VisualConcept[] = [
  {
    id: 'water-cycle',
    title: 'The Water Cycle',
    category: 'science',
    steps: [
      {
        label: 'Evaporation',
        visual: '💧↑',
        explanation: 'The sun warms water in rivers and oceans. The water turns into gas and rises up.'
      },
      {
        label: 'Condensation',
        visual: '☁️',
        explanation: 'The water gas cools down in the sky and forms clouds.'
      },
      {
        label: 'Precipitation',
        visual: '🌧️',
        explanation: 'Water falls from clouds as rain, snow, or hail.'
      },
      {
        label: 'Collection',
        visual: '🌊💧',
        explanation: 'Water flows into rivers, lakes, and oceans. Then the cycle starts again.'
      }
    ],
    summary: 'Water keeps moving from Earth to sky and back again. This is the water cycle.'
  },
  {
    id: 'plant-growth',
    title: 'How Plants Grow',
    category: 'science',
    steps: [
      {
        label: 'Seed',
        visual: '🌱',
        explanation: 'A seed is planted in soil. It needs water and sun to start growing.'
      },
      {
        label: 'Roots',
        visual: '🌱📏',
        explanation: 'Roots grow down into the soil. They drink water and nutrients for the plant.'
      },
      {
        label: 'Sprout',
        visual: '🌱➡️🌿',
        explanation: 'A small green sprout pushes up from the ground toward the sun.'
      },
      {
        label: 'Leaves',
        visual: '🌿☀️',
        explanation: 'Leaves grow and catch sunlight. The plant uses sunlight to make food.'
      },
      {
        label: 'Flower',
        visual: '🌸',
        explanation: 'The plant grows flowers. Flowers can make seeds to start new plants.'
      }
    ],
    summary: 'Plants start as seeds, grow roots and leaves, and make flowers to create new seeds.'
  },
  {
    id: 'butterfly-life',
    title: 'Butterfly Life Cycle',
    category: 'nature',
    steps: [
      {
        label: 'Egg',
        visual: '🥚',
        explanation: 'A butterfly lays an egg on a leaf. The egg is very small.'
      },
      {
        label: 'Caterpillar',
        visual: '🐛',
        explanation: 'A caterpillar hatches from the egg. It eats lots of leaves to grow big.'
      },
      {
        label: 'Chrysalis',
        visual: '🔄',
        explanation: 'The caterpillar makes a hard shell called a chrysalis. It rests inside.'
      },
      {
        label: 'Butterfly',
        visual: '🦋',
        explanation: 'A beautiful butterfly comes out! It can now fly and find flowers.'
      }
    ],
    summary: 'A butterfly starts as an egg, becomes a caterpillar, rests in a chrysalis, and emerges as a butterfly.'
  }
];

export function VisualConceptExplainer() {
  const { score, addPoints, endGame } = useGameStore();
  const [currentConcept, setCurrentConcept] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);

  const concept = mockConcepts[currentConcept];
  const step = concept.steps[currentStep];
  const isLastStep = currentStep === concept.steps.length - 1;
  const isLastConcept = currentConcept === mockConcepts.length - 1;

  const handleNext = () => {
    setCompletedSteps(new Set([...completedSteps, currentStep]));

    if (isLastStep) {
      setShowQuiz(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuizComplete = () => {
    addPoints(15);
    setShowQuiz(false);
    setCurrentStep(0);
    setCompletedSteps(new Set());

    if (isLastConcept) {
      endGame(score + 15, 100);
    } else {
      setCurrentConcept(currentConcept + 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Concept Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <DyslexiaText size="lg" className="font-bold text-dyslexia-calmBlue">
              {concept.title}
            </DyslexiaText>
            <DyslexiaText size="md" className="opacity-70">
              Step {currentStep + 1} of {concept.steps.length}
            </DyslexiaText>
          </div>
          <div className="text-right">
            <DyslexiaText size="lg" className="font-bold text-dyslexia-calmBlue">Score: {score}</DyslexiaText>
          </div>
        </div>
      </div>

      {!showQuiz ? (
        <>
          {/* Step Progress */}
          <div className="flex justify-center gap-2 mb-6">
            {concept.steps.map((_, index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  completedSteps.has(index) || index === currentStep
                    ? 'bg-dyslexia-calmBlue text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                <DyslexiaText size="md">{index + 1}</DyslexiaText>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-center mb-8">
              <div className="text-9xl mb-6">{step.visual}</div>
              <DyslexiaText as="h3" size="xl" className="mb-4 text-dyslexia-calmBlue">
                {step.label}
              </DyslexiaText>
              <div className="bg-dyslexia-cream rounded-xl p-6">
                <DyslexiaText size="lg">
                  {step.explanation}
                </DyslexiaText>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-3 border-2 border-dyslexia-calmBlue text-dyslexia-calmBlue rounded-lg font-medium hover:bg-dyslexia-pastelBlue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-dyslexia-calmBlue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              {isLastStep ? 'Take Quiz' : 'Next →'}
            </button>
          </div>

          {/* Concept Summary (shown on last step) */}
          {isLastStep && concept.summary && (
            <div className="bg-dyslexia-pastelGreen rounded-xl p-6">
              <DyslexiaText as="h4" size="lg" className="mb-2">
                Summary:
              </DyslexiaText>
              <DyslexiaText size="md">
                {concept.summary}
              </DyslexiaText>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Quiz */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <DyslexiaText as="h3" size="xl" className="mb-6 text-center">
              Quick Quiz! 🎯
            </DyslexiaText>
            <div className="space-y-6">
              <div className="bg-dyslexia-cream rounded-xl p-4">
                <DyslexiaText size="md" className="mb-3">
                  Can you put these steps in order?
                </DyslexiaText>
                <div className="grid grid-cols-2 gap-3">
                  {concept.steps.map((step, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg border-2 border-dyslexia-calmBlue"
                    >
                      <DyslexiaText size="md" className="font-bold">
                        {index + 1}. {step.label}
                      </DyslexiaText>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-dyslexia-cream rounded-xl p-4">
                <DyslexiaText size="md" className="mb-3">
                  What does this concept explain?
                </DyslexiaText>
                <div className="grid gap-2">
                  {[
                    concept.title,
                    'A different topic',
                    'Something else',
                  ].map((option, index) => (
                    <button
                      key={index}
                      onClick={() => index === 0 && handleQuizComplete()}
                      className="w-full p-3 bg-white rounded-lg border-2 border-dyslexia-calmBlue hover:bg-dyslexia-pastelBlue transition-colors text-left"
                    >
                      <DyslexiaText size="md">{option}</DyslexiaText>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleQuizComplete}
                className="w-full py-4 bg-dyslexia-softGreen text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
              >
                I'm Ready! ✓
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
