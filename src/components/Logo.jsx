import { Link } from 'react-router-dom'
import { clinic } from '../data/clinic'

export function ToothMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#17807b" />
      <path
        d="M32 14c-4-3-12-3-15 3-2 4-1 9 1 13 1 3 2 8 3 14 .5 3 4 3 5 0l2-9c.6-1.8 1.7-2.7 3-2.7s2.4.9 3 2.7l2 9c1 3 4.5 3 5 0 1-6 2-11 3-14 2-4 3-9 1-13-3-6-11-6-15-3z"
        fill="#fff"
      />
    </svg>
  )
}

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label={`${clinic.name} home`}>
      <ToothMark />
      <span className="leading-none">
        <span className={`block font-display text-lg font-semibold ${light ? 'text-white' : 'text-ink-900'}`}>
          {clinic.shortName}
        </span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.2em] ${light ? 'text-brand-200' : 'text-brand-600'}`}>
          Dental Care
        </span>
      </span>
    </Link>
  )
}
