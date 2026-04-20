// frontend/src/components/ocr/OCRScanner.tsx
import { useState, useRef } from 'react';
import { DyslexiaText } from '@/components/common/DyslexiaText';
import { ocrService } from '@/services/ocr';
import { useReadingStore } from '@/stores/readingStore';

export function OCRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setText } = useReadingStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Scan image
    setIsScanning(true);
    try {
      const result = await ocrService.scanImage(file);

      if (result.confidence < 70) {
        alert('The text is not very clear. Try a brighter photo or hold the camera steadier.');
      }

      setText(result.text);
    } catch (error) {
      console.error('OCR error:', error);
      alert('Could not read text from image. Please try again with a clearer photo.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <DyslexiaText as="h3" size="lg" className="mb-4">
        Scan Textbook Page
      </DyslexiaText>

      <div className="border-2 border-dashed border-dyslexia-calmBlue rounded-xl p-8 text-center">
        {preview ? (
          <div className="space-y-4">
            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
            <DyslexiaText size="md" className="text-dyslexia-calmBlue">
              Image captured! Text extracted below.
            </DyslexiaText>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-4">📷</div>
            <DyslexiaText size="lg" className="mb-2">
              Take a photo of your textbook
            </DyslexiaText>
            <DyslexiaText size="md" className="opacity-70">
              We'll extract the text so you can use reading tools
            </DyslexiaText>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="mt-4 bg-dyslexia-calmBlue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isScanning ? 'Scanning...' : preview ? 'Scan Another' : 'Take Photo'}
        </button>
      </div>

      <div className="mt-4 p-4 bg-dyslexia-pastelBlue rounded-lg">
        <DyslexiaText size="md">
          💡 <strong>Tip:</strong> Hold your camera steady and make sure there's good lighting for best results.
        </DyslexiaText>
      </div>
    </div>
  );
}
