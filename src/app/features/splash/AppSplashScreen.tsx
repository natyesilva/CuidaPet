import { LoaderCircle, PawPrint } from 'lucide-react'

export function AppSplashScreen() {
  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_20%_12%,_#b3eee2_0,_#effcf9_34%,_#eef6ff_100%)] px-6 text-slate-900">
      <div className="absolute -left-24 top-8 size-56 rounded-full bg-brand-200/60 blur-3xl" />
      <div className="absolute -right-24 bottom-10 size-64 rounded-full bg-cyan-200/60 blur-3xl" />

      <section className="relative z-10 m-auto w-full max-w-sm text-center" role="status">
        <div className="mx-auto grid size-24 place-items-center rounded-[2rem] bg-gradient-to-br from-brand-600 to-cyan-500 text-white shadow-2xl shadow-brand-700/25">
          <PawPrint className="size-12" strokeWidth={2.6} aria-hidden="true" />
        </div>

        <p className="mt-8 text-sm font-extrabold uppercase tracking-[0.2em] text-brand-700">
          CuidaPet
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Bem-vindo ao CuidaPet
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
          Organizando o cuidado dos seus animais...
        </p>

        <LoaderCircle className="mx-auto mt-8 size-7 animate-spin text-brand-600" aria-hidden="true" />
        <span className="sr-only">Carregando o CuidaPet...</span>
      </section>
    </main>
  )
}
