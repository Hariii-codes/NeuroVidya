// frontend/src/components/assistant/ChatInterface.tsx
"use client"

import { useChat } from '@ai-sdk/react'
import { useRef, useEffect } from 'react'
import { DyslexiaText } from '@/components/common/DyslexiaText'
import { MessageList } from './MessageList'
import { InputArea } from './InputArea'
import { QuickQuestions } from './QuickQuestions'
import type { ChatMessage } from '@/services/ai'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

export function ChatInterface() {
  const { messages, sendMessage, status } = useChat({
    api: `${API_BASE}/api/assistant/chat`,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Convert UIMessage to our ChatMessage format for MessageList
  const displayMessages: ChatMessage[] = messages.map((msg) => ({
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content : '',
    timestamp: new Date(msg.createdAt || Date.now()),
  }))

  const handleSendMessage = async (content: string) => {
    sendMessage({ content })
  }

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const isLoading = status === 'streaming' || status === 'submitted'

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-dyslexia-calmBlue text-white p-4">
        <DyslexiaText as="h2" size="lg">
          AI Study Assistant
        </DyslexiaText>
        <DyslexiaText size="md" className="opacity-90">
          Ask me anything - I'll explain in simple terms
        </DyslexiaText>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <MessageList messages={displayMessages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <QuickQuestions onQuestionClick={handleQuickQuestion} />

      {/* Input */}
      <InputArea onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}
