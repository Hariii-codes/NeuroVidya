import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { ChatInterface } from '@/components/assistant/ChatInterface'
import { DyslexiaCard, DyslexiaHeading } from '@/design-system'
import { Link } from 'react-router-dom'

export function AssistantPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        {/* Header */}
        <DyslexiaCard variant="flat" padding="md" className="mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="dyslexia-button dyslexia-button--link dyslexia-button--ghost"
            >
              ← Back
            </Link>
            <DyslexiaHeading level={1} className="m-0">
              AI Study Assistant
            </DyslexiaHeading>
          </div>
        </DyslexiaCard>

        <main className="container mx-auto px-6 py-8">
          <DyslexiaCard variant="elevated" padding="none" className="h-[600px]">
            <ChatInterface />
          </DyslexiaCard>
        </main>
      </div>
    </ProtectedRoute>
  )
}
