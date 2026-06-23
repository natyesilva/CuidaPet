import { Check, ChevronDown, Search } from 'lucide-react'
import { useId, useState } from 'react'
import { filterSpeciesGroups } from '../../services/speciesOptions'

type SpeciesComboboxProps = {
  value: string
  onChange: (value: string) => void
}

export function SpeciesCombobox({ value, onChange }: SpeciesComboboxProps) {
  const listboxId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const groups = filterSpeciesGroups(value)

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input
          required
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          value={value}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onChange={(event) => {
            onChange(event.target.value)
            setIsOpen(true)
          }}
          className="app-input px-12"
          placeholder="Digite ou escolha uma espécie"
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setIsOpen((current) => !current)}
          className="focus-ring absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 hover:bg-slate-50"
          aria-label="Mostrar sugestões de espécies"
        >
          <ChevronDown className={`size-5 transition ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-300/50"
        >
          {groups.length > 0 ? (
            groups.map((group) => (
              <section key={group.label}>
                <p className="px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                  {group.label}
                </p>
                {group.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={value === option}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(option)
                      setIsOpen(false)
                    }}
                    className="focus-ring flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-800"
                  >
                    {option}
                    {value === option && <Check className="size-4 text-brand-600" />}
                  </button>
                ))}
              </section>
            ))
          ) : (
            <p className="px-3 py-4 text-sm leading-6 text-slate-500">
              Nenhuma sugestão encontrada. O texto <strong>{value}</strong> será salvo como espécie.
            </p>
          )}
        </div>
      )}
      <p className="mt-2 text-xs leading-5 text-slate-400">
        Você pode escolher uma sugestão ou cadastrar livremente outra espécie.
      </p>
    </div>
  )
}
