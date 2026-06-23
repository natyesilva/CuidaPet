import {
  Bell,
  BellRing,
  ChevronRight,
  HelpCircle,
  LoaderCircle,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  notificationService,
  type NotificationStatus,
} from '../notifications/notificationService'
import { useAuth } from '../auth/auth-context'
import { useAppData } from '../../shared/app-data-context'
import { FeedbackBanner, PageIntro } from '../../shared/ui'

const initialNotificationStatus: NotificationStatus = {
  supported: false,
  permission: 'unsupported',
  exactAlarm: 'unsupported',
}

function permissionLabel(status: NotificationStatus) {
  if (!status.supported) return 'Disponível apenas no app instalado'
  if (status.permission === 'granted') return 'Notificações ativadas'
  if (status.permission === 'denied') return 'Permissão negada'
  return 'Permissão ainda não solicitada'
}

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const { syncNotifications } = useAppData()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isUpdatingNotifications, setIsUpdatingNotifications] =
    useState(false)
  const [notificationStatus, setNotificationStatus] = useState(
    initialNotificationStatus,
  )
  const [pendingCount, setPendingCount] = useState(0)
  const [notificationFeedback, setNotificationFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const name = user?.user_metadata.name || 'Tutor CuidaPet'
  const initials = String(name)
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const refreshNotificationState = useCallback(async () => {
    const status = await notificationService.checkPermission()
    setNotificationStatus(status)

    if (status.supported) {
      const pending =
        await notificationService.listPendingNotifications()
      setPendingCount(pending.length)
    } else {
      setPendingCount(0)
    }
  }, [])

  useEffect(() => {
    void refreshNotificationState().catch(() => {
      setNotificationFeedback({
        type: 'error',
        message: 'Não foi possível consultar os lembretes do aparelho.',
      })
    })
  }, [refreshNotificationState])

  async function handleActivateNotifications() {
    setIsUpdatingNotifications(true)
    setNotificationFeedback(null)

    try {
      const status = await notificationService.requestPermission()
      setNotificationStatus(status)

      if (!status.supported) {
        setNotificationFeedback({
          type: 'error',
          message:
            'Notificações reais funcionam somente no aplicativo instalado no celular.',
        })
        return
      }

      if (status.permission !== 'granted') {
        setNotificationFeedback({
          type: 'error',
          message:
            'A permissão foi negada. Abra Configurações do celular → Apps → CuidaPet → Notificações para ativá-la.',
        })
        return
      }

      const result = await syncNotifications()
      setPendingCount(result.pending)
      setNotificationFeedback({
        type: 'success',
        message: `Notificações ativadas. ${result.pending} lembrete(s) agendado(s).`,
      })
    } catch {
      setNotificationFeedback({
        type: 'error',
        message: 'Não foi possível ativar as notificações agora.',
      })
    } finally {
      setIsUpdatingNotifications(false)
    }
  }

  async function handleSyncNotifications() {
    setIsUpdatingNotifications(true)
    setNotificationFeedback(null)

    try {
      if (!notificationStatus.supported) {
        setNotificationFeedback({
          type: 'error',
          message:
            'Notificações reais funcionam somente no aplicativo instalado no celular.',
        })
        return
      }

      if (notificationStatus.permission !== 'granted') {
        setNotificationFeedback({
          type: 'error',
          message: 'Ative a permissão de notificações antes de sincronizar.',
        })
        return
      }

      const result = await syncNotifications()
      setPendingCount(result.pending)
      setNotificationFeedback({
        type: 'success',
        message: `Lembretes sincronizados: ${result.scheduled} criado(s), ${result.cancelled} removido(s) e ${result.pending} pendente(s).`,
      })
    } catch {
      setNotificationFeedback({
        type: 'error',
        message:
          'Não foi possível sincronizar os lembretes. Verifique sua internet e tente novamente.',
      })
    } finally {
      setIsUpdatingNotifications(false)
    }
  }

  async function handleTestNotification() {
    setIsUpdatingNotifications(true)
    setNotificationFeedback(null)

    try {
      const result = await notificationService.scheduleTestNotification()
      const status = await notificationService.checkPermission()
      setNotificationStatus(status)
      setPendingCount(result.pending)

      if (!result.supported) {
        setNotificationFeedback({
          type: 'error',
          message:
            'O teste de notificação real funciona somente no aplicativo instalado no celular.',
        })
        return
      }

      if (result.permission !== 'granted') {
        setNotificationFeedback({
          type: 'error',
          message:
            'A permissão foi negada. Abra Configurações do celular → Apps → CuidaPet → Notificações para ativá-la.',
        })
        return
      }

      setNotificationFeedback({
        type: 'success',
        message: 'Notificação de teste agendada para daqui 10 segundos.',
      })
    } catch {
      setNotificationFeedback({
        type: 'error',
        message: 'Não foi possível enviar a notificação de teste agora.',
      })
    } finally {
      setIsUpdatingNotifications(false)
    }
  }

  async function handleExactAlarmPermission() {
    setIsUpdatingNotifications(true)
    setNotificationFeedback(null)
    try {
      const status =
        await notificationService.requestExactAlarmPermission()
      setNotificationStatus(status)
      setNotificationFeedback({
        type: status.exactAlarm === 'granted' ? 'success' : 'error',
        message:
          status.exactAlarm === 'granted'
            ? 'Horários exatos permitidos.'
            : 'Permita alarmes e lembretes exatos nas configurações do CuidaPet.',
      })
    } catch {
      setNotificationFeedback({
        type: 'error',
        message:
          'Não foi possível abrir a configuração de horários exatos.',
      })
    } finally {
      setIsUpdatingNotifications(false)
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  const settings = [
    { icon: ShieldCheck, label: 'Privacidade e segurança' },
    { icon: HelpCircle, label: 'Ajuda e suporte' },
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
          <h2 className="truncate text-lg font-extrabold text-slate-900">
            {String(name)}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
            <Mail className="size-3.5 shrink-0" />
            {user?.email}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900">
          Notificações
        </h2>

        {notificationFeedback && (
          <FeedbackBanner
            {...notificationFeedback}
            onDismiss={() => setNotificationFeedback(null)}
          />
        )}

        <div className="app-card overflow-hidden">
          <div className="flex items-start gap-4 p-5">
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                notificationStatus.permission === 'granted'
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {notificationStatus.supported ? (
                <BellRing className="size-6" />
              ) : (
                <Smartphone className="size-6" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-slate-900">
                Lembretes de medicamentos
              </h3>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {permissionLabel(notificationStatus)}
              </p>
              <p className="mt-3 text-xs font-bold text-brand-700">
                {pendingCount} notificação(ões) agendada(s)
              </p>
              {notificationStatus.supported &&
                notificationStatus.exactAlarm === 'denied' && (
                  <p className="mt-2 text-xs leading-5 text-amber-700">
                    O Android pode atrasar lembretes. Permita horários exatos
                    para maior precisão.
                  </p>
                )}
            </div>
          </div>

          <div className="grid gap-2 border-t border-slate-100 p-4">
            {notificationStatus.permission !== 'granted' && (
              <button
                type="button"
                onClick={() => void handleActivateNotifications()}
                disabled={isUpdatingNotifications}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {isUpdatingNotifications ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Bell className="size-4" />
                )}
                Ativar notificações
              </button>
            )}

            {notificationStatus.supported &&
              notificationStatus.exactAlarm === 'denied' && (
                <button
                  type="button"
                  onClick={() => void handleExactAlarmPermission()}
                  disabled={isUpdatingNotifications}
                  className="focus-ring rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 disabled:opacity-60"
                >
                  Permitir horários exatos
                </button>
              )}

            <button
              type="button"
              onClick={() => void handleSyncNotifications()}
              disabled={isUpdatingNotifications}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-60"
            >
              {isUpdatingNotifications ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Sincronizar lembretes
            </button>

            <button
              type="button"
              onClick={() => void handleTestNotification()}
              disabled={isUpdatingNotifications}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800 disabled:opacity-60"
            >
              {isUpdatingNotifications ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Bell className="size-4" />
              )}
              Enviar notificação de teste
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-extrabold text-slate-900">
          Configurações
        </h2>
        <div className="app-card divide-y divide-slate-100 overflow-hidden">
          {settings.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="focus-ring flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50"
            >
              <span className="grid size-10 place-items-center rounded-2xl bg-slate-50 text-slate-500">
                <Icon className="size-5" />
              </span>
              <span className="flex-1 text-sm font-bold text-slate-700">
                {label}
              </span>
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
        {isSigningOut ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : (
          <LogOut className="size-5" />
        )}
        {isSigningOut ? 'Saindo...' : 'Sair da conta'}
      </button>

      <p className="text-center text-xs text-slate-400">
        CuidaPet MVP · versão 0.1.0
      </p>
    </div>
  )
}
