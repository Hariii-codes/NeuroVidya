// frontend/src/components/games/GameSelector.tsx
import { DyslexiaText } from '@/components/common/DyslexiaText';
import { type GameType } from '@/types';

const games = [
  { type: 'WORD_IMAGE_MATCHING' as const, icon: '🖼️', title: 'Word & Picture', description: 'Match words to images' },
  { type: 'LETTER_RECOGNITION' as const, icon: '🔤', title: 'Letter Detective', description: 'Find similar letters' },
  { type: 'SYLLABLE_BUILDER' as const, icon: '🧩', title: 'Syllable Builder', description: 'Build words from parts' },
  { type: 'SENTENCE_BUILDER' as const, icon: '📝', title: 'Sentence Maker', description: 'Put words in order' },
  { type: 'ILLUSTRATED_STORY' as const, icon: '📚', title: 'Picture Stories', description: 'Read with pictures' },
  { type: 'VISUAL_CONCEPT' as const, icon: '🧠', title: 'Concept Maps', description: 'Learn visually' },
];

interface GameSelectorProps {
  onSelect: (type: GameType) => void;
}

export function GameSelector({ onSelect }: GameSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <button
          key={game.type}
          onClick={() => onSelect(game.type)}
          className="bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-dyslexia-calmBlue"
        >
          <div className="text-4xl mb-3">{game.icon}</div>
          <DyslexiaText as="h3" size="lg" className="mb-2">
            {game.title}
          </DyslexiaText>
          <DyslexiaText size="md" className="opacity-70">
            {game.description}
          </DyslexiaText>
        </button>
      ))}
    </div>
  );
}
