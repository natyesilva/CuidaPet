import { Bell, CalendarCheck2, Clock3, HeartPulse, PawPrint, UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AppDataProvider } from '../shared/AppDataProvider'
import { AppLogo } from '../shared/AppLogo'

const navigation = [
  { label: 'Hoje', to: '/app/today', icon: CalendarCheck2 },
  { label: 'Pets', to: '/app/pets', icon: PawPrint },
  { label: 'Tratamentos', to: '/app/treatments', icon: HeartPulse },
  { label: 'Histórico', to: '/app/history', icon: Clock3 },
  { label: 'Perfil', to: '/app/profile', icon: UserRound },
]

const routeTitles: Record<string, string> = {
  '/app/home': 'Visão geral',
  '/app/pets': 'Meus pets',
  '/app/pets/new': 'Novo pet',
  '/app/treatments': 'Tratamentos',
  '/app/treatments/new': 'Novo tratamento',
  '/app/today': 'Cuidados de hoje',
  '/app/history': 'Histórico',
  '/app/profile': 'Meu perfil',
}

function AppHeader() {
  const { pathname } = useLocation()
  const title = pathname.startsWith('/app/pets/')
    ? pathname === '/app/pets/new'
      ? 'Novo pet'
      : 'Detalhe do pet'
    : routeTitles[pathname] ?? 'CuidaPet'

  return (
    <header className="app-safe-top sticky top-0 z-30 border-b border-slate-100 bg-white/95 px-5 pb-3 backdrop-blur-xl">
      <div className="flex h-12 items-center justify-between">
        <AppLogo />
        <button
          type="button"
          className="focus-ring relative grid size-10 place-items-center rounded-2xl bg-slate-50 text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
          aria-label="Notificações"
        >
          <Bell className="size-5" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-rose-400" />
        </button>
      </div>
      <p className="mt-1 text-xs font-semibold text-slate-400">{title}</p>
    </header>
  )
}

function BottomNavigation() {
  return (
    <nav
      className="app-safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px] border-t border-slate-100 bg-white/95 px-2 pt-2 shadow-[0_-12px_35px_-28px_rgba(15,23,42,0.7)] backdrop-blur-xl"
      aria-label="Navegação do aplicativo"
    >
      <div className="grid grid-cols-5">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `focus-ring flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-bold transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            <Icon className="size-5" strokeWidth={2.2} aria-hidden="true" />
            <span className="max-w-full truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function AppShell() {
  return (
    <AppDataProvider>
      <div className="min-h-dvh bg-slate-100 text-slate-800">
        <div className="relative mx-auto min-h-dvh max-w-[520px] bg-[#f7fbfa] shadow-2xl shadow-slate-300/40">
          <AppHeader />
          <main className="px-5 pb-28 pt-6">
            <Outlet />
          </main>
          <BottomNavigation />
        </div>
      </div>
    </AppDataProvider>
  )
}
