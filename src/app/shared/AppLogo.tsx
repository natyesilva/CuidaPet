import { PawPrint } from 'lucide-react'
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
      <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-cyan-500 text-white shadow-lg shadow-brand-600/20">
        <PawPrint className="size-5" strokeWidth={2.5} aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-slate-900">
          Cuida<span className="text-brand-600">Pet</span>
        </span>
      )}
    </Link>
  )
}
