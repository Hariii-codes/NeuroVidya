// frontend/src/components/assistant/QuickQuestions.tsx
import { DyslexiaText } from '@/components/common/DyslexiaText';

const quickQuestions = [
  'Explain photosynthesis',
  'What is a fraction?',
  'How do plants grow?',
  'What is democracy?',
];

interface QuickQuestionsProps {
  onQuestionClick: (question: string) => void;
}

export function QuickQuestions({ onQuestionClick }: QuickQuestionsProps) {
  return (
    <div className="p-4 bg-dyslexia-cream">
      <DyslexiaText size="md" className="mb-3 opacity-70">
        Or try asking:
      </DyslexiaText>
      <div className="flex flex-wrap gap-2">
        {quickQuestions.map((question) => (
          <button
            key={question}
            onClick={() => onQuestionClick(question)}
            className="px-4 py-2 bg-white border border-dyslexia-calmBlue text-dyslexia-calmBlue rounded-full hover:bg-dyslexia-calmBlue hover:text-white transition-colors"
          >
            <DyslexiaText size="sm">{question}</DyslexiaText>
          </button>
        ))}
      </div>
    </div>
  );
}
