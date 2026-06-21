import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Logo } from './Logo'

const links = [
  { label: 'O problema', href: '#problema' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Dúvidas', href: '#faq' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-[72px] items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="focus-ring rounded-lg text-sm font-medium text-slate-600 transition hover:text-brand-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#lista-de-espera"
          className="focus-ring hidden rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:-translate-y-0.5 hover:bg-brand-700 md:inline-flex"
        >
          Entrar na lista
        </a>

        <button
          type="button"
          className="focus-ring grid size-11 place-items-center rounded-xl text-slate-700 md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {isOpen && (
        <nav
          id="mobile-menu"
          className="border-t border-slate-100 bg-white px-5 pb-6 pt-3 shadow-xl md:hidden"
          aria-label="Navegação mobile"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="focus-ring rounded-xl px-4 py-3 font-medium text-slate-700 hover:bg-brand-50"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#lista-de-espera"
              onClick={() => setIsOpen(false)}
              className="focus-ring mt-3 rounded-xl bg-brand-600 px-4 py-3 text-center font-bold text-white"
            >
              Entrar na lista de espera
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
