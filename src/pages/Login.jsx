import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { SignIn, useClerk } from '@clerk/react'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui'

const FROM_KEY = 'dc_from'
const rememberFrom = (path) => {
  try {
    if (path) sessionStorage.setItem(FROM_KEY, path)
  } catch { /* storage unavailable */ }
}
export const peekFrom = () => {
  try {
    return sessionStorage.getItem(FROM_KEY)
  } catch {
    return null
  }
}
export const clearFrom = () => {
  try {
    sessionStorage.removeItem(FROM_KEY)
  } catch { /* storage unavailable */ }
}

export default function Login() {
  const { user, loading, isSignedIn } = useAuth()
  const clerk = useClerk()
  const from = useLocation().state?.from

  // Remember where the customer was going (e.g. /checkout) so we can send them back after login
  useEffect(() => rememberFrom(from), [from])
  useEffect(() => {
    if (user) clearFrom()
  }, [user])

  if (loading) return <Spinner label="Checking your session..." />
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : peekFrom() || '/'} replace />

  // Signed in with Clerk but our server could not load the account
  if (isSignedIn) {
    return (
      <div className="container-x py-16 text-center">
        <p className="font-semibold">We could not load your account.</p>
        <p className="mt-1 text-sm text-ink-500">Please check your connection and try again.</p>
        <button onClick={() => clerk.signOut()} className="btn-outline mt-6">Sign out</button>
      </div>
    )
  }

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <SignIn routing="path" path="/login" signUpUrl="/register" fallbackRedirectUrl="/login" />
    </div>
  )
}
