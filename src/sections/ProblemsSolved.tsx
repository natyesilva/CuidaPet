import { Check, Clock3, Pill } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'

const situations = [
  'Não lembro se já dei o remédio de hoje.',
  'Qual é a dose desse pet mesmo? E a do outro?',
  'Tenho mais de um pet e acabo confundindo medicamentos e horários.',
  'Preciso procurar a prescrição no WhatsApp toda vez que vou medicar.',
  'Outra pessoa da casa deu o remédio e eu não sabia.',
  'Não lembro quantos dias de tratamento ainda faltam.',
  'Tenho medo de esquecer uma dose importante.',
  'Preciso controlar vários medicamentos ao mesmo tempo.',
  'Anoto tudo em papel, mas acabo perdendo as informações.',
  'Gostaria de ter todo o histórico de tratamento organizado em um só lugar.',
]

const medications = [
  {
    emoji: '🐶',
    pet: 'Mel',
    medication: 'Prednisolona',
    dose: '3,6 ml',
    time: '08:00',
    color: 'bg-amber-100',
  },
  {
    emoji: '🐱',
    pet: 'Luna',
    medication: 'Antibiótico',
    dose: '1 comprimido',
    time: '12:00',
    color: 'bg-violet-100',
  },
  {
    emoji: '🐭',
    pet: 'Pipoca',
    species: 'Rato twister',
    medication: 'Suplemento',
    dose: '2 gotas',
    time: '18:00',
    color: 'bg-rose-100',
  },
  {
    emoji: '🐦',
    pet: 'Sol',
    species: 'Calopsita',
    medication: 'Vitamina',
    dose: '3 gotas',
    time: '09:00',
    color: 'bg-sky-100',
  },
]

export function ProblemsSolved() {
  return (
    <section className="section-space bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Problemas que o CuidaPet ajuda a resolver"
          title="Você já passou por alguma dessas situações?"
          description="Se você respondeu sim para alguma delas, o CuidaPet foi pensado para você."
        />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <ul className="grid gap-4 sm:grid-cols-2" aria-label="Situações que o CuidaPet ajuda a resolver">
            {situations.map((situation) => (
              <li
                key={situation}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                  <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                </span>
                {situation}
              </li>
            ))}
          </ul>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-8 rounded-full bg-brand-100/70 blur-3xl" />
            <div className="glass-card relative rounded-[2rem] p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">Medicações de hoje</p>
                  <h3 className="mt-1 text-xl font-extrabold text-slate-900">Tudo organizado</h3>
                </div>
                <span className="grid size-11 place-items-center rounded-2xl bg-brand-100 text-brand-700">
                  <Pill className="size-5" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {medications.map((item) => (
                  <article
                    key={item.pet}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`grid size-14 shrink-0 place-items-center rounded-2xl text-2xl ${item.color}`}
                        aria-hidden="true"
                      >
                        {item.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-lg font-extrabold text-slate-900">{item.pet}</h4>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                            <Clock3 className="size-3.5" aria-hidden="true" />
                            {item.time}
                          </span>
                        </div>
                        <p className="mt-1 font-semibold text-slate-700">{item.medication}</p>
                        {'species' in item && (
                          <p className="mt-0.5 text-xs font-medium text-brand-700">{item.species}</p>
                        )}
                        <p className="mt-1 text-sm text-slate-500">
                          Dose: <strong className="text-slate-700">{item.dose}</strong>
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-brand-600 p-4 text-center text-sm font-bold text-white">
                Cada pet, dose e horário no lugar certo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
