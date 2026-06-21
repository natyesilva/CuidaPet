export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string
          name: string
          email: string
          pets_count: string
          main_problem: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          pets_count: string
          main_problem: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          pets_count?: string
          main_problem?: string
          created_at?: string
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
