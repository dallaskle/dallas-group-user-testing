import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { Database } from '../types/supabase'

type User = Database['public']['Tables']['users']['Row']

interface AuthState {
  user: User | null
  session: any | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  setSession: (session: any) => void
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      },
      signUp: async (email: string, password: string, fullName: string) => {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'student',
            },
          },
        })
        if (error) throw error

        // Create user profile in users table
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email,
              full_name: fullName,
              role: 'student',
            })
          if (profileError) throw profileError
        }
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        set({ user: null, session: null })
      },
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
    }
  )
) 