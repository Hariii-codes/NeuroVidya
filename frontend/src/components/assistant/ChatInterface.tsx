// frontend/src/components/assistant/ChatInterface.tsx
"use client"

import { useState, useRef, useEffect } from 'react'
import { DyslexiaText } from '@/components/common/DyslexiaText'
import { MessageList } from './MessageList'
import { InputArea } from './InputArea'
import { QuickQuestions } from './QuickQuestions'
import type { ChatMessage } from '@/services/ai'

const API_URL = '/api/chat';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'text-delta' && parsed.textDelta) {
                  assistantContent += parsed.textDelta
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantContent || 'No response received.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question)
  }

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
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <QuickQuestions onQuestionClick={handleQuickQuestion} />

      {/* Input */}
      <InputArea onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}
