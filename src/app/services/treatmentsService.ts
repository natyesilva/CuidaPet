import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { generateDoseScheduleDates } from '../shared/treatmentSchedule'

type TreatmentRow = Database['public']['Tables']['treatments']['Row']
type TreatmentInsert = Database['public']['Tables']['treatments']['Insert']
type DoseRow = Database['public']['Tables']['dose_schedules']['Row']
type DoseInsert = Database['public']['Tables']['dose_schedules']['Insert']

export type CreateTreatmentInput = {
  petId?: string
  petIds?: string[]
  medicationName: string
  dose: string
  doseUnit: string
  frequencyHours: number
  frequencyLabel: string | null
  scheduleTimes?: string[]
  startAt: string
  endAt: string
  instructions: string | null
  veterinarianId: string | null
  veterinarianName: string | null
}

function generateSchedules(
  userId: string,
  treatmentId: string,
  petId: string,
  input: CreateTreatmentInput,
): DoseInsert[] {
  return generateDoseScheduleDates({
    startAt: input.startAt,
    endAt: input.endAt,
    frequencyHours: input.frequencyHours,
    scheduleTimes: input.scheduleTimes,
  }).map((scheduledAt) => ({
      user_id: userId,
      treatment_id: treatmentId,
      pet_id: petId,
      scheduled_at: scheduledAt,
      status: 'pending',
    }))
}

async function insertSchedules(schedules: DoseInsert[]) {
  const chunkSize = 500
  const createdSchedules: DoseRow[] = []

  for (let index = 0; index < schedules.length; index += chunkSize) {
    const { data, error } = await supabase
      .from('dose_schedules')
      .insert(schedules.slice(index, index + chunkSize))
      .select()

    if (error) throw error
    createdSchedules.push(...data)
  }

  return createdSchedules
}

function getPetIds(input: CreateTreatmentInput) {
  return input.petIds?.length ? input.petIds : input.petId ? [input.petId] : []
}

async function createOneTreatment(
  userId: string,
  petId: string,
  input: CreateTreatmentInput,
) {
  const record: TreatmentInsert = {
    user_id: userId,
    pet_id: petId,
    medication_name: input.medicationName,
    dose: input.dose,
    dose_unit: input.doseUnit,
    frequency_hours: input.frequencyHours,
    frequency_label: input.frequencyLabel,
    start_at: input.startAt,
    end_at: input.endAt,
    instructions: input.instructions,
    veterinarian_id: input.veterinarianId,
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
    const schedules = await insertSchedules(
      generateSchedules(userId, treatment.id, petId, input),
    )
    return { treatment, schedules }
  } catch (scheduleError) {
    await supabase
      .from('treatments')
      .delete()
      .eq('id', treatment.id)
      .eq('user_id', userId)

    throw scheduleError
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

  async create(
    userId: string,
    input: CreateTreatmentInput,
  ): Promise<Array<{ treatment: TreatmentRow; schedules: DoseRow[] }>> {
    const petIds = getPetIds(input)
    if (petIds.length === 0) {
      throw new Error('Selecione pelo menos um pet para o tratamento.')
    }

    const created: Array<{ treatment: TreatmentRow; schedules: DoseRow[] }> = []

    try {
      for (const petId of petIds) {
        created.push(await createOneTreatment(userId, petId, input))
      }

      return created
    } catch (error) {
      await Promise.all(
        created.map(({ treatment }) =>
          supabase
            .from('treatments')
            .delete()
            .eq('id', treatment.id)
            .eq('user_id', userId),
        ),
      )
      throw error
    }
  },

  async updateStatus(
    userId: string,
    treatmentId: string,
    status: 'completed' | 'cancelled',
  ): Promise<TreatmentRow> {
    const { data, error } = await supabase
      .from('treatments')
      .update({ status })
      .eq('id', treatmentId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async remove(userId: string, treatmentId: string): Promise<void> {
    const { error } = await supabase
      .from('treatments')
      .delete()
      .eq('id', treatmentId)
      .eq('user_id', userId)

    if (error) throw error
  },
}
