import type { Database } from '../../lib/database.types'
import { supabase } from '../../lib/supabase'

type VaccineRow = Database['public']['Tables']['pet_vaccines']['Row']

export type VaccineInput = {
  name: string
  appliedAt: string | null
  nextDueAt: string | null
  veterinarianName: string | null
  clinicName: string | null
  notes: string | null
}

export const petVaccineService = {
  async list(userId: string): Promise<VaccineRow[]> {
    const { data, error } = await supabase
      .from('pet_vaccines')
      .select('*')
      .eq('user_id', userId)
      .order('next_due_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async create(
    userId: string,
    petId: string,
    input: VaccineInput,
  ): Promise<VaccineRow> {
    const { data, error } = await supabase
      .from('pet_vaccines')
      .insert({
        user_id: userId,
        pet_id: petId,
        name: input.name,
        applied_at: input.appliedAt,
        next_due_at: input.nextDueAt,
        veterinarian_name: input.veterinarianName,
        clinic_name: input.clinicName,
        notes: input.notes,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(
    userId: string,
    vaccineId: string,
    input: VaccineInput,
  ): Promise<VaccineRow> {
    const { data, error } = await supabase
      .from('pet_vaccines')
      .update({
        name: input.name,
        applied_at: input.appliedAt,
        next_due_at: input.nextDueAt,
        veterinarian_name: input.veterinarianName,
        clinic_name: input.clinicName,
        notes: input.notes,
      })
      .eq('id', vaccineId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async remove(userId: string, vaccineId: string): Promise<void> {
    const { error } = await supabase
      .from('pet_vaccines')
      .delete()
      .eq('id', vaccineId)
      .eq('user_id', userId)

    if (error) throw error
  },
}
