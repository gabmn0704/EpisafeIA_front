import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '@/lib/api/endpoints'
import { tokenStore } from '@/lib/api/tokenStore'
import type { User } from '@/lib/api/types'

type Status = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  user: User | null
  status: Status
  login: (email: string, password: string) => Promise<void>
  register: (input: { email: string; password: string; fullName: string; birthDate?: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<Status>(() => (tokenStore.get() ? 'loading' : 'anonymous'))

  useEffect(() => {
    let cancelled = false
    if (tokenStore.get()) {
      authApi
        .me()
        .then((u) => {
          if (cancelled) return
          setUser(u)
          setStatus('authenticated')
        })
        .catch(() => {
          if (cancelled) return
          setStatus('anonymous')
        })
    }
    // Any place that clears tokens (failed refresh) logs the user out of the UI.
    const unsub = tokenStore.subscribe((t) => {
      if (!t) {
        setUser(null)
        setStatus('anonymous')
      }
    })
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    tokenStore.set({ accessToken: res.accessToken, refreshToken: res.refreshToken })
    setUser(res.user)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (input: { email: string; password: string; fullName: string; birthDate?: string }) => {
    const res = await authApi.register(input)
    tokenStore.set({ accessToken: res.accessToken, refreshToken: res.refreshToken })
    setUser(res.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      /* the session is dropped locally either way */
    }
    tokenStore.clear()
  }, [])

  const value = useMemo(() => ({ user, status, login, register, logout }), [user, status, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
