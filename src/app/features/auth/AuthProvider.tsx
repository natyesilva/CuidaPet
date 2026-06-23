import type { Session } from '@supabase/supabase-js'
import {
  type PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../../../lib/supabase'
import {
  AuthContext,
  type AppUser,
  type AuthContextValue,
} from './auth-context'

const demoStorageKey = 'cuidapet:demo-session'
const demoUser: AppUser = {
  id: 'cuidapet-demo-master',
  email: 'test@cuidapet.local',
  user_metadata: { name: 'Test' },
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(
    () => localStorage.getItem(demoStorageKey) === 'active',
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session)
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: isDemoMode ? demoUser : (session?.user ?? null),
      isLoading,
      isAuthenticated: isDemoMode || Boolean(session),
      isDemoMode,
      async signIn(identifier, password) {
        if (identifier.trim().toLowerCase() === 'test' && password === 'Admin123') {
          localStorage.setItem(demoStorageKey, 'active')
          setIsDemoMode(true)
          return
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: identifier.trim().toLowerCase(),
          password,
        })

        if (error) throw error
      },
      async signUp({ name, email, password }) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { name: name.trim() },
          },
        })

        if (error) throw error
        return { needsEmailConfirmation: !data.session }
      },
      async signOut() {
        if (isDemoMode) {
          localStorage.removeItem(demoStorageKey)
          setIsDemoMode(false)
          return
        }

        const { error } = await supabase.auth.signOut()
        if (error) throw error
      },
    }),
    [isDemoMode, isLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
