import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, CalendarCheck, MessageCircle, Phone, ShieldCheck, Star, Truck } from 'lucide-react'
import api from '../lib/api'
import { clinic } from '../data/clinic'
import { SectionHeading } from '../components/ui'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { ToothMark } from '../components/Logo'

export default function Home() {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState([])

  useEffect(() => {
    api
      .get('/api/products')
      .then((res) => setProducts(res.data.slice(0, 4)))
      .catch(() => setProducts([])) // the home page still works if the shop is unavailable
  }, [])

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-brand-100 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-coral-400/10 blur-3xl" aria-hidden="true" />
        <div className="container-x relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="eyebrow"><ShieldCheck size={14} /> Trusted by 12,000+ patients</span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              A healthier smile,<br />
              <span className="text-brand-600">without the anxiety.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-500">
              {clinic.name} brings gentle, modern dentistry and professional-grade oral-care products together, with clear
              pricing and care that is explained every step of the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:+${clinic.phoneRaw}`} className="btn-primary px-6 py-3">
                <CalendarCheck size={18} /> Book an appointment
              </a>
              {!isAdmin && (
                <Link to="/shop" className="btn-outline px-6 py-3">
                  Shop dental products <ArrowRight size={16} />
                </Link>
              )}
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-ink-500">
              <div className="flex text-amber-400" aria-hidden="true">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <span><strong className="text-ink-900">4.9/5</strong> from patient reviews</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:150ms]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 shadow-soft">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 70%, #fff 0, transparent 35%)' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="h-3/5 w-3/5 drop-shadow-2xl" aria-hidden="true">
                  <path d="M32 10c-5-4-15-4-19 4-3 5-1 12 1 17 2 4 3 10 4 17 .6 4 5 4 6.3 0l2.6-11c.8-2.2 2.2-3.4 4.1-3.4s3.3 1.2 4.1 3.4l2.6 11c1.3 4 5.700 4 6.300 0 1-7 2-13 4-17 2-5 4-12 1-17-4-8-14-8-19-4z" fill="#fff" />
                </svg>
              </div>
            </div>

            <div className="absolute -left-4 top-10 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft sm:-left-10">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><Award size={20} /></span>
              <div>
                <p className="text-sm font-bold leading-tight">15+ years</p>
                <p className="text-xs text-ink-500">of clinical excellence</p>
              </div>
            </div>
            <div className="absolute -right-3 bottom-12 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft sm:-right-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-400/15 text-coral-600"><ShieldCheck size={20} /></span>
              <div>
                <p className="text-sm font-bold leading-tight">Painless care</p>
                <p className="text-xs text-ink-500">modern, gentle methods</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="container-x">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-sand-200 shadow-card lg:grid-cols-4">
          {clinic.stats.map((s) => (
            <div key={s.label} className="bg-white px-6 py-7 text-center">
              <p className="font-display text-3xl font-semibold text-brand-700">{s.value}</p>
              <p className="mt-1 text-sm text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Services preview ---------- */}
      <section className="container-x mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="What we do" title="Complete dental care under one roof" />
          <Link to="/services" className="btn-outline">All services <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clinic.services.slice(0, 6).map((s) => (
            <div key={s.title} className="card group p-6 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                <s.icon size={24} />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.short}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Doctor teaser ---------- */}
      <section className="container-x mt-24">
        <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-brand-900 p-8 text-white sm:p-12 lg:grid-cols-[auto,1fr]">
          <div className="mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-[2rem] bg-brand-700 lg:h-60 lg:w-60">
            {clinic.doctor.photo ? (
              <img src={clinic.doctor.photo} alt={clinic.doctor.name} className="h-full w-full object-cover" />
            ) : (
              <ToothMark className="h-24 w-24" />
            )}
          </div>
          <div>
            <span className="eyebrow !bg-white/10 !text-brand-100">Meet your dentist</span>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{clinic.doctor.name}</h2>
            <p className="mt-1 text-brand-200">{clinic.doctor.title}</p>
            <p className="mt-4 max-w-2xl leading-relaxed text-brand-100/90">{clinic.doctor.about[0]}</p>
            <Link to="/about" className="btn mt-6 bg-white text-brand-800 hover:bg-brand-50">
              Read full profile <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Shop preview ---------- */}
      {!isAdmin && products.length > 0 && (
        <section className="container-x mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Dental shop" title="Professional oral-care, delivered to your door" text="Hand-picked products our dentists actually recommend. Secure online payment only." />
            <Link to="/shop" className="btn-outline">Visit shop <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              [ShieldCheck, 'Genuine products', 'Sourced from authorised suppliers'],
              [Truck, 'Tracked delivery', 'Follow your order step by step'],
              [Star, 'Dentist approved', 'Recommended in our own clinic'],
            ].map(([Icon, title, text]) => (
              <div key={title} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><Icon size={20} /></span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-ink-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Testimonials ---------- */}
      <section className="container-x mt-24">
        <SectionHeading center eyebrow="Patient stories" title="Smiles we are proud of" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {clinic.testimonials.map((t) => (
            <figure key={t.name} className="card flex flex-col p-6">
              <div className="flex text-amber-400" aria-hidden="true">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-700">&ldquo;{t.text}&rdquo;</blockquote>
              <figcaption className="mt-5 text-sm font-semibold">{t.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="container-x mt-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-14 text-center text-white sm:px-16">
          <h2 className="text-3xl font-semibold sm:text-4xl">Ready for a brighter smile?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">Call us or message on WhatsApp to book your visit. We will find a time that suits you.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={`tel:+${clinic.phoneRaw}`} className="btn bg-white px-6 py-3 text-brand-800 hover:bg-brand-50"><Phone size={18} /> {clinic.phone}</a>
            <a
              href={`https://wa.me/${clinic.phoneRaw}?text=${encodeURIComponent('Hello, I would like to book an appointment.')}`}
              target="_blank"
              rel="noreferrer"
              className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10"
            >
              <MessageCircle size={18} /> WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
