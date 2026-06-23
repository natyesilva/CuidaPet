export function parseWeightInput(value: string) {
  const normalized = value.trim().replace(',', '.')
  return normalized ? Number(normalized) : Number.NaN
}

export function formatWeightKg(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
