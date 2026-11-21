import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Logo from './Logo'
import { clinic, mapLinkUrl } from '../data/clinic'

export default function Footer() {
  const { address } = clinic
  return (
    <footer className="mt-24 bg-brand-900 text-brand-100">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200">{clinic.tagline}. Quality dental care and trusted oral-care products under one roof.</p>
        </div>

        <div>
          <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ['/about', 'Our doctor'],
              ['/services', 'Dental services'],
              ['/shop', 'Product shop'],
              ['/contact', 'Location & contact'],
              ['/orders', 'Track my order'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-brand-200 transition hover:text-white">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white">Visit us</h3>
          <ul className="mt-4 space-y-3 text-sm text-brand-200">
            <li className="flex gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-300" />
              <a href={mapLinkUrl(clinic.mapQuery)} target="_blank" rel="noreferrer" className="hover:text-white">
                {address.line1}, {address.city}, {address.state} {address.pincode}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0 text-brand-300" />
              <a href={`tel:+${clinic.phoneRaw}`} className="hover:text-white">{clinic.phone}</a>
            </li>
            <li className="flex gap-2.5">
              <Mail size={16} className="mt-0.5 shrink-0 text-brand-300" />
              <a href={`mailto:${clinic.email}`} className="hover:text-white">{clinic.email}</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white">Clinic hours</h3>
          <ul className="mt-4 space-y-3 text-sm text-brand-200">
            {clinic.hours.map((h) => (
              <li key={h.days} className="flex gap-2.5">
                <Clock size={16} className="mt-0.5 shrink-0 text-brand-300" />
                <span>
                  <span className="block font-semibold text-white">{h.days}</span>
                  {h.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-brand-300 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {clinic.name}. All rights reserved.</p>
          <p>Secure online payments &middot; No cash on delivery</p>
        </div>
      </div>
    </footer>
  )
}
