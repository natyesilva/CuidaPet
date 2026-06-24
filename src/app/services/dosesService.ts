import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type DoseRow = Database['public']['Tables']['dose_schedules']['Row']

function getLocalDayRange(date = new Date()) {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  )
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return { start: start.toISOString(), end: end.toISOString() }
}

export const dosesService = {
  async listToday(userId: string): Promise<DoseRow[]> {
    const range = getLocalDayRange()
    const { data, error } = await supabase
      .from('dose_schedules')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_at', range.start)
      .lt('scheduled_at', range.end)
      .order('scheduled_at', { ascending: true })

    if (error) throw error
    return data
  },

  async listHistory(userId: string): Promise<DoseRow[]> {
    const { data, error } = await supabase
      .from('dose_schedules')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['applied', 'skipped'])
      .order('scheduled_at', { ascending: false })
      .limit(200)

    if (error) throw error
    return data
  },

  async listFuturePending(userId: string): Promise<DoseRow[]> {
    const { data, error } = await supabase
      .from('dose_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gt('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })

    if (error) throw error
    return data
  },

  async listAgenda(userId: string): Promise<DoseRow[]> {
    const start = new Date()
    start.setDate(start.getDate() - 30)
    start.setHours(0, 0, 0, 0)

    const end = new Date()
    end.setDate(end.getDate() + 60)
    end.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('dose_schedules')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_at', start.toISOString())
      .lte('scheduled_at', end.toISOString())
      .order('scheduled_at', { ascending: true })

    if (error) throw error
    return data
  },

  async updateStatus(
    userId: string,
    doseId: string,
    status: 'applied' | 'skipped',
  ): Promise<DoseRow> {
    const { data, error } = await supabase
      .from('dose_schedules')
      .update({
        status,
        applied_at: status === 'applied' ? new Date().toISOString() : null,
      })
      .eq('id', doseId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
