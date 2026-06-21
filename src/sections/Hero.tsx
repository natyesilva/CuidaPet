import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  HeartPulse,
  PawPrint,
  ShieldCheck,
  Users,
} from 'lucide-react'

function AppMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[380px] animate-float lg:mr-4">
      <div className="absolute -left-12 top-24 hidden rounded-2xl border border-white bg-white/90 p-4 shadow-xl backdrop-blur sm:block">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-cyan-100 text-cyan-700">
            <Bell className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500">Lembrete enviado</p>
            <p className="text-sm font-bold text-slate-800">Dose às 08:00</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-10 bottom-28 z-20 hidden rounded-2xl border border-white bg-white/95 p-4 shadow-xl backdrop-blur sm:block">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500">Família sincronizada</p>
            <p className="text-sm font-bold text-slate-800">Todos foram avisados</p>
          </div>
        </div>
      </div>

      <div className="relative rounded-[2.8rem] border-[9px] border-slate-900 bg-slate-900 p-1 shadow-[0_35px_90px_-25px_rgba(15,118,110,0.55)]">
        <div className="overflow-hidden rounded-[2.15rem] bg-[#f6fbfa]">
          <div className="relative bg-gradient-to-br from-brand-700 to-brand-500 px-6 pb-7 pt-10 text-white">
            <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-100">Olá, Natalia</p>
                <p className="mt-1 text-xl font-bold">Hora de cuidar 💚</p>
              </div>
              <span className="grid size-11 place-items-center rounded-full bg-white/15">
                <Bell className="size-5" aria-hidden="true" />
              </span>
            </div>
          </div>

          <div className="-mt-3 space-y-4 px-5 pb-7">
            <div className="rounded-3xl bg-white p-5 shadow-lg shadow-brand-900/5">
              <div className="flex items-center gap-4">
                <div className="grid size-14 place-items-center rounded-2xl bg-amber-100 text-2xl" aria-label="Cachorrinha">
                  🐶
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-slate-900">Mel</h2>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700">
                      Próxima dose
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Tratamento em andamento</p>
                </div>
              </div>

              <div className="my-5 h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Medicamento</p>
                  <p className="mt-1 font-bold text-slate-800">Prednisolona</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-400">Dose</p>
                  <p className="mt-1 font-bold text-slate-800">3,6 ml</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-brand-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-white text-brand-700 shadow-sm">
                    <Clock3 className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs text-slate-500">Horário</p>
                    <p className="font-extrabold text-brand-800">08:00</p>
                  </div>
                </div>
                <button className="focus-ring rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white">
                  Marcar dose
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <CalendarDays className="size-5 text-cyan-600" aria-hidden="true" />
                <p className="mt-3 text-xs text-slate-500">Próxima</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">Hoje, 20:00</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <Check className="size-5 text-emerald-600" aria-hidden="true" />
                <p className="mt-3 text-xs text-slate-500">Aplicadas</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">12 doses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white pb-20 pt-32 sm:pt-36 lg:pb-28 lg:pt-40"
    >
      <div className="absolute -left-32 top-36 size-96 rounded-full bg-brand-200/35 blur-3xl" />
      <div className="absolute -right-40 top-16 size-[30rem] rounded-full bg-cyan-200/30 blur-3xl" />
      <PawPrint className="absolute left-[8%] top-32 size-16 rotate-[-18deg] text-brand-200/50" aria-hidden="true" />
      <HeartPulse className="absolute bottom-20 right-[6%] size-20 rotate-12 text-cyan-200/50" aria-hidden="true" />

      <div className="container-page relative grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-800 shadow-sm backdrop-blur">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Mais tranquilidade na rotina do seu pet
          </div>
          <h1 className="mt-7 max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Nunca mais se perca na rotina de{' '}
            <span className="relative text-brand-700">
              cuidados do seu pet
              <svg
                className="absolute -bottom-2 left-0 w-full text-brand-300"
                viewBox="0 0 300 12"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2 9C73 2 207 2 298 7" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-slate-600 sm:text-xl">
            Organize medicações, doses, horários e tratamentos de todos os seus pets em um só lugar.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#lista-de-espera"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-4 font-bold text-white shadow-xl shadow-brand-600/20 transition hover:-translate-y-1 hover:bg-brand-700"
            >
              Quero entrar na lista de espera
              <ChevronRight className="size-5" aria-hidden="true" />
            </a>
            <a
              href="#como-funciona"
              className="focus-ring inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 font-bold text-slate-700 transition hover:-translate-y-1 hover:border-brand-300 hover:text-brand-700"
            >
              Ver como funciona
            </a>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
            {['Fácil de usar', 'Vários pets', 'Família conectada'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-brand-100 text-brand-700">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>

        <AppMockup />
      </div>
    </section>
  )
}
