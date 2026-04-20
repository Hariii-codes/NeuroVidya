// frontend/src/services/ai.ts
import { apiClient } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIExplanation {
  explanation: string;
  examples: string[];
  visualSuggestion?: string;
}

class AIService {
  async chat(message: string, history: ChatMessage[]): Promise<string> {
    const response = await apiClient.post<{ response: string }>('/assistant/chat', {
      message,
      history: history.map(({ role, content }) => ({ role, content })),
    });
    return response.data?.response ?? '';
  }

  async simplifyText(text: string, level: 'elementary' | 'middle' | 'high' = 'elementary'): Promise<string> {
    const response = await apiClient.post<{ simplifiedText: string }>('/text/simplify', {
      text,
      readingLevel: level,
    });
    return response.data?.simplifiedText ?? '';
  }

  async explainConcept(concept: string, context?: string): Promise<AIExplanation> {
    const response = await apiClient.post<AIExplanation>('/text/explain', {
      concept,
      context,
    });
    if (!response.data) {
      return { explanation: '', examples: [] };
    }
    return response.data;
  }

  async checkSpelling(text: string): Promise<Array<{ original: string; correction: string; confidence: string }>> {
    const response = await apiClient.post<{ corrections: Array<{ original: string; correction: string; confidence: string }> }>('/text/spell-check', {
      text,
    });
    return response.data?.corrections ?? [];
  }
}

export const aiService = new AIService();
