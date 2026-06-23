export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      dose_schedules: {
        Row: {
          applied_at: string | null
          created_at: string
          id: string
          notes: string | null
          pet_id: string
          scheduled_at: string
          status: string
          treatment_id: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          pet_id: string
          scheduled_at: string
          status?: string
          treatment_id: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          pet_id?: string
          scheduled_at?: string
          status?: string
          treatment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'dose_schedules_pet_id_fkey'
            columns: ['pet_id']
            isOneToOne: false
            referencedRelation: 'pets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'dose_schedules_treatment_id_fkey'
            columns: ['treatment_id']
            isOneToOne: false
            referencedRelation: 'treatments'
            referencedColumns: ['id']
          },
        ]
      }
      pets: {
        Row: {
          birth_date: string | null
          breed: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          species: string
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          species: string
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          species?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      pet_vaccines: {
        Row: {
          applied_at: string | null
          clinic_name: string | null
          created_at: string
          id: string
          name: string
          next_due_at: string | null
          notes: string | null
          pet_id: string
          updated_at: string
          user_id: string
          veterinarian_name: string | null
        }
        Insert: {
          applied_at?: string | null
          clinic_name?: string | null
          created_at?: string
          id?: string
          name: string
          next_due_at?: string | null
          notes?: string | null
          pet_id: string
          updated_at?: string
          user_id: string
          veterinarian_name?: string | null
        }
        Update: {
          applied_at?: string | null
          clinic_name?: string | null
          created_at?: string
          id?: string
          name?: string
          next_due_at?: string | null
          notes?: string | null
          pet_id?: string
          updated_at?: string
          user_id?: string
          veterinarian_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pet_vaccines_pet_id_fkey'
            columns: ['pet_id']
            isOneToOne: false
            referencedRelation: 'pets'
            referencedColumns: ['id']
          },
        ]
      }
      pet_weight_records: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          pet_id: string
          recorded_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id: string
          recorded_at: string
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id?: string
          recorded_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: 'pet_weight_records_pet_id_fkey'
            columns: ['pet_id']
            isOneToOne: false
            referencedRelation: 'pets'
            referencedColumns: ['id']
          },
        ]
      }
      treatments: {
        Row: {
          created_at: string
          dose: string
          dose_unit: string
          end_at: string
          frequency_hours: number
          id: string
          instructions: string | null
          medication_name: string
          pet_id: string
          start_at: string
          status: string
          updated_at: string
          user_id: string
          veterinarian_name: string | null
        }
        Insert: {
          created_at?: string
          dose: string
          dose_unit: string
          end_at: string
          frequency_hours: number
          id?: string
          instructions?: string | null
          medication_name: string
          pet_id: string
          start_at: string
          status?: string
          updated_at?: string
          user_id: string
          veterinarian_name?: string | null
        }
        Update: {
          created_at?: string
          dose?: string
          dose_unit?: string
          end_at?: string
          frequency_hours?: number
          id?: string
          instructions?: string | null
          medication_name?: string
          pet_id?: string
          start_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          veterinarian_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'treatments_pet_id_fkey'
            columns: ['pet_id']
            isOneToOne: false
            referencedRelation: 'pets'
            referencedColumns: ['id']
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          main_problem: string
          name: string
          pets_count: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          main_problem: string
          name: string
          pets_count: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          main_problem?: string
          name?: string
          pets_count?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
