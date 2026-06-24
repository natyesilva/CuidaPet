import type { Database } from '../../lib/database.types'
import { supabase } from '../../lib/supabase'

type WeightRow = Database['public']['Tables']['pet_weight_records']['Row']

export type CreateWeightInput = {
  weightKg: number
  recordedAt: string
  notes: string | null
}

export const petWeightService = {
  async list(userId: string): Promise<WeightRow[]> {
    const { data, error } = await supabase
      .from('pet_weight_records')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async create(
    userId: string,
    petId: string,
    input: CreateWeightInput,
  ): Promise<WeightRow> {
    const { data, error } = await supabase
      .from('pet_weight_records')
      .insert({
        user_id: userId,
        pet_id: petId,
        weight_kg: input.weightKg,
        recorded_at: input.recordedAt,
        notes: input.notes,
      })
      .select()
      .single()

    if (error) throw error

    await supabase
      .from('pets')
      .update({ weight_kg: input.weightKg })
      .eq('id', petId)
      .eq('user_id', userId)

    return data
  },
}
