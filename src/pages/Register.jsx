import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { SignUp } from '@clerk/react'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui'
import { clearFrom, peekFrom } from './Login'

export default function Register() {
  const { user, loading } = useAuth()
  useEffect(() => {
    if (user) clearFrom()
  }, [user])

  if (loading) return <Spinner label="Checking your session..." />
  if (user) return <Navigate to={peekFrom() || '/'} replace />

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <SignUp routing="path" path="/register" signInUrl="/login" fallbackRedirectUrl="/login" />
    </div>
  )
}
