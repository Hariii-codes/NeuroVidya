import { useState } from 'react'
import { DyslexiaText } from '@/components/common/DyslexiaText'
import { useReadingStore } from '@/stores/readingStore'
import { OCRScanner } from '@/components/ocr/OCRScanner'

export function TextInputArea() {
  const { setText } = useReadingStore()
  const [inputText, setInputText] = useState('')
  const [showOCR, setShowOCR] = useState(false)

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
    } catch (error) {
      console.error('Failed to read clipboard:', error)
    }
  }

  const handleSubmit = () => {
    if (inputText.trim()) {
      setText(inputText)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <DyslexiaText as="h3" size="lg" className="mb-4">
          Add Your Text
        </DyslexiaText>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type your text here..."
          className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-dyslexia-calmBlue focus:outline-none resize-none text-lg"
          style={{
            fontFamily: 'Lexend, sans-serif',
            lineHeight: 1.6,
            letterSpacing: '0.12em',
          }}
        />

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim()}
            className="flex-1 bg-dyslexia-calmBlue text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Reading
          </button>
          <button
            onClick={handlePaste}
            className="px-6 py-3 border-2 border-dyslexia-calmBlue text-dyslexia-calmBlue rounded-lg font-medium hover:bg-dyslexia-pastelBlue transition-colors"
          >
            Paste
          </button>
          <button
            onClick={() => setShowOCR(true)}
            className="px-6 py-3 border-2 border-dyslexia-calmBlue text-dyslexia-calmBlue rounded-lg font-medium hover:bg-dyslexia-pastelBlue transition-colors"
          >
            📷 Scan OCR
          </button>
        </div>
      </div>

      {showOCR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Scan Textbook Page</h3>
              <button
                onClick={() => setShowOCR(false)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                                        ×
              </button>
            </div>
            <OCRScanner />
          </div>
        </div>
      )}
    </>
  )
}
