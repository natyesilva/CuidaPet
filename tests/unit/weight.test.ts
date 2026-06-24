import { describe, expect, it } from 'vitest'
import {
  formatWeight,
  parseWeightInput,
  weightFromKg,
  weightToKg,
} from '../../src/app/shared/weight'

describe('weight helpers', () => {
  it('aceita vírgula decimal no padrão brasileiro', () => {
    expect(parseWeightInput('12,4')).toBe(12.4)
    expect(parseWeightInput(' 420 ')).toBe(420)
  })

  it('converte gramas para kg antes de salvar', () => {
    expect(weightToKg(420, 'g')).toBe(0.42)
    expect(weightToKg(12.4, 'kg')).toBe(12.4)
  })

  it('converte kg para a unidade de exibição', () => {
    expect(weightFromKg(0.42, 'g')).toBe(420)
    expect(weightFromKg(12.4, 'kg')).toBe(12.4)
  })

  it('formata peso com unidade correta', () => {
    expect(formatWeight(12.4, 'kg')).toBe('12,4 kg')
    expect(formatWeight(0.42, 'g')).toBe('420 g')
  })
})

