import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DyslexiaCard, DyslexiaHeading, DyslexiaText, DyslexiaButton, DyslexiaCardGrid } from '@/design-system'
import { useAuthStore } from '@/stores/authStore'

export default function LandingPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Auto-redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])
  return (
    <div className="min-h-screen bg-dyslexia-cream">
      {/* Header */}
      <DyslexiaCard variant="elevated" padding="lg" className="rounded-none !bg-dyslexia-calmBlue">
        <nav className="container mx-auto flex justify-between items-center">
          <DyslexiaHeading level={1} className="m-0 text-white">
            NeuroVidya
          </DyslexiaHeading>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="dyslexia-button dyslexia-button--link !text-white hover:!text-dyslexia-pastelBlue"
            >
              Login
            </Link>
            <DyslexiaButton variant="secondary" onClick={() => window.location.href = '/register'}>
              Sign Up
            </DyslexiaButton>
          </div>
        </nav>
      </DyslexiaCard>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <DyslexiaCard variant="flat" padding="xl" className="text-center mb-16">
          <DyslexiaHeading level={2} size="xl" className="mb-4">
            Learning Made Accessible
          </DyslexiaHeading>
          <DyslexiaText size="lg" className="max-w-2xl mx-auto">
            An AI-powered adaptive learning platform designed specifically for dyslexic students.
            Personalized learning paths that adapt to your unique needs.
          </DyslexiaText>
        </DyslexiaCard>

        {/* Features Section */}
        <DyslexiaCardGrid columns={3} gap="lg" className="mb-16">
          <DyslexiaCard variant="elevated" padding="lg" icon="🧠">
            <DyslexiaHeading level={3} className="mb-2">
              Adaptive Learning
            </DyslexiaHeading>
            <DyslexiaText>
              AI-powered personalization that adjusts to your learning pace and style.
            </DyslexiaText>
          </DyslexiaCard>

          <DyslexiaCard variant="elevated" padding="lg" icon="✨">
            <DyslexiaHeading level={3} className="mb-2">
              Dyslexia-Friendly
            </DyslexiaHeading>
            <DyslexiaText>
              Carefully designed fonts, colors, and interfaces optimized for dyslexic learners.
            </DyslexiaText>
          </DyslexiaCard>

          <DyslexiaCard variant="elevated" padding="lg" icon="📊">
            <DyslexiaHeading level={3} className="mb-2">
              Progress Tracking
            </DyslexiaHeading>
            <DyslexiaText>
              Visual analytics and insights to track your learning journey.
            </DyslexiaText>
          </DyslexiaCard>
        </DyslexiaCardGrid>

        {/* CTA Section */}
        <DyslexiaCard variant="elevated" padding="xl" className="text-center !bg-dyslexia-softOrange">
          <DyslexiaHeading level={3} className="mb-4 text-white">
            Ready to Start Learning?
          </DyslexiaHeading>
          <DyslexiaButton
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/register'}
          >
            Get Started Free
          </DyslexiaButton>
        </DyslexiaCard>
      </main>
    </div>
  )
}
