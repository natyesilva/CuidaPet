import { AlertCircle, CheckCircle2, LoaderCircle, PawPrint, RefreshCw, X } from 'lucide-react'
import { type ReactNode, useEffect } from 'react'

export function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-brand-50 text-brand-700" role="status">
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-white shadow-soft">
          <PawPrint className="size-7" />
        </span>
        <LoaderCircle className="mx-auto mt-5 size-6 animate-spin" />
        <span className="sr-only">Carregando...</span>
      </div>
    </div>
  )
}

type PageIntroProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}

export function PageIntro({ eyebrow, title, description, action }: PageIntroProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-700">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action}
    </header>
  )
}

type FieldProps = {
  label: string
  hint?: string
  children: ReactNode
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
        {label}
        {hint && <small className="font-medium text-slate-400">{hint}</small>}
      </span>
      {children}
    </label>
  )
}

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="app-card px-6 py-10 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        {icon}
      </span>
      <h2 className="mt-5 font-extrabold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function DataLoading({ label = 'Carregando dados...' }: { label?: string }) {
  return (
    <div className="app-card grid min-h-48 place-items-center p-6 text-center" role="status">
      <div>
        <LoaderCircle className="mx-auto size-7 animate-spin text-brand-600" />
        <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export function DataError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="app-card border-rose-100 p-6 text-center">
      <AlertCircle className="mx-auto size-8 text-rose-500" />
      <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="focus-ring mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
      >
        <RefreshCw className="size-4" />
        Tentar novamente
      </button>
    </div>
  )
}

export function FeedbackBanner({
  type,
  message,
  onDismiss,
}: {
  type: 'success' | 'error'
  message: string
  onDismiss?: () => void
}) {
  useEffect(() => {
    if (!onDismiss) return
    const timeout = window.setTimeout(onDismiss, 5000)
    return () => window.clearTimeout(timeout)
  }, [message, onDismiss])

  const Icon = type === 'success' ? CheckCircle2 : AlertCircle

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
        type === 'success'
          ? 'border-brand-200 bg-brand-50 text-brand-800'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      }`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <span className="min-w-0 flex-1 leading-5">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="focus-ring grid size-6 shrink-0 place-items-center rounded-lg"
          aria-label="Fechar mensagem"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
