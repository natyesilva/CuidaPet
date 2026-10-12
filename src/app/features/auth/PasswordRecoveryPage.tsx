import { ArrowLeft, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, Mail } from 'lucide-react'
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppLogo } from '../../shared/AppLogo'
import { getFriendlyAuthError } from './authErrors'
import { useAuth } from './auth-context'
import { parseRecoveryUrl, passwordResetPath } from './passwordRecovery'

const submitButtonClass =
  'focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-4 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0'

function errorText(error: unknown) {
  return getFriendlyAuthError(error instanceof Error ? error.message : '')
}

type RecoveryLayoutProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

function RecoveryLayout({ eyebrow, title, description, children }: RecoveryLayoutProps) {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,_#d7f7f0_0,_#f7fbff_42%,_#eef6ff_100%)] px-5 py-6 text-slate-800 sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between">
          <Link
            to="/app/login"
            className="focus-ring inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/70 hover:text-brand-700"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar para login
          </Link>
          <AppLogo compact />
        </div>

        <section className="app-card mt-8 overflow-hidden p-6 sm:p-8">
          <div className="mb-8">
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              {eyebrow}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  )
}

function Message({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  return tone === 'error' ? (
    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
      {children}
    </p>
  ) : (
    <p className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800" role="status">
      {children}
    </p>
  )
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { requestPasswordReset, verifyRecoveryCode } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await requestPasswordReset(email)
      setEmailSent(true)
    } catch (error) {
      setErrorMessage(errorText(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await verifyRecoveryCode(email, code)
      navigate(passwordResetPath, { replace: true })
    } catch (error) {
      setErrorMessage(errorText(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (emailSent) {
    return (
      <RecoveryLayout
        eyebrow="Verifique seu e-mail"
        title="Recupere sua senha"
        description={`Se existir uma conta com ${email.trim().toLowerCase()}, enviamos um e-mail de recuperação. Toque no link do e-mail ou digite abaixo o código recebido.`}
      >
        <form className="space-y-5" onSubmit={handleVerifyCode}>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Código do e-mail</span>
            <span className="relative block">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6,10}"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                className="app-input pl-12 tracking-[0.3em]"
                placeholder="000000"
              />
            </span>
          </label>

          {errorMessage && <Message tone="error">{errorMessage}</Message>}

          <button type="submit" disabled={isSubmitting} className={submitButtonClass}>
            {isSubmitting && <LoaderCircle className="size-5 animate-spin" />}
            {isSubmitting ? 'Aguarde...' : 'Validar código'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          Não recebeu? Confira o spam ou{' '}
          <button
            type="button"
            onClick={() => {
              setEmailSent(false)
              setCode('')
              setErrorMessage('')
            }}
            className="focus-ring rounded-md font-bold text-brand-700 hover:text-brand-800"
          >
            envie novamente
          </button>
          .
        </p>
      </RecoveryLayout>
    )
  }

  return (
    <RecoveryLayout
      eyebrow="Esqueci a senha"
      title="Recupere sua senha"
      description="Informe o e-mail da sua conta para receber as instruções de recuperação."
    >
      <form className="space-y-5" onSubmit={handleRequest}>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">E-mail</span>
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

        {errorMessage && <Message tone="error">{errorMessage}</Message>}

        <button type="submit" disabled={isSubmitting} className={submitButtonClass}>
          {isSubmitting && <LoaderCircle className="size-5 animate-spin" />}
          {isSubmitting ? 'Aguarde...' : 'Enviar instruções'}
        </button>
      </form>
    </RecoveryLayout>
  )
}

type LinkStatus = 'checking' | 'verified' | 'none' | 'failed'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { session, isLoading, recoverSessionFromUrl, updatePassword } = useAuth()
  const [linkStatus, setLinkStatus] = useState<LinkStatus>('checking')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  // Evita consumir o mesmo token duas vezes (StrictMode executa o efeito em dobro).
  const handledUrlRef = useRef(false)

  useEffect(() => {
    if (handledUrlRef.current) return
    handledUrlRef.current = true

    const params = parseRecoveryUrl(window.location.search, window.location.hash)
    if (params.kind === 'none') {
      setLinkStatus('none')
      return
    }

    // Remove os tokens da barra de endereço assim que forem lidos.
    window.history.replaceState(window.history.state, '', window.location.pathname)

    recoverSessionFromUrl(params)
      .then(() => setLinkStatus('verified'))
      .catch((error: unknown) => {
        setErrorMessage(errorText(error))
        setLinkStatus('failed')
      })
  }, [recoverSessionFromUrl])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (password !== confirmation) {
      setErrorMessage('As senhas não conferem.')
      return
    }

    setIsSubmitting(true)
    try {
      await updatePassword(password)
      setIsDone(true)
    } catch (error) {
      setErrorMessage(errorText(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isChecking = linkStatus === 'checking' || (linkStatus === 'none' && isLoading)
  const canReset = linkStatus === 'verified' || (linkStatus === 'none' && !isLoading && Boolean(session))

  if (isChecking) {
    return (
      <RecoveryLayout eyebrow="Nova senha" title="Validando link" description="Aguarde um instante...">
        <div className="grid place-items-center py-4">
          <LoaderCircle className="size-8 animate-spin text-brand-600" aria-label="Carregando" />
        </div>
      </RecoveryLayout>
    )
  }

  if (isDone) {
    return (
      <RecoveryLayout
        eyebrow="Tudo certo"
        title="Senha alterada"
        description="Sua senha foi atualizada. Use a nova senha para entrar no app CuidaPet."
      >
        <button type="button" onClick={() => navigate('/app/home', { replace: true })} className={submitButtonClass}>
          Continuar
        </button>
      </RecoveryLayout>
    )
  }

  if (!canReset) {
    return (
      <RecoveryLayout
        eyebrow="Link inválido"
        title="Não foi possível validar"
        description="O link ou código de recuperação é inválido ou expirou. Solicite uma nova recuperação de senha."
      >
        {errorMessage && (
          <div className="mb-5">
            <Message tone="error">{errorMessage}</Message>
          </div>
        )}
        <Link to="/app/forgot-password" replace className={submitButtonClass}>
          Solicitar novamente
        </Link>
      </RecoveryLayout>
    )
  }

  return (
    <RecoveryLayout eyebrow="Nova senha" title="Crie uma nova senha" description="Escolha uma senha com pelo menos 6 caracteres.">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Nova senha</span>
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
          <span className="mb-2 block text-sm font-bold text-slate-700">Confirme a nova senha</span>
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              required
              minLength={6}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="app-input pl-12"
              placeholder="Repita a nova senha"
            />
          </span>
        </label>

        {errorMessage && <Message tone="error">{errorMessage}</Message>}

        <button type="submit" disabled={isSubmitting} className={submitButtonClass}>
          {isSubmitting && <LoaderCircle className="size-5 animate-spin" />}
          {isSubmitting ? 'Aguarde...' : 'Salvar nova senha'}
        </button>
      </form>
    </RecoveryLayout>
  )
}
