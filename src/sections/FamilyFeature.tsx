import { Check, CheckCheck, Clock3, ShieldCheck, Users } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'

export function FamilyFeature() {
  return (
    <section className="section-space overflow-hidden bg-brand-50">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Cuidado compartilhado"
            icon={<Users className="size-4" aria-hidden="true" />}
            title="Toda a família sabe quando o remédio foi administrado"
            description="Compartilhe o tratamento com outras pessoas da casa. Quando alguém marcar uma dose como aplicada, todos conseguem visualizar imediatamente."
          />

          <div className="mt-8 space-y-4">
            {[
              'Evite doses duplicadas ou esquecidas',
              'Saiba exatamente quem administrou',
              'Mantenha todos atualizados em tempo real',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 font-medium text-slate-700">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                  <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                </span>
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-8 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="glass-card relative rounded-[2rem] p-5 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-2xl">🐶</span>
                <div>
                  <p className="font-bold text-slate-900">Tratamento da Mel</p>
                  <p className="text-sm text-slate-500">Prednisolona • 3,6 ml</p>
                </div>
              </div>
              <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 sm:block">
                Em dia
              </span>
            </div>

            <div className="my-7 h-px bg-slate-200" />

            <div className="relative pl-8">
              <div className="absolute bottom-3 left-[11px] top-3 w-0.5 bg-brand-100" />
              <div className="relative pb-7">
                <span className="absolute -left-8 top-0 grid size-6 place-items-center rounded-full bg-brand-600 text-white ring-4 ring-white">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                <div className="rounded-2xl bg-brand-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-brand-900">Dose aplicada</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700">
                      <Clock3 className="size-3.5" aria-hidden="true" /> 08:03
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Prednisolona aplicada por <strong className="text-slate-800">Natalia</strong>
                  </p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute -left-8 top-0 grid size-6 place-items-center rounded-full bg-cyan-500 text-white ring-4 ring-white">
                  <CheckCheck className="size-3.5" aria-hidden="true" />
                </span>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-bold text-slate-800">Família notificada</p>
                  <div className="mt-3 flex items-center">
                    {['👩🏻', '👨🏽', '👧🏻'].map((avatar, index) => (
                      <span
                        key={avatar}
                        className={`grid size-9 place-items-center rounded-full border-2 border-white bg-slate-100 text-base ${
                          index > 0 ? '-ml-2' : ''
                        }`}
                      >
                        {avatar}
                      </span>
                    ))}
                    <span className="ml-3 text-sm text-slate-500">Todos visualizaram</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
              Próxima dose programada para 20:00
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
