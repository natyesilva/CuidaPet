import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type TreatmentRow = Database['public']['Tables']['treatments']['Row']
type TreatmentInsert = Database['public']['Tables']['treatments']['Insert']
type DoseInsert = Database['public']['Tables']['dose_schedules']['Insert']

export type CreateTreatmentInput = {
  petId: string
  medicationName: string
  dose: string
  doseUnit: string
  frequencyHours: number
  startAt: string
  endAt: string
  instructions: string | null
  veterinarianName: string | null
}

function generateSchedules(
  userId: string,
  treatmentId: string,
  input: CreateTreatmentInput,
): DoseInsert[] {
  const start = new Date(input.startAt)
  const end = new Date(input.endAt)
  const frequencyMs = input.frequencyHours * 60 * 60 * 1000
  const schedules: DoseInsert[] = []

  if (!Number.isFinite(frequencyMs) || frequencyMs <= 0) {
    throw new Error('A frequência precisa ser maior que zero.')
  }
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    throw new Error('As datas do tratamento são inválidas.')
  }
  if (end <= start) {
    throw new Error('A data final precisa ser maior que a data inicial.')
  }

  for (
    let scheduledAt = start.getTime();
    scheduledAt <= end.getTime();
    scheduledAt += frequencyMs
  ) {
    schedules.push({
      user_id: userId,
      treatment_id: treatmentId,
      pet_id: input.petId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      status: 'pending',
    })

    if (schedules.length > 5000) {
      throw new Error('O período informado gera doses demais. Reduza a duração do tratamento.')
    }
  }

  return schedules
}

async function insertSchedules(schedules: DoseInsert[]) {
  const chunkSize = 500

  for (let index = 0; index < schedules.length; index += chunkSize) {
    const { error } = await supabase
      .from('dose_schedules')
      .insert(schedules.slice(index, index + chunkSize))

    if (error) throw error
  }
}

export const treatmentsService = {
  async list(userId: string): Promise<TreatmentRow[]> {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async create(userId: string, input: CreateTreatmentInput): Promise<TreatmentRow> {
    const record: TreatmentInsert = {
      user_id: userId,
      pet_id: input.petId,
      medication_name: input.medicationName,
      dose: input.dose,
      dose_unit: input.doseUnit,
      frequency_hours: input.frequencyHours,
      start_at: input.startAt,
      end_at: input.endAt,
      instructions: input.instructions,
      veterinarian_name: input.veterinarianName,
      status: 'active',
    }

    const { data: treatment, error } = await supabase
      .from('treatments')
      .insert(record)
      .select()
      .single()

    if (error) throw error

    try {
      await insertSchedules(generateSchedules(userId, treatment.id, input))
      return treatment
    } catch (scheduleError) {
      await supabase
        .from('treatments')
        .delete()
        .eq('id', treatment.id)
        .eq('user_id', userId)

      throw scheduleError
    }
  },
}
