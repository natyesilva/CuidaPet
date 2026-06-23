export type SpeciesGroup = {
  label: string
  options: string[]
}

export const animalGroupOptions: SpeciesGroup[] = [
  {
    label: 'Categorias',
    options: [
      'Cachorro/Gato',
      'Ave',
      'Roedor/Pequeno mamífero',
      'Réptil',
      'Anfíbio',
      'Peixe',
      'Outro',
    ],
  },
]

export const speciesByAnimalGroup: Record<string, string[]> = {
  'Cachorro/Gato': ['Cachorro', 'Gato'],
  Ave: [
    'Calopsita',
    'Ring neck',
    'Periquito',
    'Papagaio',
    'Canário',
    'Agapornis',
    'Outro',
  ],
  'Roedor/Pequeno mamífero': [
    'Rato twister',
    'Hamster',
    'Porquinho-da-índia',
    'Chinchila',
    'Coelho',
    'Furão',
    'Gerbil',
    'Outro',
  ],
  Réptil: ['Cobra', 'Lagarto', 'Jabuti', 'Tartaruga', 'Gecko', 'Iguana', 'Outro'],
  Anfíbio: ['Sapo', 'Rã', 'Salamandra', 'Outro'],
  Peixe: ['Betta', 'Kinguio', 'Carpa', 'Outro'],
  Outro: ['Outro'],
}

export const specificSpeciesBySpecies: Record<string, string[]> = {
  Cobra: ['Corn snake', 'Jiboia', 'Píton-real', 'Cobra-do-milho', 'Falsa-coral', 'Outro'],
  Lagarto: ['Gecko leopardo', 'Dragão barbudo', 'Teiú', 'Iguana', 'Anolis', 'Outro'],
  Gecko: ['Gecko leopardo', 'Crested gecko', 'Gargoyle gecko', 'Outro'],
  Iguana: ['Iguana verde', 'Iguana azul', 'Outro'],
  Calopsita: ['Calopsita comum', 'Lutino', 'Cara branca', 'Pérola', 'Arlequim', 'Outro'],
  'Rato twister': ['Standard', 'Dumbo', 'Hairless', 'Rex', 'Outro'],
  Cachorro: [
    'Sem raça definida',
    'Shih-tzu',
    'Poodle',
    'Spitz',
    'Labrador',
    'Golden Retriever',
    'Bulldog',
    'Outro',
  ],
  Gato: ['Sem raça definida', 'Persa', 'Siamês', 'Maine Coon', 'Bengal', 'Outro'],
}

export const morphBySpecies: Record<string, string[]> = {
  Cobra: ['Albina', 'Pastel', 'Mojave', 'Amelanística', 'Anery', 'Normal', 'Outro'],
  Lagarto: ['Albino', 'Hypo', 'Leatherback', 'High yellow', 'Normal', 'Outro'],
  Gecko: ['Albino', 'Tangerine', 'Mack snow', 'Normal', 'Outro'],
  Calopsita: ['Lutino', 'Cara branca', 'Pérola', 'Arlequim', 'Canela', 'Outro'],
  'Rato twister': ['Standard', 'Dumbo', 'Hairless', 'Rex', 'Siamês', 'Outro'],
  Ave: ['Lutino', 'Cara branca', 'Pérola', 'Arlequim', 'Outro'],
  Outro: ['Outro'],
}

export const sexOptions: SpeciesGroup[] = [
  {
    label: 'Sexo',
    options: ['Fêmea', 'Macho', 'Indefinido', 'Não informado'],
  },
]

export function normalizeOption(value: string | null | undefined) {
  return String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

export function isOtherOption(value: string | null | undefined) {
  return normalizeOption(value) === 'outro'
}

export function findKnownOption(
  value: string | null | undefined,
  options: string[],
) {
  const normalized = normalizeOption(value)
  return options.find((option) => normalizeOption(option) === normalized)
}

export function optionGroup(label: string, options: string[]): SpeciesGroup[] {
  return [{ label, options }]
}

export function getAnimalGroupOptions() {
  return animalGroupOptions[0].options
}

export function getSpeciesGroupsForAnimalGroup(animalGroup: string) {
  const group = findKnownOption(animalGroup, getAnimalGroupOptions())
  if (!group) return []

  return optionGroup('Espécies compatíveis', speciesByAnimalGroup[group] ?? ['Outro'])
}

export function getSpecificSpeciesGroupsForSpecies(species: string) {
  const knownSpecies = findKnownOption(
    species,
    Object.keys(specificSpeciesBySpecies),
  )
  if (!knownSpecies) return []

  return optionGroup(
    'Opções compatíveis',
    specificSpeciesBySpecies[knownSpecies] ?? ['Outro'],
  )
}

export function getMorphGroupsForSpecies(species: string, animalGroup?: string) {
  const knownSpecies = findKnownOption(species, Object.keys(morphBySpecies))
  if (knownSpecies) {
    return optionGroup('Morfos e variações compatíveis', morphBySpecies[knownSpecies])
  }

  const knownGroup = findKnownOption(animalGroup, Object.keys(morphBySpecies))
  if (knownGroup) {
    return optionGroup('Morfos e variações compatíveis', morphBySpecies[knownGroup])
  }

  return []
}

export function filterOptionGroups(query: string, groups: SpeciesGroup[]) {
  const normalized = normalizeOption(query)
  if (!normalized) return groups

  return groups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) =>
        normalizeOption(option).includes(normalized),
      ),
    }))
    .filter((group) => group.options.length > 0)
}

export function getAllSpeciesOptions() {
  return Object.values(speciesByAnimalGroup).flat()
}

export function inferAnimalGroupForSpecies(species: string) {
  const match = Object.entries(speciesByAnimalGroup).find(([, options]) =>
    Boolean(findKnownOption(species, options)),
  )
  return match?.[0] ?? null
}
