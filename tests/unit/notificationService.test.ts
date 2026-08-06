import { describe, expect, it } from 'vitest'
import {
  notificationIdFromDoseNotification,
  notificationIdFromDoseScheduleId,
} from '../../src/app/features/notifications/notificationService'

describe('notificationService', () => {
  it('gera id numérico estável para uma dose', () => {
    const doseId = '0f4b2cc8-36a1-4ee5-8d67-85d4b3e663b8'

    expect(notificationIdFromDoseScheduleId(doseId)).toBe(
      notificationIdFromDoseScheduleId(doseId),
    )
  })

  it('gera ids dentro do limite aceito pelo Android', () => {
    const id = notificationIdFromDoseScheduleId(
      'a8c44492-2f57-4b39-8c5d-bad610538d30',
    )

    expect(Number.isInteger(id)).toBe(true)
    expect(id).toBeGreaterThanOrEqual(1)
    expect(id).toBeLessThanOrEqual(2_147_483_647)
  })

  it('reduz colisão para doses diferentes', () => {
    const first = notificationIdFromDoseScheduleId(
      '11111111-1111-4111-8111-111111111111',
    )
    const second = notificationIdFromDoseScheduleId(
      '22222222-2222-4222-8222-222222222222',
    )

    expect(first).not.toBe(second)
  })

  it('gera id estável considerando tratamento, pet, dose e horário', () => {
    const input = {
      doseScheduleId: '0f4b2cc8-36a1-4ee5-8d67-85d4b3e663b8',
      treatmentId: '34a6427d-e84c-4769-8a4a-4063cb4c9fcb',
      petId: 'c483a3dd-9017-4871-a93d-6281edfb98aa',
      scheduledAt: '2026-06-24T10:30:00.000Z',
    }

    expect(notificationIdFromDoseNotification(input)).toBe(
      notificationIdFromDoseNotification(input),
    )
  })

  it('evita colisão simples quando o mesmo tratamento tem mais de uma dose', () => {
    const base = {
      doseScheduleId: '0f4b2cc8-36a1-4ee5-8d67-85d4b3e663b8',
      treatmentId: '34a6427d-e84c-4769-8a4a-4063cb4c9fcb',
      petId: 'c483a3dd-9017-4871-a93d-6281edfb98aa',
    }

    const first = notificationIdFromDoseNotification({
      ...base,
      scheduledAt: '2026-06-24T10:30:00.000Z',
    })
    const second = notificationIdFromDoseNotification({
      ...base,
      doseScheduleId: '41fd27bf-18ec-4a67-ae00-531cf8de3848',
      scheduledAt: '2026-06-24T22:30:00.000Z',
    })

    expect(first).not.toBe(second)
  })
})
