import { Link } from 'react-router-dom'
import { Award, BadgeCheck, CalendarCheck, GraduationCap, Languages, Users } from 'lucide-react'
import { clinic } from '../data/clinic'
import { SectionHeading } from '../components/ui'
import { ToothMark } from '../components/Logo'

export default function About() {
  const d = clinic.doctor
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-sand-50">
        <div className="container-x grid items-center gap-10 py-14 lg:grid-cols-[320px,1fr] lg:py-20">
          <div className="mx-auto flex aspect-[4/5] w-full max-w-xs items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-500 to-brand-800 shadow-soft">
            {d.photo ? (
              <img src={d.photo} alt={d.name} className="h-full w-full object-cover" />
            ) : (
              <ToothMark className="h-28 w-28" />
            )}
          </div>
          <div>
            <span className="eyebrow">Meet your dentist</span>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{d.name}</h1>
            <p className="mt-2 text-lg text-brand-700">{d.title}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-card"><Users size={16} className="text-brand-600" /> {d.experience} experience</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-card"><BadgeCheck size={16} className="text-brand-600" /> {d.registration}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-card"><Languages size={16} className="text-brand-600" /> {d.languages.join(', ')}</span>
            </div>
            <div className="mt-6 space-y-4 leading-relaxed text-ink-700">
              {d.about.map((p) => <p key={p}>{p}</p>)}
            </div>
            <a href={`tel:+${clinic.phoneRaw}`} className="btn-primary mt-7 px-6 py-3"><CalendarCheck size={18} /> Book a consultation</a>
          </div>
        </div>
      </section>

      <section className="container-x mt-16 grid gap-8 lg:grid-cols-2">
        <div className="card p-7">
          <h2 className="flex items-center gap-3 text-2xl font-semibold"><GraduationCap className="text-brand-600" /> Qualifications</h2>
          <ul className="mt-6 space-y-5">
            {d.qualifications.map((q) => (
              <li key={q.degree} className="flex gap-4">
                <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-brand-100 px-2 text-xs font-bold text-brand-800">{q.degree}</span>
                <p className="pt-2 text-sm text-ink-700">{q.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-7">
          <h2 className="flex items-center gap-3 text-2xl font-semibold"><Award className="text-brand-600" /> Areas of expertise</h2>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {d.specialisations.map((s) => (
              <li key={s} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">{s}</li>
            ))}
          </ul>
          <h3 className="mt-8 text-lg font-semibold">Professional memberships</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            {d.memberships.map((m) => (
              <li key={m} className="flex items-center gap-2"><BadgeCheck size={16} className="shrink-0 text-brand-600" /> {m}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-x mt-16 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Journey" title="Career milestones" />
          <ol className="mt-8 space-y-6 border-l-2 border-brand-200 pl-6">
            {d.timeline.map((t) => (
              <li key={t.year} className="relative">
                <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-sand-50 bg-brand-600" />
                <p className="font-display text-xl font-semibold text-brand-700">{t.year}</p>
                <p className="text-sm text-ink-700">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <SectionHeading eyebrow="Recognition" title="Achievements" />
          <ul className="mt-8 space-y-4">
            {d.achievements.map((a) => (
              <li key={a} className="card flex items-start gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral-400/15 text-coral-600"><Award size={20} /></span>
                <p className="pt-1.5 text-sm text-ink-700">{a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-x mt-20">
        <div className="rounded-[2rem] bg-brand-900 px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-semibold">Care you can understand and trust</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">Every treatment is explained, priced up front and planned together with you.</p>
          <Link to="/services" className="btn mt-6 bg-white text-brand-800 hover:bg-brand-50">View our services</Link>
        </div>
      </section>
    </>
  )
}
