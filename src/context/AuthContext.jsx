import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth as useClerkAuth, useClerk } from '@clerk/react'
import api, { setTokenGetter } from '../lib/api'

const AuthContext = createContext(null)

/**
 * Login itself is handled by Clerk. This keeps the same `useAuth()` the rest of the app already uses:
 * user = { id, name, email, phone, role } loaded from our own server (which decides who is ADMIN).
 */
export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth()
  const clerk = useClerk()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    setTokenGetter(() => getToken())
    if (!isSignedIn) {
      setUser(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    api
      .get('/api/auth/me')
      .then((res) => !cancelled && setUser(res.data))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, getToken])

  const logout = useCallback(() => {
    setUser(null)
    clerk.signOut()
  }, [clerk])

  const value = useMemo(
    () => ({ user, loading, isSignedIn: Boolean(isSignedIn), isAdmin: user?.role === 'ADMIN', logout }),
    [user, loading, isSignedIn, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
