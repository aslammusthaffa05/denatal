import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react'
import { clinic, mapEmbedUrl, mapLinkUrl } from '../data/clinic'
import { SectionHeading } from '../components/ui'

export default function Contact() {
  const { address } = clinic
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-sand-50">
        <div className="container-x py-14 lg:py-20">
          <SectionHeading
            eyebrow="Find us"
            title="Visit the clinic"
            text="Walk in during clinic hours, or call ahead to book a time that suits you."
          />
        </div>
      </section>

      <section className="container-x grid gap-8 lg:grid-cols-[1fr,1.25fr]">
        <div className="space-y-5">
          <div className="card flex gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700"><MapPin size={22} /></span>
            <div>
              <h2 className="text-lg font-semibold">Address</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-700">
                {clinic.name}<br />
                {address.line1}<br />
                {address.city}, {address.state} {address.pincode}
              </p>
              <a href={mapLinkUrl(clinic.mapQuery)} target="_blank" rel="noreferrer" className="btn-outline btn-sm mt-3">
                <Navigation size={14} /> Get directions
              </a>
            </div>
          </div>

          <div className="card flex gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700"><Phone size={22} /></span>
            <div>
              <h2 className="text-lg font-semibold">Call or message</h2>
              <p className="mt-1 text-sm text-ink-700">{clinic.phone}</p>
              <p className="text-sm text-ink-700">{clinic.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`tel:+${clinic.phoneRaw}`} className="btn-primary btn-sm"><Phone size={14} /> Call now</a>
                <a href={`https://wa.me/${clinic.phoneRaw}`} target="_blank" rel="noreferrer" className="btn-outline btn-sm"><MessageCircle size={14} /> WhatsApp</a>
                <a href={`mailto:${clinic.email}`} className="btn-outline btn-sm"><Mail size={14} /> Email</a>
              </div>
            </div>
          </div>

          <div className="card flex gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700"><Clock size={22} /></span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Clinic hours</h2>
              <ul className="mt-2 divide-y divide-sand-200 text-sm">
                {clinic.hours.map((h) => (
                  <li key={h.days} className="flex flex-col justify-between gap-0.5 py-2 sm:flex-row sm:gap-4">
                    <span className="font-semibold">{h.days}</span>
                    <span className="text-ink-500">{h.time}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-xl bg-coral-400/10 px-3 py-2 text-xs font-medium text-coral-600">{clinic.emergencyNote}</p>
            </div>
          </div>
        </div>

        <div className="card min-h-[420px] overflow-hidden">
          <iframe
            title={`Map showing ${clinic.name}`}
            src={mapEmbedUrl(clinic.mapQuery)}
            className="h-full min-h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
    </>
  )
}
