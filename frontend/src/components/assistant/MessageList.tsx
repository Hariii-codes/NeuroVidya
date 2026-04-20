// frontend/src/components/assistant/MessageList.tsx
import { DyslexiaText } from '@/components/common/DyslexiaText';
import type { ChatMessage } from '@/services/ai';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl p-4 ${
              message.role === 'user'
                ? 'bg-dyslexia-calmBlue text-white'
                : 'bg-dyslexia-pastelBlue text-dyslexia-darkGray'
            }`}
          >
            <DyslexiaText size="md">{message.content}</DyslexiaText>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-dyslexia-pastelBlue rounded-2xl p-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-dyslexia-calmBlue rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-dyslexia-calmBlue rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-dyslexia-calmBlue rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
