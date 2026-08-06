export function getPetEmoji(species: string) {
  const normalized = species.toLocaleLowerCase('pt-BR')

  if (normalized.includes('cachorro')) return '🐶'
  if (normalized.includes('gato')) return '🐱'
  if (
    ['calopsita', 'ring neck', 'periquito', 'papagaio', 'canário', 'agapornis'].some(
      (item) => normalized.includes(item),
    )
  ) {
    return '🐦'
  }
  if (
    ['cobra', 'lagarto', 'jabuti', 'tartaruga', 'gecko', 'iguana'].some((item) =>
      normalized.includes(item),
    )
  ) {
    return '🦎'
  }
  if (normalized.includes('peixe')) return '🐟'
  if (normalized.includes('coelho')) return '🐰'
  if (normalized.includes('porquinho')) return '🐹'
  if (normalized.includes('hamster') || normalized.includes('gerbil')) return '🐹'
  return '🐾'
}

export function formatApproximateAge(
  age: number | null | undefined,
  unit: 'months' | 'years' | null | undefined,
) {
  if (!age || age <= 0 || !unit) return ''

  if (unit === 'months') {
    return age === 1 ? '1 mês' : `${age} meses`
  }

  return age === 1 ? '1 ano' : `${age} anos`
}
