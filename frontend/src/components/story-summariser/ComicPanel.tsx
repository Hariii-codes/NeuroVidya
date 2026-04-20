/**
 * ComicPanel Component
 *
 * Displays a single comic panel with realistic illustration, caption, and audio controls.
 */

import React, { useState } from 'react';
import { useStorySummariserStore, ComicPanel as ComicPanelType } from '../../stores/storySummariserStore';

interface ComicPanelProps {
  panel: ComicPanelType;
  panelNumber: number;
  isActive: boolean;
  onPlayNarration: (panelNumber: number, onStart: () => void, onEnd: () => void) => void;
}

// Realistic illustration mapping with Unsplash images
// Keys match the backend ILLUSTRATION_LIBRARY concepts exactly
const illustrationVisuals: Record<string, {
  imageUrl: string;
  photographer: string;
  description: string;
  category: string;
}> = {
  // NATURE illustrations
  'sun': {
    imageUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&auto=format&fit=crop',
    photographer: 'Timothy Fahey',
    description: 'Sun warming up',
    category: 'nature'
  },
  'water': {
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop',
    photographer: 'Annie Spratt',
    description: 'Water',
    category: 'nature'
  },
  'clouds': {
    imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&auto=format&fit=crop',
    photographer: 'Christopher Robin Ebbinghaus',
    description: 'Clouds',
    category: 'nature'
  },
  'rain': {
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop',
    photographer: 'Jared Brashier',
    description: 'Rain falling',
    category: 'nature'
  },
  'earth': {
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
    photographer: 'NASA',
    description: 'Earth from space',
    category: 'nature'
  },
  'plant': {
    imageUrl: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&auto=format&fit=crop',
    photographer: 'Diana Parkhouse',
    description: 'Growing plant',
    category: 'nature'
  },
  'tree': {
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop',
    photographer: 'Zdeněk Macháček',
    description: 'Tree',
    category: 'nature'
  },
  'mountain': {
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop',
    photographer: 'Jake Melara',
    description: 'Mountain',
    category: 'nature'
  },
  'snow': {
    imageUrl: 'https://images.unsplash.com/photo-1518182170546-0766ce6fec56?w=800&auto=format&fit=crop',
    photographer: 'Jonas Svidras',
    description: 'Snow',
    category: 'nature'
  },

  // SCIENCE illustrations
  'atom': {
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop',
    photographer: 'Eugene Triguba',
    description: 'Atom',
    category: 'science'
  },
  'gravity': {
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop',
    photographer: 'Fotografierende',
    description: 'Gravity',
    category: 'science'
  },
  'space': {
    imageUrl: 'https://images.unsplash.com/photo-1614730341194-75c60740a2d3?w=800&auto=format&fit=crop',
    photographer: 'Denys Nevozhai',
    description: 'Space and planets',
    category: 'science'
  },
  'energy': {
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    photographer: 'Matt Palmer',
    description: 'Energy',
    category: 'science'
  },
  'experiment': {
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop',
    photographer: 'Mufid Majnun',
    description: 'Laboratory',
    category: 'science'
  },
  'light': {
    imageUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&auto=format&fit=crop',
    photographer: 'Kyle Gregory Devaras',
    description: 'Light',
    category: 'science'
  },
  'sound': {
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop',
    photographer: 'Denys Nevozhai',
    description: 'Sound waves',
    category: 'science'
  },
  'heat': {
    imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&auto=format&fit=crop',
    photographer: 'Ganeshrk',
    description: 'Heat and fire',
    category: 'science'
  },

  // HISTORY illustrations
  'ancient': {
    imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&auto=format&fit=crop',
    photographer: 'Aleksandra Sapanovic',
    description: 'Ancient pyramid',
    category: 'history'
  },
  'war': {
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop',
    photographer: 'David Illig',
    description: 'Castle',
    category: 'history'
  },
  'king': {
    imageUrl: 'https://images.unsplash.com/photo-1555565368-50f897ca4f6a?w=800&auto=format&fit=crop',
    photographer: 'Jared Brashier',
    description: 'Royal crown',
    category: 'history'
  },
  'discovery': {
    imageUrl: 'https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?w=800&auto=format&fit=crop',
    photographer: 'Pawel Czerwinski',
    description: 'Compass and discovery',
    category: 'history'
  },
  'ancient-writing': {
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop',
    photographer: 'Craig Tidball',
    description: 'Ancient writing',
    category: 'history'
  },

  // DAILY LIFE illustrations
  'school': {
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop',
    photographer: 'Janko Ferlič',
    description: 'School',
    category: 'daily'
  },
  'home': {
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop',
    photographer: 'Jay Wennington',
    description: 'Home',
    category: 'daily'
  },
  'food': {
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop',
    photographer: 'Elleen Arga',
    description: 'Food',
    category: 'daily'
  },
  'play': {
    imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop',
    photographer: 'Levi Ventura',
    description: 'Playground fun',
    category: 'daily'
  },
  'transport': {
    imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop',
    photographer: 'Jakob Owens',
    description: 'Car',
    category: 'daily'
  },
  'clothes': {
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop',
    photographer: 'Splash of Fashion',
    description: 'Clothes',
    category: 'daily'
  },

  // ANIMALS illustrations
  'dog': {
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop',
    photographer: 'Katelyn Schutz',
    description: 'Dog',
    category: 'animals'
  },
  'cat': {
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop',
    photographer: 'Alvan Nee',
    description: 'Cat',
    category: 'animals'
  },
  'bird': {
    imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&auto=format&fit=crop',
    photographer: 'Mia Baker',
    description: 'Bird',
    category: 'animals'
  },
  'fish': {
    imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&auto=format&fit=crop',
    photographer: 'Glen Carrie',
    description: 'Fish',
    category: 'animals'
  },
  'insect': {
    imageUrl: 'https://images.unsplash.com/photo-1516595659572-095d7f4a6d88?w=800&auto=format&fit=crop',
    photographer: 'Bernadette Wurzinger',
    description: 'Butterfly',
    category: 'animals'
  },

  // ACTIONS illustrations
  'running': {
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop',
    photographer: 'Bruno Nascimento',
    description: 'Running',
    category: 'actions'
  },
  'reading': {
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
    photographer: 'Cesar LaPaz',
    description: 'Reading',
    category: 'actions'
  },
  'writing': {
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop',
    photographer: 'Thought Catalog',
    description: 'Writing',
    category: 'actions'
  },
  'talking': {
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop',
    photographer: 'Shimon Shteingart',
    description: 'Conversation',
    category: 'actions'
  },
  'thinking': {
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop',
    photographer: 'Jared Sluyter',
    description: 'Thinking',
    category: 'actions'
  },

  // ACTION category (for movies, fights, chases)
  'fight': {
    imageUrl: 'https://images.unsplash.com/photo-1555565368-50f897ca4f6a?w=800&auto=format&fit=crop',
    photographer: 'Jared Brashier',
    description: 'Action scene',
    category: 'action'
  },
  'chase': {
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop',
    photographer: 'Bruno Nascimento',
    description: 'Chase scene',
    category: 'action'
  },
  'explosion': {
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    photographer: 'Matt Palmer',
    description: 'Explosion',
    category: 'action'
  },
  'weapon': {
    imageUrl: 'https://images.unsplash.com/photo-1592652426685-36e817a38866?w=800&auto=format&fit=crop',
    photographer: 'Jared Brashier',
    description: 'Action weapon',
    category: 'action'
  },
  'hero': {
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop',
    photographer: 'Krisztian Horvath',
    description: 'Hero',
    category: 'action'
  },

  // MOVIES category
  'film': {
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop',
    photographer: 'Erik Lucatero',
    description: 'Film',
    category: 'movies'
  },
  'director': {
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop',
    photographer: 'Annemarie Grön',
    description: 'Director',
    category: 'movies'
  },
  'actor': {
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop',
    photographer: 'Jared Sluyter',
    description: 'Actor',
    category: 'movies'
  },
  'action': {
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop',
    photographer: 'Erik Lucatero',
    description: 'Action movie',
    category: 'movies'
  },

  // STORY category
  'plot': {
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop',
    photographer: 'Craig Tidball',
    description: 'Story plot',
    category: 'story'
  },
  'character': {
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop',
    photographer: 'Jared Sluyter',
    description: 'Character',
    category: 'story'
  },
  'scene': {
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop',
    photographer: 'Denys Nevozhai',
    description: 'Scene',
    category: 'story'
  },
};

