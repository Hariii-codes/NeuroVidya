import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PhonicsTutorPage.css';

interface Phoneme {
  symbol: string;
  sound: string;
  exampleWords: string[];
  mouthPosition: string;
  commonMistakes: string[];
  difficulty: string;
}

interface LetterData {
  id: string;
  letter: string;
  phonemes: Phoneme[];
  visualAid: string;
  practiceTips: string[];
}

interface VideoResponse {
  letterId: string;
  phonemeSymbol: string;
  videoUrl: string | null;
  isPreGenerated: boolean;
  posterUrl: string | null;
  duration: number | null;
}

const PhonicsTutorPage: React.FC = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState<LetterData[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<LetterData | null>(null);
  const [selectedPhonemeIndex, setSelectedPhonemeIndex] = useState<number>(0);
  const [videoData, setVideoData] = useState<VideoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [videoLoading, setVideoLoading] = useState<boolean>(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [masteredLetters, setMasteredLetters] = useState<Set<string>>(new Set());

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

  useEffect(() => {
    fetchLetters();
    loadProgress();
  }, [difficultyFilter]);

  useEffect(() => {
    if (selectedLetter) {
      fetchVideo(selectedLetter.id, selectedPhonemeIndex);
    }
  }, [selectedLetter, selectedPhonemeIndex]);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const endpoint = difficultyFilter === 'all'
        ? `${API_BASE}/api/phonics-tutor/letters`
        : `${API_BASE}/api/phonics-tutor/difficulty/${difficultyFilter}`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setLetters(data);
      }
    } catch (error) {
      console.error('Error fetching letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideo = async (letterId: string, phonemeIndex: number) => {
    try {
      setVideoLoading(true);
      const response = await fetch(
        `${API_BASE}/api/phonics-tutor/video/${letterId}?phoneme_index=${phonemeIndex}`
      );
      if (response.ok) {
        const data = await response.json();
        setVideoData(data);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setVideoLoading(false);
    }
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('phonicsProgress');
    if (saved) {
      const progress = JSON.parse(saved);
      setMasteredLetters(new Set(progress.mastered || []));
    }
  };

  const saveProgress = (letterId: string) => {
    const newMastered = new Set(masteredLetters);
    newMastered.add(letterId);
    setMasteredLetters(newMastered);
    localStorage.setItem('phonicsProgress', JSON.stringify({
      mastered: Array.from(newMastered)
    }));
  };

  const handleLetterClick = (letter: LetterData) => {
    setSelectedLetter(letter);
    setSelectedPhonemeIndex(0);
  };

  const handleMarkMastered = () => {
    if (selectedLetter) {
      saveProgress(selectedLetter.id);
    }
  };

  const currentPhoneme = selectedLetter?.phonemes[selectedPhonemeIndex];

  return (
    <div className="phonics-tutor-page">
      {/* Header */}
      <div className="phonics-header">
        <button
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
        <h1>🎯 Phonics Tutor</h1>
        <p>Learn letter sounds with mouth movement videos</p>
      </div>

      <div className="phonics-content">
        {/* Letters Grid */}
        <div className="letters-section">
          <div className="filter-bar">
            <label>Difficulty:</label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">All Letters</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading letters...</div>
          ) : (
            <div className="letters-grid">
              {letters.map((letter) => (
                <button
                  key={letter.id}
                  className={`letter-card ${
                    selectedLetter?.id === letter.id ? 'selected' : ''
                  } ${masteredLetters.has(letter.id) ? 'mastered' : ''}`}
                  onClick={() => handleLetterClick(letter)}
                >
                  <div className="letter-text">{letter.letter}</div>
                  {masteredLetters.has(letter.id) && (
                    <div className="mastered-badge">✓</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video & Details Panel */}
        {selectedLetter && currentPhoneme && (
          <div className="details-panel">
            <div className="letter-header">
              <h2>Letter: {selectedLetter.letter}</h2>
              {selectedLetter.phonemes.length > 1 && (
                <div className="phoneme-selector">
                  {selectedLetter.phonemes.map((_, index) => (
                    <button
                      key={index}
                      className={`phoneme-btn ${
                        selectedPhonemeIndex === index ? 'active' : ''
                      }`}
                      onClick={() => setSelectedPhonemeIndex(index)}
                    >
                      Sound {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Video Player */}
            <div className="video-section">
              {videoLoading ? (
                <div className="video-placeholder">
                  <div className="loading-spinner">Loading video...</div>
                </div>
              ) : videoData?.videoUrl ? (
                <video
                  className="phonics-video"
                  controls
                  poster={videoData.posterUrl || undefined}
                  preload="metadata"
                >
                  <source src={videoData.videoUrl} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="video-placeholder">
                  <p>🎬 Video coming soon!</p>
                  <p className="placeholder-text">
                    This phonics video will be generated with MeiGen-MultiTalk
                  </p>
                </div>
              )}
            </div>

            {/* Phoneme Details */}
            <div className="phoneme-details">
              <div className="detail-section">
                <h3>🔊 Sound: /{currentPhoneme.symbol}/</h3>
                <p className="sound-name">{currentPhoneme.sound.replace(/_/g, ' ')}</p>
              </div>

              <div className="detail-section">
                <h3>👄 Mouth Position</h3>
                <p>{currentPhoneme.mouthPosition}</p>
              </div>

              <div className="detail-section">
                <h3>📝 Example Words</h3>
                <div className="words-list">
                  {currentPhoneme.exampleWords.map((word, index) => (
                    <span key={index} className="example-word">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {currentPhoneme.commonMistakes.length > 0 && (
                <div className="detail-section warning">
                  <h3>⚠️ Common Mistakes</h3>
                  <ul>
                    {currentPhoneme.commonMistakes.map((mistake, index) => (
                      <li key={index}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedLetter.practiceTips.length > 0 && (
                <div className="detail-section tips">
                  <h3>💡 Practice Tips</h3>
                  <ul>
                    {selectedLetter.practiceTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="detail-section">
                <h3>🎨 Visual Aid</h3>
                <p>{selectedLetter.visualAid}</p>
              </div>

              <div className="action-buttons">
                <button
                  className={`master-btn ${masteredLetters.has(selectedLetter.id) ? 'mastered' : ''}`}
                  onClick={handleMarkMastered}
                  disabled={masteredLetters.has(selectedLetter.id)}
                >
                  {masteredLetters.has(selectedLetter.id) ? '✓ Mastered!' : 'Mark as Mastered'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhonicsTutorPage;
