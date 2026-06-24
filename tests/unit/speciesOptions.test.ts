import { describe, expect, it } from 'vitest'
import {
  findKnownOption,
  getSpeciesGroupsForAnimalGroup,
  getSpecificSpeciesGroupsForSpecies,
  inferAnimalGroupForSpecies,
  isOtherOption,
} from '../../src/app/services/speciesOptions'

function optionsFor(groups: ReturnType<typeof getSpeciesGroupsForAnimalGroup>) {
  return groups.flatMap((group) => group.options)
}

describe('speciesOptions', () => {
  it('filtra espécies compatíveis pelo grupo do animal', () => {
    const reptileOptions = optionsFor(getSpeciesGroupsForAnimalGroup('Réptil'))

    expect(reptileOptions).toContain('Cobra')
    expect(reptileOptions).toContain('Lagarto')
    expect(reptileOptions).not.toContain('Cachorro')
    expect(reptileOptions).not.toContain('Calopsita')
  })

  it('filtra espécie específica pela espécie popular', () => {
    const snakeOptions = optionsFor(getSpecificSpeciesGroupsForSpecies('Cobra'))

    expect(snakeOptions).toContain('Corn snake')
    expect(snakeOptions).toContain('Píton-real')
    expect(snakeOptions).not.toContain('Gecko leopardo')
    expect(snakeOptions).not.toContain('Shih-tzu')
  })

  it('infere grupo animal para dados antigos que ainda só têm species', () => {
    expect(inferAnimalGroupForSpecies('Gato')).toBe('Cachorro/Gato')
    expect(inferAnimalGroupForSpecies('Rato twister')).toBe(
      'Roedor/Pequeno mamífero',
    )
    expect(inferAnimalGroupForSpecies('Corn snake')).toBeNull()
  })

  it('normaliza acentos e caixa ao reconhecer opções conhecidas', () => {
    const species = optionsFor(getSpeciesGroupsForAnimalGroup('reptil'))

    expect(species).toContain('Cobra')
    expect(findKnownOption('píton-REAL', ['Píton-real'])).toBe('Píton-real')
    expect(isOtherOption('Outro')).toBe(true)
    expect(isOtherOption('outro')).toBe(true)
  })
})

