import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type PetRow = Database['public']['Tables']['pets']['Row']
type PetInsert = Database['public']['Tables']['pets']['Insert']

export type CreatePetInput = {
  name: string
  animalGroup: string | null
  species: string
  specificSpecies: string | null
  subspeciesOrMorph: string | null
  breed: string | null
  sex: string | null
  weightKg: number | null
  weightUnit: string | null
  birthDate: string | null
  notes: string | null
}

export type UpdatePetInput = CreatePetInput

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
      animal_group: input.animalGroup,
      species: input.species,
      specific_species: input.specificSpecies,
      subspecies_or_morph: input.subspeciesOrMorph,
      breed: input.breed,
      sex: input.sex,
      weight_kg: input.weightKg,
      weight_unit: input.weightUnit,
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

  async update(
    userId: string,
    petId: string,
    input: UpdatePetInput,
  ): Promise<PetRow> {
    const record: Database['public']['Tables']['pets']['Update'] = {
      name: input.name,
      animal_group: input.animalGroup,
      species: input.species,
      specific_species: input.specificSpecies,
      subspecies_or_morph: input.subspeciesOrMorph,
      breed: input.breed,
      sex: input.sex,
      weight_kg: input.weightKg,
      weight_unit: input.weightUnit,
      birth_date: input.birthDate,
      notes: input.notes,
    }

    const { data, error } = await supabase
      .from('pets')
      .update(record)
      .eq('id', petId)
      .eq('user_id', userId)
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
