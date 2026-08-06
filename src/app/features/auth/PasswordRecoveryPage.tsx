import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from 'lucide-react'
import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLogo } from '../../shared/AppLogo'
import { useAuth } from './auth-context'

function getFriendlyRecoveryError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('password should be')) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }
  if (normalized.includes('email rate limit') || normalized.includes('rate limit')) {
    return 'Muitas tentativas seguidas. Aguarde um pouco e tente novamente.'
  }
  if (
    normalized.includes('redirect') ||
    normalized.includes('not allowed') ||
    normalized.includes('invalid url')
  ) {
    return 'A URL de recuperação precisa ser liberada nas configurações do Supabase.'
  }
  if (
    normalized.includes('session') ||
    normalized.includes('not authenticated') ||
    normalized.includes('unauthorized')
  ) {
    return 'Abra o link enviado por e-mail para criar uma nova senha.'
  }

  return 'Não foi possível concluir agora. Tente novamente em instantes.'
}

function getRecoveryLinkError() {
  if (typeof window === 'undefined') return ''

  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const description =
    searchParams.get('error_description') ?? hashParams.get('error_description')

  return description ? 'O link de recuperação expirou ou não está completo.' : ''
}

function AuthRecoveryShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,_#d7f7f0_0,_#f7fbff_42%,_#eef6ff_100%)] px-5 py-6 text-slate-800 sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between">
          <Link
            to="/app/login"
            className="focus-ring inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/70 hover:text-brand-700"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Login
          </Link>
          <AppLogo compact />
        </div>

        <section className="app-card mt-8 overflow-hidden p-6 sm:p-8">
          <div className="mb-8">
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              {eyebrow}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          {children}
        </section>
      </div>
    </main>
  )
}

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      await requestPasswordReset(email)
      setSuccessMessage(
        'Se o e-mail estiver cadastrado, enviaremos um link para criar uma nova senha. Confira também spam e lixo eletrônico.',
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setErrorMessage(getFriendlyRecoveryError(message))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthRecoveryShell
      eyebrow="Recuperar acesso"
      title="Redefinir senha"
      description="Informe o e-mail da sua conta para receber o link de recuperação."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            E-mail
          </span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="app-input pl-12"
              placeholder="voce@email.com"
            />
          </span>
        </label>

        {errorMessage && (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800" role="status">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-4 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isSubmitting && <LoaderCircle className="size-5 animate-spin" />}
          {isSubmitting ? 'Enviando...' : 'Enviar link'}
        </button>
      </form>
    </AuthRecoveryShell>
  )
}

export function ResetPasswordPage() {
  const { isLoading, session, signOut, updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(getRecoveryLinkError)
  const [successMessage, setSuccessMessage] = useState('')
  const hasRecoverySession = Boolean(session)
  const passwordsDoNotMatch = useMemo(
    () => confirmPassword.length > 0 && password !== confirmPassword,
    [confirmPassword, password],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (password.length < 6) {
      setErrorMessage('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas precisam ser iguais.')
      return
    }

    setIsSubmitting(true)

    try {
      await updatePassword(password)
      await signOut().catch(() => undefined)
      setPassword('')
      setConfirmPassword('')
      setSuccessMessage('Senha atualizada. Entre novamente usando a nova senha.')
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setErrorMessage(getFriendlyRecoveryError(message))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthRecoveryShell
      eyebrow="Nova senha"
      title="Crie sua nova senha"
      description="Escolha uma senha segura para voltar a acessar o CuidaPet."
    >
      {isLoading && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800">
          Validando o link de recuperação...
        </div>
      )}

      {!isLoading && !hasRecoverySession && !successMessage && (
        <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <div className="flex gap-3">
            <KeyRound className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p className="font-bold">
              Abra esta tela pelo link enviado para o seu e-mail.
            </p>
          </div>
          {errorMessage && <p className="font-semibold">{errorMessage}</p>}
          <Link
            to="/app/forgot-password"
            className="focus-ring inline-flex rounded-xl bg-white px-4 py-3 text-sm font-bold text-amber-800 shadow-sm"
          >
            Enviar novo link
          </Link>
        </div>
      )}

      {successMessage && (
        <div className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800" role="status">
          <p>{successMessage}</p>
          <Link
            to="/app/login"
            className="focus-ring inline-flex rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand-800 shadow-sm"
          >
            Ir para login
          </Link>
        </div>
      )}

      {!isLoading && hasRecoverySession && !successMessage && (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Nova senha
            </span>
            <span className="relative block">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                required
                minLength={6}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="app-input px-12"
                placeholder="Mínimo de 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="focus-ring absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Confirmar nova senha
            </span>
            <span className="relative block">
              <CheckCircle2 className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                required
                minLength={6}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="app-input pl-12"
                placeholder="Digite novamente"
              />
            </span>
            {passwordsDoNotMatch && (
              <span className="mt-2 block text-sm font-bold text-rose-600">
                As senhas precisam ser iguais.
              </span>
            )}
          </label>

          {errorMessage && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || passwordsDoNotMatch}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-4 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSubmitting && <LoaderCircle className="size-5 animate-spin" />}
            {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      )}
    </AuthRecoveryShell>
  )
}
