import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { DyslexiaCard, DyslexiaHeading, DyslexiaInput, DyslexiaButton, DyslexiaText } from '@/design-system'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, error, clearError, isLoading } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
    return () => clearError()
  }, [isAuthenticated, navigate, from, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await login(formData)
      // Navigation will be handled by the useEffect
    } catch (err) {
      // Error is handled by the store
    }
  }

  return (
    <div className="min-h-screen bg-dyslexia-cream flex items-center justify-center px-6">
      <DyslexiaCard variant="elevated" padding="xl" className="max-w-md w-full">
        <DyslexiaHeading level={1} align="center" className="mb-6">
          Welcome Back
        </DyslexiaHeading>

        <form onSubmit={handleSubmit} className="space-y-6">
          <DyslexiaInput
            type="email"
            label="Email Address"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            fullWidth
          />

          <DyslexiaInput
            type="password"
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            fullWidth
          />

          <DyslexiaButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </DyslexiaButton>
        </form>

        {error && (
          <DyslexiaCard variant="outlined" padding="md" className="mt-4 !border-red-400 !bg-red-50">
            <DyslexiaText color="accent">{error}</DyslexiaText>
          </DyslexiaCard>
        )}

        <p className="text-center mt-6">
          <DyslexiaText>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="dyslexia-button dyslexia-button--link dyslexia-button--accent"
            >
              Sign Up
            </Link>
          </DyslexiaText>
        </p>

        <DyslexiaButton
          variant="ghost"
          fullWidth
          onClick={() => navigate('/')}
          className="mt-4"
        >
          ← Back to Home
        </DyslexiaButton>
      </DyslexiaCard>
    </div>
  )
}
