/**
 * ComicPanel Component
 *
 * Displays a single comic panel with realistic illustration, caption, and audio controls.
 */

import React, { useState } from 'react';
import { ComicPanel as ComicPanelType } from '../../stores/storySummariserStore';

interface ComicPanelProps {
  panel: ComicPanelType;
  panelNumber: number;
  isActive: boolean;
  onPlayNarration: (panelNumber: number, onStart: () => void, onEnd: () => void) => void;
}

// Get illustration URL from the illustration string
function getIllustrationUrl(illustration: string, category: string): string {
  // Remove .png extension if present
  const cleanIllustration = illustration.replace('.png', '');

  // Extract the concept (after the last slash if present)
  // Input format: "category/concept.png" or just "concept"
  const concept = cleanIllustration.split('/').pop() || cleanIllustration;

  // Use static Unsplash images based on concept (more reliable than source.unsplash.com)
  const conceptImages: Record<string, string> = {
    'sun': 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&h=350&fit=crop&auto=format',
    'earth': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=350&fit=crop&auto=format',
    'rain': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&h=350&fit=crop&auto=format',
    'tree': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=350&fit=crop&auto=format',
    'clouds': 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&h=350&fit=crop&auto=format',
    'water': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=350&fit=crop&auto=format',
    'reading': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=350&fit=crop&auto=format',
    'writing': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=350&fit=crop&auto=format',
    'school': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=350&fit=crop&auto=format',
    'home': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=350&fit=crop&auto=format',
    'play': 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&h=350&fit=crop&auto=format',
    'ancient': 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&h=350&fit=crop&auto=format',
    'war': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=350&fit=crop&auto=format',
    'king': 'https://images.unsplash.com/photo-1555565368-50f897ca4f6a?w=800&h=350&fit=crop&auto=format',
    'transport': 'https://images.unsplash.com/photo-149497638531-d1058494cdd8?w=800&h=350&fit=crop&auto=format',
    'bird': 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&h=350&fit=crop&auto=format',
    'dog': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&h=350&fit=crop&auto=format',
    'cat': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=350&fit=crop&auto=format',
    'fish': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&h=350&fit=crop&auto=format',
    'mountain': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=350&fit=crop&auto=format',
    'snow': 'https://images.unsplash.com/photo-1518182170546-0766ce6fec56?w=800&h=350&fit=crop&auto=format',
    'story': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=350&fit=crop&auto=format',
    'plot': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=350&fit=crop&auto=format',
    'character': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=350&fit=crop&auto=format',
    'scene': 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=350&fit=crop&auto=format',
    'hero': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=350&fit=crop&auto=format',
    'fight': 'https://images.unsplash.com/photo-1555565368-50f897ca4f6a?w=800&h=350&fit=crop&auto=format',
    'chase': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=350&fit=crop&auto=format',
    'running': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=350&fit=crop&auto=format',
    'thinking': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=350&fit=crop&auto=format',
    'talking': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=350&fit=crop&auto=format',
  };

  // Return concept-specific image, or fallback to category, or use search API
  return conceptImages[concept] ||
    conceptImages[category] ||
    `https://source.unsplash.com/featured/?${concept}&w=800&h=350&fit=crop`;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({
  panel,
  panelNumber,
  isActive,
  onPlayNarration
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const imageUrl = getIllustrationUrl(panel.illustration, panel.category);
  const description = panel.caption.substring(0, 50) + (panel.caption.length > 50 ? '...' : '');

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
            <span className="px-2 py-1 bg-slate-700 rounded text-xs uppercase tracking-wide">{panel.category}</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Illustration Area with Realistic Image */}
        <div className="relative bg-white min-h-[350px] overflow-hidden">
          {/* Image - always show, with fallback on error */}
          <img
            src={imageUrl}
            alt={description}
            className="w-full h-[350px] object-cover"
            onError={(e) => {
              console.log('[ComicPanel] Image failed to load:', imageUrl);
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          {/* Fallback when image fails to load (hidden by default) */}
          <div className="w-full h-[350px] bg-gradient-to-br from-slate-200 to-slate-300 items-center justify-center" style={{display: 'none'}}>
            <div className="text-center">
              <div className="text-6xl mb-2">📖</div>
              <p className="text-slate-600 text-sm">{description}</p>
            </div>
          </div>

          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Description badge */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <span className="text-lg">📖</span>
                  {description}
                </p>
                <p className="text-xs text-slate-500 mt-1">Photo from Unsplash</p>
              </div>
            </div>

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
