import { ArrowLeft, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppLogo } from '../../shared/AppLogo'
import { useAuth } from './auth-context'

type AuthPageProps = {
  mode: 'login' | 'register'
}

function getFriendlyAuthError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.'
  }
  if (normalized.includes('user already registered')) {
    return 'Este e-mail já possui uma conta.'
  }
  if (normalized.includes('password should be')) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }
  if (normalized.includes('email rate limit')) {
    return 'Muitas tentativas seguidas. Aguarde um pouco e tente novamente.'
  }

  return 'Não foi possível concluir agora. Revise os dados e tente novamente.'
}

function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      if (isRegister) {
        const result = await signUp({ name, email: identifier, password })

        if (result.needsEmailConfirmation) {
          setSuccessMessage(
            'Conta criada! Confirme seu e-mail para entrar no CuidaPet.',
          )
          return
        }

        navigate('/app/home', { replace: true })
        return
      }

      await signIn(identifier, password)
      navigate('/app/home', { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setErrorMessage(getFriendlyAuthError(message))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,_#d7f7f0_0,_#f7fbff_42%,_#eef6ff_100%)] px-5 py-6 text-slate-800 sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md">
        <div className={`flex items-center ${isRegister ? 'justify-between' : 'justify-center'}`}>
          {isRegister && (
            <Link
              to="/app/login"
              className="focus-ring inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/70 hover:text-brand-700"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar para login
            </Link>
          )}
          <AppLogo compact />
        </div>

        <section className="app-card mt-8 overflow-hidden p-6 sm:p-8">
          <div className="mb-8">
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              {isRegister ? 'Comece agora' : 'Que bom ter você aqui'}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
              {isRegister ? 'Crie sua conta' : 'Entre no CuidaPet'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isRegister
                ? 'Organize a rotina de cuidados dos seus pets em um só lugar.'
                : 'Acompanhe os cuidados, tratamentos e doses de hoje.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Seu nome</span>
                <span className="relative block">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="app-input pl-12"
                    placeholder="Como podemos chamar você?"
                  />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                E-mail
              </span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type={isRegister ? 'email' : 'text'}
                  autoComplete="email"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  className="app-input pl-12"
                  placeholder="voce@email.com"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Senha</span>
              <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
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
              {isSubmitting
                ? 'Aguarde...'
                : isRegister
                  ? 'Criar minha conta'
                  : 'Entrar'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            {isRegister ? 'Já possui uma conta?' : 'Ainda não tem uma conta?'}{' '}
            <Link
              to={isRegister ? '/app/login' : '/app/register'}
              className="focus-ring rounded-md font-bold text-brand-700 hover:text-brand-800"
            >
              {isRegister ? 'Já tenho conta' : 'Cadastre-se'}
            </Link>
          </p>
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Ao continuar, você concorda com os termos e a política de privacidade do CuidaPet.
        </p>
      </div>
    </main>
  )
}

export function LoginPage() {
  return <AuthPage mode="login" />
}

export function RegisterPage() {
  return <AuthPage mode="register" />
}
