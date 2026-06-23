import { Heart, PawPrint } from 'lucide-react'
import { Link } from 'react-router-dom'

type AppLogoProps = {
  compact?: boolean
}

export function AppLogo({ compact = false }: AppLogoProps) {
  return (
    <Link
      to="/app/home"
      className="focus-ring inline-flex items-center gap-2 rounded-xl"
      aria-label="CuidaPet - início do aplicativo"
    >
      <span className="relative grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
        <PawPrint className="size-5" strokeWidth={2.5} aria-hidden="true" />
        <Heart
          className="absolute -right-1 -top-1 size-3.5 fill-cyan-300 text-cyan-300"
          aria-hidden="true"
        />
      </span>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-slate-900">
          Cuida<span className="text-brand-600">Pet</span>
        </span>
      )}
    </Link>
  )
}
