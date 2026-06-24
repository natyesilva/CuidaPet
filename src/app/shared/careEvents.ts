import type { Dose, Vaccine, WeightRecord } from './app-data-context'

export type CareEventType = 'dose' | 'vaccine' | 'weight'

export type CareEvent = {
  id: string
  petId: string
  type: CareEventType
  title: string
  description: string
  dateTime: string
  status: string
}

type BuildCareEventsInput = {
  doses: Dose[]
  vaccines: Vaccine[]
  weightRecords: WeightRecord[]
  petId?: string
}

function dateAtNoon(date: string) {
  return date.length === 10 ? `${date}T12:00:00` : date
}

function eventTimestamp(event: CareEvent) {
  return new Date(dateAtNoon(event.dateTime)).getTime()
}

function dateKey(value: string) {
  const date = new Date(dateAtNoon(value))
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function buildCareEvents({
  doses,
  vaccines,
  weightRecords,
  petId,
}: BuildCareEventsInput) {
  const petFilter = (currentPetId: string) => !petId || currentPetId === petId

  const doseEvents: CareEvent[] = doses
    .filter((dose) => petFilter(dose.petId))
    .map((dose) => ({
      id: `dose-${dose.id}`,
      petId: dose.petId,
      type: 'dose',
      title: dose.medicationName,
      description: `${dose.dose} ${dose.doseUnit}`,
      dateTime: dose.scheduledAt,
      status: dose.status,
    }))

  const vaccineEvents: CareEvent[] = vaccines
    .filter((vaccine) => petFilter(vaccine.petId))
    .flatMap((vaccine) => {
      const events: CareEvent[] = []

      if (vaccine.nextDueAt) {
        const dueStatus =
          dateKey(vaccine.nextDueAt) < dateKey(new Date().toISOString())
            ? 'overdue'
            : 'pending'
        events.push({
          id: `vaccine-due-${vaccine.id}`,
          petId: vaccine.petId,
          type: 'vaccine',
          title: vaccine.name,
          description: 'Próxima vacina',
          dateTime: dateAtNoon(vaccine.nextDueAt),
          status: dueStatus,
        })
      }

      if (vaccine.appliedAt) {
        events.push({
          id: `vaccine-applied-${vaccine.id}`,
          petId: vaccine.petId,
          type: 'vaccine',
          title: vaccine.name,
          description: 'Vacina aplicada',
          dateTime: dateAtNoon(vaccine.appliedAt),
          status: 'applied',
        })
      }

      return events
    })

  const weightEvents: CareEvent[] = weightRecords
    .filter((record) => petFilter(record.petId))
    .map((record) => ({
      id: `weight-${record.id}`,
      petId: record.petId,
      type: 'weight',
      title: 'Peso registrado',
      description: `${record.weightKg.toLocaleString('pt-BR')} kg`,
      dateTime: dateAtNoon(record.recordedAt),
      status: 'done',
    }))

  return [...doseEvents, ...vaccineEvents, ...weightEvents].sort(
    (a, b) => eventTimestamp(a) - eventTimestamp(b),
  )
}

export function groupCareEventsByDate(events: CareEvent[]) {
  const grouped = new Map<string, CareEvent[]>()

  for (const event of events) {
    const key = dateKey(event.dateTime)
    grouped.set(key, [...(grouped.get(key) ?? []), event])
  }

  return [...grouped.entries()].map(([date, items]) => ({
    date,
    label: formatDateGroupLabel(date),
    events: items.sort((a, b) => eventTimestamp(a) - eventTimestamp(b)),
  }))
}

export function formatDateGroupLabel(date: string) {
  const today = dateKey(new Date().toISOString())
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = dateKey(tomorrowDate.toISOString())

  if (date === today) return 'Hoje'
  if (date === tomorrow) return 'Amanhã'

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${date}T12:00:00`))
}
