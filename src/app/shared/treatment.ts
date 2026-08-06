export function formatDose(
  dose: string | null | undefined,
  doseUnit: string | null | undefined,
) {
  return [dose?.trim(), doseUnit?.trim()].filter(Boolean).join(' ')
}

export function formatTreatmentFrequency(treatment: {
  frequencyLabel?: string | null
  frequencyHours: number
}) {
  if (treatment.frequencyLabel?.trim()) return treatment.frequencyLabel

  return `A cada ${treatment.frequencyHours} ${
    treatment.frequencyHours === 1 ? 'hora' : 'horas'
  }`
}
