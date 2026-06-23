import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type PetRow = Database['public']['Tables']['pets']['Row']
type PetInsert = Database['public']['Tables']['pets']['Insert']

export type CreatePetInput = {
  name: string
  species: string
  breed: string | null
  weightKg: number | null
  birthDate: string | null
  notes: string | null
}

export const petsService = {
  async list(userId: string): Promise<PetRow[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async create(userId: string, input: CreatePetInput): Promise<PetRow> {
    const record: PetInsert = {
      user_id: userId,
      name: input.name,
      species: input.species,
      breed: input.breed,
      weight_kg: input.weightKg,
      birth_date: input.birthDate,
      notes: input.notes,
    }

    const { data, error } = await supabase
      .from('pets')
      .insert(record)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async remove(userId: string, petId: string): Promise<void> {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId)
      .eq('user_id', userId)

    if (error) throw error
  },
}
