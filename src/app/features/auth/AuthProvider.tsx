import { Capacitor } from '@capacitor/core'
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
import { getPasswordResetRedirectUrl } from './passwordRecovery'

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
      async requestPasswordReset(email) {
        const redirectTo = getPasswordResetRedirectUrl(
          window.location.origin,
          Capacitor.isNativePlatform(),
          import.meta.env.VITE_PUBLIC_SITE_URL,
        )
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          redirectTo ? { redirectTo } : undefined,
        )
        if (error) throw error
      },
      async verifyRecoveryCode(email, code) {
        localStorage.removeItem(demoStorageKey)
        setIsDemoMode(false)
        const { data, error } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: code.trim(),
          type: 'recovery',
        })
        if (error) throw error
        setSession(data.session)
      },
      async recoverSessionFromUrl(params) {
        localStorage.removeItem(demoStorageKey)
        setIsDemoMode(false)

        if (params.kind === 'tokens') {
          const { data, error } = await supabase.auth.setSession({
            access_token: params.accessToken,
            refresh_token: params.refreshToken,
          })
          if (error) throw error
          setSession(data.session)
          return
        }

        if (params.kind === 'tokenHash') {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: params.tokenHash,
            type: 'recovery',
          })
          if (error) throw error
          setSession(data.session)
          return
        }

        throw new Error(params.kind === 'error' ? params.message : 'invalid link')
      },
      async updatePassword(password) {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
      },
    }),
    [isDemoMode, isLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
