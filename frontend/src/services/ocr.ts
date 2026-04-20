// frontend/src/services/ocr.ts
import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

class BookScanner {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('eng');
    }
  }

  async scanImage(imageFile: File): Promise<OCRResult> {
    await this.initialize();

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      const result = await this.worker.recognize(imageFile);
      return {
        text: result.data.text,
        confidence: result.data.confidence,
      };
    } catch (error) {
      console.error('OCR error:', error);
      throw new Error('Failed to scan image. Please try a clearer photo.');
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new BookScanner();
