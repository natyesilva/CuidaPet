import { describe, expect, it } from 'vitest'
import {
  generateDoseScheduleDates,
  normalizeScheduleTimes,
} from '../../src/app/shared/treatmentSchedule'

describe('treatment schedule helpers', () => {
  it('normaliza horários válidos e remove duplicados', () => {
    expect(normalizeScheduleTimes(['8:00', '08:00', '20:00', '25:00'])).toEqual([
      '08:00',
      '20:00',
    ])
  })

  it('gera doses a partir de horários fixos dentro do período', () => {
    const dates = generateDoseScheduleDates({
      startAt: '2026-06-28T08:00:00',
      endAt: '2026-06-29T20:00:00',
      frequencyHours: 12,
      scheduleTimes: ['08:00', '20:00'],
    })

    expect(dates).toHaveLength(4)
    expect(dates.map((date) => new Date(date).getHours())).toEqual([
      8,
      20,
      8,
      20,
    ])
  })

  it('mantém fallback por intervalo quando não há horários fixos', () => {
    const dates = generateDoseScheduleDates({
      startAt: '2026-06-28T08:00:00',
      endAt: '2026-06-28T20:00:00',
      frequencyHours: 6,
    })

    expect(dates.map((date) => new Date(date).getHours())).toEqual([
      8,
      14,
      20,
    ])
  })
})
