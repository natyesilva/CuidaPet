export type SpeciesGroup = {
  label: string
  options: string[]
}

export const speciesGroups: SpeciesGroup[] = [
  {
    label: 'Comuns',
    options: ['Cachorro', 'Gato'],
  },
  {
    label: 'Aves',
    options: [
      'Calopsita',
      'Ring neck',
      'Periquito',
      'Papagaio',
      'Canário',
      'Agapornis',
    ],
  },
  {
    label: 'Roedores e pequenos mamíferos',
    options: [
      'Rato twister',
      'Hamster',
      'Porquinho-da-índia',
      'Chinchila',
      'Coelho',
      'Furão',
      'Gerbil',
    ],
  },
  {
    label: 'Répteis',
    options: ['Cobra', 'Lagarto', 'Jabuti', 'Tartaruga', 'Gecko', 'Iguana'],
  },
  {
    label: 'Outros',
    options: ['Peixe', 'Ouriço', 'Mini pig', 'Outro'],
  },
]

export function filterSpeciesGroups(query: string) {
  const normalized = query.trim().toLocaleLowerCase('pt-BR')
  if (!normalized) return speciesGroups

  return speciesGroups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) =>
        option.toLocaleLowerCase('pt-BR').includes(normalized),
      ),
    }))
    .filter((group) => group.options.length > 0)
}
