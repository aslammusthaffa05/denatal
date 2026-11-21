import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, PackageOpen } from 'lucide-react'
import { optimizeImage, STATUS_LABELS, STATUS_STYLES } from '../lib/format'

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-ink-500" role="status">
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function EmptyState({ title, text, actionTo, actionLabel }) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <PackageOpen size={26} />
      </span>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      {text && <p className="mt-1.5 text-sm text-ink-500">{text}</p>}
      {actionTo && (
        <Link to={actionTo} className="btn-primary mt-6">{actionLabel}</Link>
      )}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card mx-auto max-w-md px-6 py-12 text-center">
      <h3 className="text-xl font-semibold">We could not load this</h3>
      <p className="mt-1.5 text-sm text-ink-500">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-primary mt-6">Try again</button>}
    </div>
  )
}

export function SectionHeading({ eyebrow, title, text, center = false }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-base leading-relaxed text-ink-500">{text}</p>}
    </div>
  )
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status] || 'bg-sand-200 text-ink-700'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

/** Product image with a friendly placeholder if the URL is missing or broken. */
export function ProductImage({ src, alt, width = 600, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-brand-300 ${className}`} role="img" aria-label={alt}>
        <svg viewBox="0 0 64 64" className="h-1/3 w-1/3 max-h-20 max-w-20" aria-hidden="true">
          <path
            d="M32 14c-4-3-12-3-15 3-2 4-1 9 1 13 1 3 2 8 3 14 .5 3 4 3 5 0l2-9c.6-1.8 1.7-2.7 3-2.7s2.4.9 3 2.7l2 9c1 3 4.5 3 5 0 1-6 2-11 3-14 2-4 3-9 1-13-3-6-11-6-15-3z"
            fill="currentColor"
          />
        </svg>
      </div>
    )
  }
  return (
    <img
      src={optimizeImage(src, width)}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}

export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-soft sm:rounded-3xl ${wide ? 'max-w-3xl' : 'max-w-xl'}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sand-200 bg-white px-6 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="btn-ghost btn-sm" aria-label="Close">Close</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
