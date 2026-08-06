export function parseWeightInput(value: string) {
  const normalized = value.trim().replace(',', '.')
  return normalized ? Number(normalized) : Number.NaN
}

export function weightToKg(value: number, unit: string | null | undefined) {
  return unit === 'g' ? value / 1000 : value
}

export function weightFromKg(valueKg: number, unit: string | null | undefined) {
  return unit === 'g' ? valueKg * 1000 : valueKg
}

function formatWeightNumber(value: number, unit: 'kg' | 'g') {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: unit === 'g' ? 0 : 3,
  }).format(value)
}

export function formatWeightKg(value: number) {
  return formatWeightNumber(value, 'kg')
}

export function formatWeight(valueKg: number, unit: string | null | undefined = 'kg') {
  const displayUnit = unit === 'g' ? 'g' : 'kg'
  return `${formatWeightNumber(weightFromKg(valueKg, displayUnit), displayUnit)} ${displayUnit}`
}
