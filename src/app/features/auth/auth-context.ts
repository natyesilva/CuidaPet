import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export type AppUser = Pick<User, 'id' | 'email' | 'user_metadata'>

export type SignUpData = {
  name: string
  email: string
  password: string
}

export type AuthContextValue = {
  session: Session | null
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isDemoMode: boolean
  signIn: (identifier: string, password: string) => Promise<void>
  signUp: (data: SignUpData) => Promise<{ needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
  }

  return context
}
