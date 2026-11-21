import { CalendarCheck, Check } from 'lucide-react'
import { clinic } from '../data/clinic'
import { SectionHeading } from '../components/ui'

export default function Services() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-sand-50">
        <div className="container-x py-14 lg:py-20">
          <SectionHeading
            eyebrow="Our services"
            title="Every treatment your smile needs"
            text="From routine check-ups to complete smile makeovers, we offer comprehensive care with clear explanations and transparent pricing."
          />
        </div>
      </section>

      <section className="container-x">
        <div className="grid gap-6 md:grid-cols-2">
          {clinic.services.map((s) => (
            <article key={s.title} className="card flex flex-col gap-5 p-7 transition duration-300 hover:shadow-soft sm:flex-row">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <s.icon size={28} />
              </span>
              <div>
                <h2 className="text-2xl font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.short}</p>
                <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  {s.details.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-ink-700">
                      <Check size={15} className="shrink-0 text-brand-600" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-[2rem] bg-brand-900 px-8 py-10 text-white md:flex-row">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Not sure which treatment you need?</h2>
            <p className="mt-1.5 text-brand-100">Book a consultation and we will recommend the right plan and explain the cost.</p>
          </div>
          <a href={`tel:+${clinic.phoneRaw}`} className="btn shrink-0 bg-white px-6 py-3 text-brand-800 hover:bg-brand-50">
            <CalendarCheck size={18} /> Call {clinic.phone}
          </a>
        </div>
      </section>
    </>
  )
}
