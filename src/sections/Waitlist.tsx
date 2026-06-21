import { CheckCircle2, Heart, LoaderCircle, Send, Sparkles } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { supabase } from '../lib/supabase'

type WaitlistData = {
  name: string
  email: string
  pets: string
  difficulty: string
}

const initialForm: WaitlistData = {
  name: '',
  email: '',
  pets: '',
  difficulty: '',
}

export function Waitlist() {
  const [formData, setFormData] = useState(initialForm)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('waitlist').insert({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        pets_count: formData.pets,
        main_problem: formData.difficulty.trim(),
      })

      if (error) {
        if (error.code === '23505') {
          setErrorMessage('Este e-mail já está na nossa lista de espera.')
          return
        }

        throw error
      }

      setFormData(initialForm)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Não foi possível cadastrar o lead no Supabase:', error)
      setErrorMessage(
        'Não foi possível concluir seu cadastro agora. Tente novamente em alguns instantes.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateField(field: keyof WaitlistData, value: string) {
    if (errorMessage) setErrorMessage('')
    setFormData((current) => ({ ...current, [field]: value }))
  }

  return (
    <section id="lista-de-espera" className="section-space relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute -left-36 -top-36 size-[28rem] rounded-full bg-brand-600/25 blur-3xl" />
      <div className="absolute -bottom-56 -right-20 size-[32rem] rounded-full bg-cyan-600/20 blur-3xl" />
      <div className="container-page relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-400/10 px-4 py-2 text-sm font-bold text-brand-200">
            <Sparkles className="size-4" aria-hidden="true" />
            Faça parte desde o começo
          </div>
          <h2 className="mt-6 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Estamos construindo o CuidaPet e queremos ouvir você
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Entre na lista de espera e ajude a construir a melhor ferramenta para organizar a saúde dos pets.
          </p>
          <div className="mt-8 space-y-4">
            {[
              'Seja avisado em primeira mão',
              'Ajude a definir as funcionalidades',
              'Tenha acesso antecipado ao aplicativo',
            ].map((item) => (
              <p key={item} className="flex items-center gap-3 text-slate-200">
                <CheckCircle2 className="size-5 shrink-0 text-brand-300" aria-hidden="true" />
                {item}
              </p>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-400/15 text-rose-300">
              <Heart className="size-6 fill-current" aria-hidden="true" />
            </span>
            <p className="text-sm leading-6 text-slate-300">
              Sem spam. Apenas novidades importantes sobre o desenvolvimento do CuidaPet.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 text-slate-800 shadow-2xl shadow-black/30 sm:p-8">
          {isSubmitted ? (
            <div className="flex min-h-[500px] flex-col items-center justify-center text-center" role="status">
              <span className="grid size-20 place-items-center rounded-full bg-brand-100 text-brand-700">
                <CheckCircle2 className="size-10" aria-hidden="true" />
              </span>
              <h3 className="mt-7 text-2xl font-extrabold text-slate-900">Obrigada!</h3>
              <p className="mt-3 max-w-sm leading-7 text-slate-600">
                Você entrou na lista de espera do CuidaPet. Em breve, enviaremos novidades para o seu e-mail.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormData(initialForm)
                  setIsSubmitted(false)
                  setErrorMessage('')
                }}
                className="focus-ring mt-8 rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                Enviar outra resposta
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-extrabold text-slate-900">Quero testar o CuidaPet</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Preencha seus dados. Leva menos de um minuto.
              </p>
              <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-bold text-slate-700">Nome</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    placeholder="Como podemos chamar você?"
                    className="focus-ring w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">E-mail</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="voce@email.com"
                    className="focus-ring w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label htmlFor="pets" className="mb-2 block text-sm font-bold text-slate-700">Quantos pets você possui?</label>
                  <select
                    id="pets"
                    name="pets"
                    required
                    value={formData.pets}
                    onChange={(event) => updateField('pets', event.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-brand-500"
                  >
                    <option value="" disabled>Selecione uma opção</option>
                    <option value="1">1 pet</option>
                    <option value="2">2 pets</option>
                    <option value="3">3 pets</option>
                    <option value="4+">4 ou mais pets</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="difficulty" className="mb-2 block text-sm font-bold text-slate-700">
                    Qual sua maior dificuldade?
                  </label>
                  <textarea
                    id="difficulty"
                    name="difficulty"
                    rows={4}
                    required
                    value={formData.difficulty}
                    onChange={(event) => updateField('difficulty', event.target.value)}
                    placeholder="Conte um pouco sobre sua rotina com medicamentos ou tratamentos..."
                    className="focus-ring w-full resize-none rounded-xl border border-slate-300 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-4 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      Enviando...
                      <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Quero testar o CuidaPet
                      <Send className="size-5" aria-hidden="true" />
                    </>
                  )}
                </button>
                {errorMessage && (
                  <p
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700"
                    role="alert"
                    aria-live="assertive"
                  >
                    {errorMessage}
                  </p>
                )}
                <p className="text-center text-xs leading-5 text-slate-400">
                  Ao enviar, você concorda em receber novidades sobre o CuidaPet.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
