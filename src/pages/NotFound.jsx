import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-7xl font-semibold text-brand-600">404</p>
      <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-sm text-ink-500">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  )
}
