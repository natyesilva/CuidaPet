import { Instagram, Mail } from 'lucide-react'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="bg-slate-950 py-14 text-slate-300">
      <div className="container-page">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Organização e tranquilidade para quem ama seus pets. Cuidado no horário certo.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-white">CuidaPet</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a className="transition hover:text-brand-300" href="#como-funciona">Como funciona</a>
              <a className="transition hover:text-brand-300" href="#beneficios">Benefícios</a>
              <a className="transition hover:text-brand-300" href="#faq">Perguntas frequentes</a>
            </div>
          </div>
          <div>
            <h2 className="font-bold text-white">Informações</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a className="transition hover:text-brand-300" href="#privacidade">Política de Privacidade</a>
              <a className="transition hover:text-brand-300" href="#termos">Termos de Uso</a>
              <a className="inline-flex items-center gap-2 transition hover:text-brand-300" href="mailto:contato@cuidapet.app">
                <Mail className="size-4" aria-hidden="true" /> Contato
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CuidaPet. Todos os direitos reservados.</p>
          <a
            className="focus-ring inline-flex w-fit items-center gap-2 rounded-lg transition hover:text-brand-300"
            href="#instagram"
            aria-label="Instagram do CuidaPet"
          >
            <Instagram className="size-4" aria-hidden="true" /> @cuidapet
          </a>
        </div>
      </div>
    </footer>
  )
}
