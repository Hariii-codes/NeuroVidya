import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '../services/api'
import type { User, AuthState, LoginCredentials, RegisterCredentials } from '../types'

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post<{ user: User; token: string }>('/auth/login', credentials)

          if (response.success && response.data) {
            const { user, token } = response.data
            localStorage.setItem('auth_token', token)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            set({
              isLoading: false,
              error: response.error || 'Login failed',
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'An error occurred',
          })
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post<{ user: User; token: string }>('/auth/register', credentials)

          if (response.success && response.data) {
            const { user, token } = response.data
            localStorage.setItem('auth_token', token)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            set({
              isLoading: false,
              error: response.error || 'Registration failed',
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'An error occurred',
          })
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },

      setToken: (token: string | null) => {
        set({ token, isAuthenticated: !!token })
        if (token) {
          localStorage.setItem('auth_token', token)
        } else {
          localStorage.removeItem('auth_token')
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
