import {
  BellRing,
  ClipboardCheck,
  HeartHandshake,
  History,
  Pill,
  Stethoscope,
} from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'

const features = [
  {
    icon: Stethoscope,
    title: 'Cadastro completo dos pets',
    text: 'Centralize as informações importantes de cada pet em perfis individuais.',
    color: 'bg-cyan-50 text-cyan-700',
  },
  {
    icon: Pill,
    title: 'Medicamentos e tratamentos',
    text: 'Registre doses, frequências, períodos e observações prescritas.',
    color: 'bg-violet-50 text-violet-700',
  },
  {
    icon: BellRing,
    title: 'Lembretes automáticos',
    text: 'Receba alertas na hora certa e mantenha a rotina sempre em dia.',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    icon: History,
    title: 'Histórico de aplicações',
    text: 'Consulte quando cada dose foi administrada e por quem.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: HeartHandshake,
    title: 'Compartilhamento familiar',
    text: 'Conecte quem cuida para evitar doses duplicadas ou esquecidas.',
    color: 'bg-rose-50 text-rose-700',
  },
  {
    icon: ClipboardCheck,
    title: 'Tratamentos em andamento',
    text: 'Acompanhe o progresso de forma clara, simples e organizada.',
    color: 'bg-blue-50 text-blue-700',
  },
]

export function Solution() {
  return (
    <section id="beneficios" className="section-space relative bg-slate-50">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
      <div className="container-page">
        <SectionHeading
          eyebrow="Tudo em um só lugar"
          title="O CuidaPet organiza tudo para você"
          description="Uma visão simples e confiável para acompanhar cada detalhe do cuidado, sem planilhas, papéis ou mensagens perdidas."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text, color }) => (
            <article
              key={title}
              className="group rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft"
            >
              <span className={`grid size-14 place-items-center rounded-2xl ${color}`}>
                <Icon className="size-7 transition group-hover:scale-110" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
