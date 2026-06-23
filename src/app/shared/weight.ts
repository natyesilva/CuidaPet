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

export function formatWeightKg(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatWeight(valueKg: number, unit: string | null | undefined = 'kg') {
  const displayUnit = unit === 'g' ? 'g' : 'kg'
  return `${formatWeightKg(weightFromKg(valueKg, displayUnit))} ${displayUnit}`
}
