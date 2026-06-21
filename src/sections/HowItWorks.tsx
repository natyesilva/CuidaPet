import { BellRing, ClipboardPlus, PawPrint, ShieldAlert } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'

const steps = [
  {
    number: '01',
    icon: PawPrint,
    title: 'Cadastre seu pet',
    text: 'Crie um perfil com as informações de quem faz parte da sua família.',
  },
  {
    number: '02',
    icon: ClipboardPlus,
    title: 'Informe a medicação',
    text: 'Adicione o tratamento prescrito pelo veterinário, com dose e horários.',
  },
  {
    number: '03',
    icon: BellRing,
    title: 'Acompanhe cada dose',
    text: 'Receba lembretes e registre cada aplicação para manter todos informados.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="section-space bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Como funciona"
          title="Simples de usar"
          description="Em poucos passos, você transforma uma rotina cheia de detalhes em um cuidado organizado e compartilhado."
        />

        <div className="relative mt-16 grid gap-8 lg:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-14 hidden border-t-2 border-dashed border-brand-200 lg:block" />
          {steps.map(({ number, icon: Icon, title, text }) => (
            <article key={number} className="relative text-center">
              <div className="relative mx-auto grid size-28 place-items-center rounded-[2rem] border-8 border-white bg-brand-50 text-brand-700 shadow-lg shadow-brand-100">
                <Icon className="size-10" aria-hidden="true" />
                <span className="absolute -right-2 -top-2 grid size-9 place-items-center rounded-full bg-brand-600 text-xs font-extrabold text-white shadow-md">
                  {number}
                </span>
              </div>
              <h3 className="mt-7 text-xl font-bold text-slate-900">{title}</h3>
              <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-14 flex max-w-4xl items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            <strong>Importante:</strong> o CuidaPet não substitui orientações veterinárias. O aplicativo apenas ajuda a organizar tratamentos já prescritos.
          </p>
        </div>
      </div>
    </section>
  )
}
