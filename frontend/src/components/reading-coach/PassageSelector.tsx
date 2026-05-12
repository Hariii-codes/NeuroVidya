/**
 * PassageSelector Component
 *
 * Displays reading passages library with filtering options.
 */

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import { useReadingCoachStore } from '../../stores/readingCoachStore';
import type { ReadingPassage } from '../../types/reading-coach';

export const PassageSelector: React.FC = () => {
  const { setCurrentPassage, clearCurrentSession } = useReadingCoachStore();
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [filteredPassages, setFilteredPassages] = useState<ReadingPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load passages
  useEffect(() => {
    loadPassages();
  }, []);

  // Filter passages
  useEffect(() => {
    let filtered = passages;

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(p => p.readingLevel === selectedLevel);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredPassages(filtered);
  }, [passages, selectedLevel, selectedCategory]);

  const loadPassages = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ passages: ReadingPassage[] }>('/reading-coach/passages');
      if (response.success && response.data) {
        setPassages(response.data.passages);
      }
    } catch (error) {
      console.error('Failed to load passages:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectPassage = (passage: ReadingPassage) => {
    clearCurrentSession();
    setCurrentPassage(passage);
  };

  const levels = ['all', 'elementary', 'middle', 'high'];
  const categories = ['all', ...Array.from(new Set(passages.map(p => p.category)))];

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'elementary': return 'bg-green-100 text-green-800';
      case 'middle': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Reading Passages</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {levels.map(level => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500">Loading passages...</p>
        </div>
      ) : (
        <>
          {/* Passage Count */}
          <p className="text-sm text-gray-500 mb-4">
            {filteredPassages.length} passage{filteredPassages.length !== 1 ? 's' : ''} found
          </p>

          {/* Passage Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPassages.map((passage) => (
              <div
                key={passage.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer transition-colors"
                onClick={() => selectPassage(passage)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{passage.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(passage.readingLevel)}`}>
                    {passage.readingLevel}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {passage.text}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{passage.category}</span>
                  <span>{passage.wordCount} words</span>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredPassages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No passages match your filters.</p>
              <button
                onClick={() => {
                  setSelectedLevel('all');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-blue-500 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
