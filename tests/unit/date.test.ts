import { describe, expect, it } from 'vitest'
import {
  daysSince,
  formatDaysAgo,
  formatRecordedAgo,
} from '../../src/app/shared/date'

const referenceDate = new Date('2026-06-23T12:00:00-03:00')

describe('date helpers', () => {
  it('calcula dias desde o registro sem depender da hora atual', () => {
    expect(daysSince('2026-06-23', referenceDate)).toBe(0)
    expect(daysSince('2026-06-22', referenceDate)).toBe(1)
    expect(daysSince('2026-05-24', referenceDate)).toBe(30)
  })

  it('formata histórico relativo em português', () => {
    expect(formatDaysAgo('2026-06-23', referenceDate)).toBe('Hoje')
    expect(formatDaysAgo('2026-06-22', referenceDate)).toBe('1 dia atrás')
    expect(formatDaysAgo('2026-06-08', referenceDate)).toBe('15 dias atrás')
  })

  it('formata atualização de peso', () => {
    expect(formatRecordedAgo('2026-06-23', referenceDate)).toBe(
      'Registrado hoje',
    )
    expect(formatRecordedAgo('2026-06-22', referenceDate)).toBe(
      'Registrado há 1 dia',
    )
    expect(formatRecordedAgo('2026-05-24', referenceDate)).toBe(
      'Registrado há 30 dias',
    )
  })
})

