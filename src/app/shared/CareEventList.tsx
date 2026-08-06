import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pill,
  Scale,
  ShieldPlus,
} from 'lucide-react'
import type { Pet } from './app-data-context'
import type { CareEvent } from './careEvents'
import { groupCareEventsByDate } from './careEvents'
import { formatTime } from './date'
import { PetAvatar } from './PetAvatar'
import { EmptyState } from './ui'

type CareEventListProps = {
  events: CareEvent[]
  getPet?: (petId: string) => Pet | undefined
  showPetName?: boolean
  emptyTitle: string
  emptyDescription: string
}

const eventCopy = {
  dose: {
    label: 'Tratamento',
    icon: Pill,
    className: 'bg-blue-50 text-blue-600',
  },
  vaccine: {
    label: 'Vacina',
    icon: ShieldPlus,
    className: 'bg-brand-50 text-brand-700',
  },
  weight: {
    label: 'Peso',
    icon: Scale,
    className: 'bg-cyan-50 text-cyan-700',
  },
}

function statusLabel(status: string) {
  if (status === 'pending') return 'Pendente'
  if (status === 'applied') return 'Aplicado'
  if (status === 'skipped') return 'Pulada'
  if (status === 'missed') return 'Perdida'
  if (status === 'overdue') return 'Atrasada'
  if (status === 'done') return 'Registrado'
  return status
}

function statusClassName(status: string) {
  if (status === 'overdue') return 'bg-rose-50 text-rose-600'
  if (status === 'pending') return 'bg-amber-50 text-amber-700'
  if (status === 'applied' || status === 'done') return 'bg-brand-50 text-brand-700'
  return 'bg-slate-100 text-slate-500'
}

export function CareEventList({
  events,
  getPet,
  showPetName = false,
  emptyTitle,
  emptyDescription,
}: CareEventListProps) {
  const groups = groupCareEventsByDate(events)

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="size-6" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.date} className="space-y-2">
          <div className="sticky top-0 z-10 -mx-1 bg-slate-50/90 px-1 py-1 backdrop-blur">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
              {group.label}
            </h2>
          </div>
          <div className="space-y-2.5">
            {group.events.map((event) => {
              const copy = eventCopy[event.type]
              const Icon = copy.icon
              const pet = getPet?.(event.petId)
              const hasTime = event.type === 'dose'

              return (
                <article key={event.id} className="app-card p-4">
                  <div className="flex items-start gap-3">
                    {showPetName && pet ? (
                      <PetAvatar pet={pet} size="sm" />
                    ) : (
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-2xl ${copy.className}`}
                      >
                        <Icon className="size-5" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                          {copy.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${statusClassName(event.status)}`}
                        >
                          {statusLabel(event.status)}
                        </span>
                      </div>
                      <h3 className="mt-2 truncate text-sm font-extrabold text-slate-900">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {showPetName && pet ? `${pet.name} · ` : ''}
                        {event.description}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-2xl bg-slate-50 px-2.5 py-1.5 text-xs font-extrabold text-slate-500">
                      {hasTime ? <Clock3 className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                      {hasTime ? formatTime(event.dateTime) : 'Dia'}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
