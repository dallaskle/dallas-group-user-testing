import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'
import type { Tables } from '../lib/supabase'

interface AuthState {
  session: {
    access_token: string | null
    refresh_token: string | null
    expires_at: number | null
  } | null
  user: (User & Tables<'users'>) | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  setSession: (session: AuthState['session']) => void
  setUser: (user: AuthState['user']) => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void
  setInitialized: (isInitialized: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      isLoading: true,
      error: null,
      isInitialized: false,
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      logout: () => set({ session: null, user: null, error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        session: state.session,
        user: state.user
      })
    }
  )
) 