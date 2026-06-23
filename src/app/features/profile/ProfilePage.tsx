import { Bell, ChevronRight, HelpCircle, LoaderCircle, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../auth/auth-context'
import { PageIntro } from '../../shared/ui'

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const name = user?.user_metadata.name || 'Tutor CuidaPet'
  const initials = String(name)
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  const settings = [
    { icon: Bell, label: 'Notificações', detail: 'Ativadas' },
    { icon: ShieldCheck, label: 'Privacidade e segurança', detail: '' },
    { icon: HelpCircle, label: 'Ajuda e suporte', detail: '' },
  ]

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Sua conta"
        title="Perfil"
        description="Gerencie seus dados e preferências do aplicativo."
      />

      <section className="app-card flex items-center gap-4 p-5">
        <span className="grid size-16 shrink-0 place-items-center rounded-[1.4rem] bg-gradient-to-br from-brand-500 to-cyan-400 text-xl font-extrabold text-white shadow-lg shadow-brand-500/20">
          {initials || <UserRound className="size-6" />}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-extrabold text-slate-900">{String(name)}</h2>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
            <Mail className="size-3.5 shrink-0" />
            {user?.email}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-extrabold text-slate-900">Configurações</h2>
        <div className="app-card divide-y divide-slate-100 overflow-hidden">
          {settings.map(({ icon: Icon, label, detail }) => (
            <button
              key={label}
              type="button"
              className="focus-ring flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50"
            >
              <span className="grid size-10 place-items-center rounded-2xl bg-slate-50 text-slate-500">
                <Icon className="size-5" />
              </span>
              <span className="flex-1 text-sm font-bold text-slate-700">{label}</span>
              {detail && <small className="font-semibold text-brand-700">{detail}</small>}
              <ChevronRight className="size-4 text-slate-300" />
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-5 py-4 font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
      >
        {isSigningOut ? <LoaderCircle className="size-5 animate-spin" /> : <LogOut className="size-5" />}
        {isSigningOut ? 'Saindo...' : 'Sair da conta'}
      </button>

      <p className="text-center text-xs text-slate-400">CuidaPet MVP · versão 0.1.0</p>
    </div>
  )
}
