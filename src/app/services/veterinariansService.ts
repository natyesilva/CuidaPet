import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type VeterinarianRow = Database['public']['Tables']['veterinarians']['Row']
type VeterinarianInsert = Database['public']['Tables']['veterinarians']['Insert']
type VeterinarianUpdate = Database['public']['Tables']['veterinarians']['Update']

export type VeterinarianInput = {
  name: string
  clinicName: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  specialty: string | null
  notes: string | null
}

function toRecord(userId: string, input: VeterinarianInput): VeterinarianInsert {
  return {
    user_id: userId,
    name: input.name,
    clinic_name: input.clinicName,
    phone: input.phone,
    whatsapp: input.whatsapp,
    email: input.email,
    specialty: input.specialty,
    notes: input.notes,
    deleted_at: null,
  }
}

export const veterinariansService = {
  async list(userId: string): Promise<VeterinarianRow[]> {
    const { data, error } = await supabase
      .from('veterinarians')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },

  async create(userId: string, input: VeterinarianInput): Promise<VeterinarianRow> {
    const { data, error } = await supabase
      .from('veterinarians')
      .insert(toRecord(userId, input))
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(
    userId: string,
    veterinarianId: string,
    input: VeterinarianInput,
  ): Promise<VeterinarianRow> {
    const record: VeterinarianUpdate = toRecord(userId, input)
    const { data, error } = await supabase
      .from('veterinarians')
      .update(record)
      .eq('id', veterinarianId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async softDelete(userId: string, veterinarianId: string): Promise<void> {
    const { error } = await supabase
      .from('veterinarians')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', veterinarianId)
      .eq('user_id', userId)

    if (error) throw error
  },
}