// Get illustration visual from the illustration string
function getIllustrationVisual(illustration: string, category: string) {
  // Remove .png extension if present
  const cleanIllustration = illustration.replace('.png', '');

  // Extract the concept (after the last slash if present)
  // Input format: "category/concept.png" or just "concept"
  const concept = cleanIllustration.split('/').pop() || cleanIllustration;

  console.log('[Illustration Matching]', { illustration, cleanIllustration, concept, category });

  // Try exact concept match first
  if (illustrationVisuals[concept]) {
    console.log('[Illustration] Matched by concept:', concept);
    return illustrationVisuals[concept];
  }

  // Try category/concept format
  const categoryConcept = `${category}/${concept}`;
  if (illustrationVisuals[categoryConcept]) {
    console.log('[Illustration] Matched by category/concept:', categoryConcept);
    return illustrationVisuals[categoryConcept];
  }

  // Try full illustration string match
  if (illustrationVisuals[cleanIllustration]) {
    console.log('[Illustration] Matched by full string:', cleanIllustration);
    return illustrationVisuals[cleanIllustration];
  }

  // Try matching by partial concept name
  const conceptLower = concept.toLowerCase();
  for (const [key, value] of Object.entries(illustrationVisuals)) {
    if (key.toLowerCase().includes(conceptLower) || conceptLower.includes(key.toLowerCase())) {
      console.log('[Illustration] Matched by partial:', key, 'for concept:', concept);
      return value;
    }
  }

  // Fallback to category
  console.warn('[Illustration] No match for:', illustration, 'concept:', concept, 'fallback to category:', category);

  // Try category fallbacks
  const categoryFallbacks: Record<string, string> = {
    'movies': 'film',
    'action': 'fight',
    'story': 'plot'
  };

  return illustrationVisuals[category] || illustrationVisuals[categoryFallbacks[category]] || illustrationVisuals['home'];
}

