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
