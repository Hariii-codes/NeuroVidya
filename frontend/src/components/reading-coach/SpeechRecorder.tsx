/**
 * SpeechRecorder Component
 *
 * Controls speech recording with start/stop buttons.
 * Shows recording status and real-time transcript.
 */

import React, { useEffect, useRef } from 'react';
import { useReadingCoachStore } from '../../stores/readingCoachStore';

export const SpeechRecorder: React.FC = () => {
  const {
    isRecording,
    spokenText,
    startRecording,
    stopRecording,
    errorMessage
  } = useReadingCoachStore();

  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [spokenText]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Recording Controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Read Aloud</h2>
          <p className="text-gray-600">
            {isRecording ? 'Listening...' : 'Press start and read the passage'}
          </p>
        </div>

        <div className="flex gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              aria-label="Start recording"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
              </svg>
              Start Reading
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors animate-pulse"
              aria-label="Stop recording"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 rounded-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          <span className="text-red-700 font-medium">Recording in progress...</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
          <p className="text-orange-800">{errorMessage}</p>
        </div>
      )}

      {/* Real-time Transcript */}
      <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[120px] max-h-[240px] overflow-y-auto bg-gray-50">
        {spokenText ? (
          <p ref={transcriptRef} className="text-lg text-gray-800 leading-relaxed">
            {spokenText}
          </p>
        ) : (
          <p className="text-gray-400 italic">
            {isRecording
              ? 'Listening... Start reading the passage aloud.'
              : 'Your speech will appear here as you read.'}
          </p>
        )}
      </div>

      {/* Word Count */}
      {spokenText && (
        <div className="mt-2 text-sm text-gray-500">
          Words spoken: {spokenText.split(' ').length}
        </div>
      )}
    </div>
  );
};
