export type TreatmentScheduleInput = {
  startAt: string
  endAt: string
  frequencyHours: number
  scheduleTimes?: string[]
}

const maxGeneratedSchedules = 5000

function assertTreatmentWindow(start: Date, end: Date) {
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    throw new Error('As datas do tratamento são inválidas.')
  }

  if (end <= start) {
    throw new Error('A data final precisa ser maior que a data inicial.')
  }
}

export function normalizeScheduleTimes(times: string[] | undefined) {
  const unique = new Set<string>()

  for (const time of times ?? []) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time)
    if (!match) continue

    const hours = Number(match[1])
    const minutes = Number(match[2])
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) continue

    unique.add(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
  }

  return [...unique].sort()
}

function pushSchedule(
  schedules: string[],
  scheduledAt: Date,
  start: Date,
  end: Date,
) {
  if (scheduledAt < start || scheduledAt > end) return

  schedules.push(scheduledAt.toISOString())
  if (schedules.length > maxGeneratedSchedules) {
    throw new Error('O período informado gera doses demais. Reduza a duração do tratamento.')
  }
}

function generateFixedTimeSchedules(
  start: Date,
  end: Date,
  scheduleTimes: string[],
) {
  const schedules: string[] = []
  const currentDay = new Date(start)
  currentDay.setHours(0, 0, 0, 0)
  const lastDay = new Date(end)
  lastDay.setHours(0, 0, 0, 0)

  while (currentDay <= lastDay) {
    for (const time of scheduleTimes) {
      const [hours, minutes] = time.split(':').map(Number)
      pushSchedule(
        schedules,
        new Date(
          currentDay.getFullYear(),
          currentDay.getMonth(),
          currentDay.getDate(),
          hours,
          minutes,
          0,
          0,
        ),
        start,
        end,
      )
    }

    currentDay.setDate(currentDay.getDate() + 1)
  }

  if (schedules.length === 0) {
    throw new Error('Informe pelo menos um horário dentro do período do tratamento.')
  }

  return schedules.sort()
}

function generateIntervalSchedules(
  start: Date,
  end: Date,
  frequencyHours: number,
) {
  const frequencyMs = frequencyHours * 60 * 60 * 1000
  const schedules: string[] = []

  if (!Number.isFinite(frequencyMs) || frequencyMs <= 0) {
    throw new Error('A frequência precisa ser maior que zero.')
  }

  for (
    let scheduledAt = start.getTime();
    scheduledAt <= end.getTime();
    scheduledAt += frequencyMs
  ) {
    pushSchedule(schedules, new Date(scheduledAt), start, end)
  }

  return schedules
}

export function generateDoseScheduleDates({
  startAt,
  endAt,
  frequencyHours,
  scheduleTimes,
}: TreatmentScheduleInput) {
  const start = new Date(startAt)
  const end = new Date(endAt)
  assertTreatmentWindow(start, end)

  const normalizedTimes = normalizeScheduleTimes(scheduleTimes)
  if (normalizedTimes.length > 0) {
    return generateFixedTimeSchedules(start, end, normalizedTimes)
  }

  return generateIntervalSchedules(start, end, frequencyHours)
}
