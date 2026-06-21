import { Heart, PawPrint } from 'lucide-react'

type LogoProps = {
  light?: boolean
}

export function Logo({ light = false }: LogoProps) {
  return (
    <a
      href="#inicio"
      className="focus-ring inline-flex items-center gap-2 rounded-xl"
      aria-label="CuidaPet - voltar ao início"
    >
      <span className="relative grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
        <PawPrint className="size-5" strokeWidth={2.5} aria-hidden="true" />
        <Heart
          className="absolute -right-1 -top-1 size-3.5 fill-cyan-300 text-cyan-300"
          aria-hidden="true"
        />
      </span>
      <span
        className={`text-xl font-extrabold tracking-tight ${
          light ? 'text-white' : 'text-slate-900'
        }`}
      >
        Cuida<span className={light ? 'text-brand-200' : 'text-brand-600'}>Pet</span>
      </span>
    </a>
  )
}
