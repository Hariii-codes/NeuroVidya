import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { DyslexiaCard, DyslexiaHeading, DyslexiaInput, DyslexiaButton, DyslexiaText } from '@/design-system'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isAuthenticated, error, clearError, isLoading } = useAuthStore()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
    return () => {
      clearError()
      setLocalError(null)
    }
  }, [isAuthenticated, navigate, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setLocalError(null)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match!')
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters long!')
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      // Navigation will be handled by the useEffect
    } catch (err) {
      // Error is handled by the store
    }
  }

  return (
    <div className="min-h-screen bg-dyslexia-cream flex items-center justify-center px-6 py-12">
      <DyslexiaCard variant="elevated" padding="xl" className="max-w-md w-full">
        <DyslexiaHeading level={1} align="center" className="mb-2">
          Create Account
        </DyslexiaHeading>
        <DyslexiaText align="center" className="mb-6">
          Start your personalized learning journey
        </DyslexiaText>

        <form onSubmit={handleSubmit} className="space-y-5">
          <DyslexiaInput
            type="text"
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />

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
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            fullWidth
            minLength={8}
            helperText="Must be at least 8 characters"
          />

          <DyslexiaInput
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            fullWidth
            error={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : undefined}
          />

          <DyslexiaButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </DyslexiaButton>
        </form>

        {(error || localError) && (
          <DyslexiaCard variant="outlined" padding="md" className="mt-4 !border-red-400 !bg-red-50">
            <DyslexiaText color="accent">{error || localError}</DyslexiaText>
          </DyslexiaCard>
        )}

        <p className="text-center mt-6">
          <DyslexiaText>
            Already have an account?{' '}
            <Link
              to="/login"
              className="dyslexia-button dyslexia-button--link dyslexia-button--accent"
            >
              Sign In
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
