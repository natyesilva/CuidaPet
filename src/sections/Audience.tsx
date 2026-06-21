import { Cat, Dog, HeartPulse, Home, Stethoscope } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'

const audiences = [
  { icon: Dog, label: 'Tutores com mais de um pet' },
  { icon: Cat, label: 'Pets idosos' },
  { icon: Stethoscope, label: 'Tratamentos pós-cirúrgicos' },
  { icon: HeartPulse, label: 'Pets com doenças crônicas' },
  { icon: Home, label: 'Famílias que compartilham os cuidados' },
]

export function Audience() {
  return (
    <section className="section-space bg-gradient-to-br from-brand-800 via-brand-700 to-cyan-700 text-white">
      <div className="container-page">
        <SectionHeading
          dark
          eyebrow="Para cada história de cuidado"
          title="Feito para quem cuida de verdade"
          description="O CuidaPet nasce para apoiar diferentes famílias, tratamentos e fases da vida dos pets."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {audiences.map(({ icon: Icon, label }, index) => (
            <article
              key={label}
              className={`rounded-3xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15 ${
                index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/15 text-brand-100">
                <Icon className="size-7" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-bold leading-6">{label}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
