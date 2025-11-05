import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser(user) {
        set({ user, isAuthenticated: Boolean(user) })
      },

      setToken(token) {
        if (token) {
          localStorage.setItem('auth_token', token)
        } else {
          localStorage.removeItem('auth_token')
        }
        set({ token })
      },

      async register(payload) {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/api/auth/register', payload)
          const { user } = response || {}

          // Ensure any existing session is cleared so the user can log in manually after registration
          get().setToken(null)
          set({ user: null, isAuthenticated: false })

          return user
        } catch (error) {
          const message = error?.message || 'Registration failed'
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },

      async login(email, password) {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/api/auth/login', { email, password })
          const { token, user } = response
          get().setToken(token)
          set({ user, isAuthenticated: true })
          return user
        } catch (error) {
          const message = error?.message || 'Invalid credentials'
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },

      async loadUser() {
        const token = get().token || localStorage.getItem('auth_token')
        if (!token) return null

        try {
          const response = await api.get('/api/auth/me')
          set({ user: response.user, isAuthenticated: true })
          return response.user
        } catch (error) {
          get().setToken(null)
          set({ user: null, isAuthenticated: false })
          return null
        }
      },

      async updateUser(payload) {
        set({ isLoading: true, error: null })
        try {
          const response = await api.put('/api/auth/profile', payload)
          set({ user: response.user })
          return response.user
        } catch (error) {
          const message = error?.message || 'Profile update failed'
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },

      async changePassword(payload) {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/api/auth/change-password', payload)
          if (response.token) {
            get().setToken(response.token)
          }
          return response
        } catch (error) {
          const message = error?.message || 'Unable to update password'
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },

      async logout() {
        try {
          await api.post('/api/auth/logout')
        } catch (error) {
          // swallow logout errors
        }
        get().setToken(null)
        set({ user: null, isAuthenticated: false, error: null })
      },

      setLoading(isLoading) {
        set({ isLoading })
      },

      setError(error) {
        set({ error })
      },

      clearError() {
        set({ error: null })
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        const token = state?.token || localStorage.getItem('auth_token')
        if (token) {
          state?.setToken?.(token)
          state?.loadUser?.()
        }
      },
    },
  ),
)
