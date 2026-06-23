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

    async function loadPersistedSession() {
      try {
        if (localStorage.getItem(demoStorageKey) === 'active') {
          if (!isMounted) return

          setSession(null)
          setIsDemoMode(true)
          return
        }

        const { data } = await supabase.auth.getSession()

        if (!isMounted) return

        setSession(data.session)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPersistedSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return

      if (localStorage.getItem(demoStorageKey) === 'active') {
        setSession(null)
        setIsDemoMode(true)
        setIsLoading(false)
        return
      }

      setSession(nextSession)
      if (event !== 'INITIAL_SESSION') {
        setIsLoading(false)
      }
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
          setSession(null)
          await supabase.auth.signOut().catch(() => undefined)
          return
        }

        localStorage.removeItem(demoStorageKey)
        setIsDemoMode(false)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier.trim().toLowerCase(),
          password,
        })

        if (error) throw error
        setSession(data.session)
      },
      async signUp({ name, email, password }) {
        localStorage.removeItem(demoStorageKey)
        setIsDemoMode(false)
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { name: name.trim() },
          },
        })

        if (error) throw error
        setSession(data.session)
        return { needsEmailConfirmation: !data.session }
      },
      async signOut() {
        if (isDemoMode) {
          localStorage.removeItem(demoStorageKey)
          setIsDemoMode(false)
          setSession(null)
          return
        }

        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setSession(null)
      },
    }),
    [isDemoMode, isLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
