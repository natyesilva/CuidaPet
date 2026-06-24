export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date.length === 10 ? `${date}T12:00:00` : date))
}

export function formatTime(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateTime(date: string | null) {
  if (!date) return '—'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function dateAtNoon(date: string) {
  return new Date(date.length === 10 ? `${date}T12:00:00` : date)
}

export function daysSince(date: string, now = new Date()) {
  const current = new Date(now)
  current.setHours(12, 0, 0, 0)
  const elapsed = current.getTime() - dateAtNoon(date).getTime()
  return Math.max(0, Math.floor(elapsed / (24 * 60 * 60 * 1000)))
}

export function formatDaysAgo(date: string, now = new Date()) {
  const days = daysSince(date, now)

  if (days === 0) return 'Hoje'
  if (days === 1) return '1 dia atrás'
  return `${days} dias atrás`
}

export function formatRecordedAgo(date: string, now = new Date()) {
  const days = daysSince(date, now)

  if (days === 0) return 'Registrado hoje'
  if (days === 1) return 'Registrado há 1 dia'
  return `Registrado há ${days} dias`
}
