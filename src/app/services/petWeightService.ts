import type { Database } from '../../lib/database.types'
import { supabase } from '../../lib/supabase'

type WeightRow = Database['public']['Tables']['pet_weight_records']['Row']

export type CreateWeightInput = {
  weightKg: number
  recordedAt: string
  notes: string | null
}

async function updatePetCurrentWeight(userId: string, petId: string) {
  const { data: latestWeight, error } = await supabase
    .from('pet_weight_records')
    .select('weight_kg')
    .eq('user_id', userId)
    .eq('pet_id', petId)
    .order('recorded_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error

  const { error: updateError } = await supabase
    .from('pets')
    .update({ weight_kg: latestWeight?.weight_kg ?? null })
    .eq('id', petId)
    .eq('user_id', userId)

  if (updateError) throw updateError
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

    await updatePetCurrentWeight(userId, petId)

    return data
  },

  async update(
    userId: string,
    weightId: string,
    input: CreateWeightInput,
  ): Promise<WeightRow> {
    const { data, error } = await supabase
      .from('pet_weight_records')
      .update({
        weight_kg: input.weightKg,
        recorded_at: input.recordedAt,
        notes: input.notes,
      })
      .eq('id', weightId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    await updatePetCurrentWeight(userId, data.pet_id)

    return data
  },
}
