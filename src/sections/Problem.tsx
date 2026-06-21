import { Brain, ClockAlert, FileQuestion, MessageCircleWarning, Repeat2 } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'

const problems = [
  {
    icon: ClockAlert,
    title: 'Esquecer horários',
    text: 'Na correria do dia a dia, um horário importante pode passar despercebido.',
  },
  {
    icon: Repeat2,
    title: 'Confundir doses',
    text: 'Cada pet e medicamento têm orientações diferentes, o que aumenta o risco de confusão.',
  },
  {
    icon: FileQuestion,
    title: 'Não saber quem aplicou',
    text: 'Sem um registro compartilhado, fica difícil saber se alguém já administrou a dose.',
  },
  {
    icon: MessageCircleWarning,
    title: 'Perder informações',
    text: 'Orientações importantes acabam misturadas entre mensagens e conversas antigas.',
  },
  {
    icon: Brain,
    title: 'Depender da memória',
    text: 'Tratamentos longos exigem consistência e não deveriam depender só de lembrar.',
  },
]

export function Problem() {
  return (
    <section id="problema" className="section-space bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Uma rotina que pode ser mais leve"
          title="Cuidar da saúde do seu pet não deveria depender de papel, mensagens ou memória"
          description="Quem ama cuida. Mas organizar todos os detalhes de um tratamento pode ser cansativo — principalmente quando a família e vários pets fazem parte da rotina."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {problems.map(({ icon: Icon, title, text }, index) => (
            <article
              key={title}
              className={`group rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-2 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-100/60 ${
                index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-500 transition group-hover:bg-rose-100">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
