import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './ui'

/** Any logged-in user. Others are sent to the login page and brought back afterwards. */
export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner label="Checking your session..." />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Shop pages, cart, checkout and "my orders" are for customers only: the admin is sent to the admin panel. */
export function BlockAdmin() {
  const { loading, isAdmin } = useAuth()
  if (!loading && isAdmin) return <Navigate to="/admin" replace />
  return <Outlet />
}

/**
 * Admin area. The real protection is on the server (every /api/admin call checks the role);
 * this just keeps customers from seeing an empty admin screen.
 */
export function RequireAdmin() {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner label="Checking your session..." />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
