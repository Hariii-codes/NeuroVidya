import { DyslexiaText } from '@/components/common/DyslexiaText'
import { useTTS } from '@/hooks/useTTS'
import { useReadingStore } from '@/stores/readingStore'
import { usePreferenceStore } from '@/stores/preferenceStore'

export function TTSControl() {
  const { currentText } = useReadingStore()
  const { speechSpeed } = usePreferenceStore()
  const { isPlaying, isPaused, speak, pause, resume, stop, isSupported } = useTTS()

  if (!isSupported) {
    return (
      <div className="bg-dyslexia-softOrange bg-opacity-20 border-l-4 border-dyslexia-softOrange p-4 rounded-lg">
        <DyslexiaText size="md">
          Text-to-speech is not available in your browser. Try Chrome or Edge.
        </DyslexiaText>
      </div>
    )
  }

  const handlePlay = () => {
    if (currentText) {
      if (isPaused) {
        resume()
      } else if (!isPlaying) {
        speak(currentText)
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!isPlaying ? (
        <button
          onClick={handlePlay}
          disabled={!currentText}
          className="bg-dyslexia-calmBlue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>▶</span>
          <DyslexiaText size="md">Play</DyslexiaText>
        </button>
      ) : (
        <>
          {isPaused ? (
            <button
              onClick={resume}
              className="bg-dyslexia-calmBlue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <span>▶</span>
              <DyslexiaText size="md">Resume</DyslexiaText>
            </button>
          ) : (
            <button
              onClick={pause}
              className="bg-dyslexia-calmBlue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <span>⏸</span>
              <DyslexiaText size="md">Pause</DyslexiaText>
            </button>
          )}
          <button
            onClick={stop}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <span>⏹</span>
            <DyslexiaText size="md">Stop</DyslexiaText>
          </button>
        </>
      )}

      {/* Speed indicator */}
      <div className="ml-4 px-4 py-2 bg-dyslexia-pastelBlue rounded-lg">
        <DyslexiaText size="md">
          Speed: {speechSpeed}x
        </DyslexiaText>
      </div>
    </div>
  )
}