export const ComicPanel: React.FC<ComicPanelProps> = ({
  panel,
  panelNumber,
  isActive,
  onPlayNarration
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const visual = getIllustrationVisual(panel.illustration, panel.category);

  const handlePlay = () => {
    if (isPlaying) return;

    const handleStart = () => {
      setIsPlaying(true);
    };

    const handleEnd = () => {
      setIsPlaying(false);
    };

    onPlayNarration(panelNumber, handleStart, handleEnd);
  };

  return (
    <div className={`comic-panel ${isActive ? 'active' : ''}`}>
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg overflow-hidden border-4 border-slate-800">
        {/* Panel Header */}
        <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">Panel {panelNumber}</span>
            <span className="px-2 py-1 bg-slate-700 rounded text-xs uppercase tracking-wide">{visual.category}</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Illustration Area with Realistic Image */}
        <div className="relative bg-white min-h-[350px] overflow-hidden">
          {/* Image */}
          <img
            src={visual.imageUrl}
            alt={visual.description}
            className={`w-full h-[350px] object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Loading state */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-500 text-sm">Loading illustration...</p>
              </div>
            </div>
          )}

          {/* Overlay gradient for better text readability */}
          {imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          )}

          {/* Description badge */}
          {imageLoaded && (
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <span className="text-lg">📖</span>
                  {visual.description}
                </p>
                <p className="text-xs text-slate-500 mt-1">Photo by {visual.photographer}</p>
              </div>
            </div>
          )}

          {/* Audio playing indicator */}
          {isPlaying && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
              <span className="text-sm">🔊</span>
              <span className="text-xs font-medium">Playing...</span>
            </div>
          )}
        </div>

        {/* Caption Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <p className="text-sm text-slate-600 leading-relaxed">{panel.caption}</p>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isPlaying
                ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg active:scale-[0.98]'
            }`}
          >
            {isPlaying ? (
              <>
                <span className="text-lg">🔊</span>
                <span>Playing Narration...</span>
              </>
            ) : (
              <>
                <span className="text-lg">🎙️</span>
                <span>Play Narration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
