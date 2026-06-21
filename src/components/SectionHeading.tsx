import type { ReactNode } from 'react'

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  icon?: ReactNode
  dark?: boolean
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  icon,
  dark = false,
}: SectionHeadingProps) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <div
          className={`mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] ${
            dark ? 'text-brand-200' : 'text-brand-700'
          } ${
            align === 'center' ? 'justify-center' : ''
          }`}
        >
          {icon}
          {eyebrow}
        </div>
      )}
      <h2
        className={`text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${
          dark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-5 text-pretty text-base leading-8 sm:text-lg ${
            dark ? 'text-brand-50/80' : 'text-slate-600'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  )
}
