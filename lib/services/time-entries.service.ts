import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, TimeEntry } from '@/types/database.types'
import type {
  CreateManualTimeEntryRequest,
  TimeEntryFilters,
  UpdateTimeEntryRequest,
} from '@/types/api.types'
import { ServiceError } from './errors'

type DbClient = SupabaseClient<Database>

export async function getEntriesByTask(
  supabase: DbClient,
  taskId: string,
  userId: string
): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) throw new ServiceError('NOT_FOUND', error.message)
  return data ?? []
}

export async function getAllEntries(
  supabase: DbClient,
  userId: string,
  filters?: TimeEntryFilters
): Promise<TimeEntry[]> {
  let query = supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (filters?.from) {
    query = query.gte('started_at', filters.from)
  }
  if (filters?.to) {
    query = query.lte('started_at', filters.to)
  }
  if (filters?.taskId) {
    query = query.eq('task_id', filters.taskId)
  }

  const { data, error } = await query

  if (error) throw new ServiceError('NOT_FOUND', error.message)
  return data ?? []
}

export async function getActiveTimer(
  supabase: DbClient,
  userId: string
): Promise<TimeEntry | null> {
  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .is('ended_at', null)
    .limit(1)
    .maybeSingle()

  return data ?? null
}

export async function startTimer(
  supabase: DbClient,
  taskId: string,
  userId: string
): Promise<TimeEntry> {
  const active = await getActiveTimer(supabase, userId)
  if (active) {
    throw new ServiceError('TIMER_ALREADY_RUNNING', 'A timer is already running')
  }

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      task_id: taskId,
      user_id: userId,
      started_at: new Date().toISOString(),
      is_manual: false,
    })
    .select()
    .single()

  if (error || !data) throw new ServiceError('CONFLICT', error?.message ?? 'Failed to start timer')
  return data
}

export async function stopTimer(
  supabase: DbClient,
  entryId: string,
  notes: string | undefined,
  userId: string
): Promise<TimeEntry> {
  const { data: entry, error: fetchError } = await supabase
    .from('time_entries')
    .select('*')
    .eq('id', entryId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !entry) throw new ServiceError('NOT_FOUND', 'Time entry not found')

  const endedAt = new Date()
  const startedAt = new Date(entry.started_at)
  const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)

  const { data, error } = await supabase
    .from('time_entries')
    .update({
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds,
      ...(notes !== undefined && { notes }),
    })
    .eq('id', entryId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'Time entry not found')
  return data
}

export async function createManualEntry(
  supabase: DbClient,
  entryData: CreateManualTimeEntryRequest & { taskId: string },
  userId: string
): Promise<TimeEntry> {
  const startedAt = new Date(entryData.startedAt)
  const endedAt = new Date(entryData.endedAt)
  const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      task_id: entryData.taskId,
      user_id: userId,
      started_at: entryData.startedAt,
      ended_at: entryData.endedAt,
      duration_seconds: durationSeconds,
      notes: entryData.notes ?? null,
      is_manual: true,
    })
    .select()
    .single()

  if (error || !data) throw new ServiceError('CONFLICT', error?.message ?? 'Failed to create entry')
  return data
}

export async function updateEntry(
  supabase: DbClient,
  entryId: string,
  entryData: UpdateTimeEntryRequest,
  userId: string
): Promise<TimeEntry> {
  const updatePayload: Database['public']['Tables']['time_entries']['Update'] = {}

  if (entryData.startedAt !== undefined) updatePayload.started_at = entryData.startedAt
  if (entryData.endedAt !== undefined) updatePayload.ended_at = entryData.endedAt
  if (entryData.notes !== undefined) updatePayload.notes = entryData.notes

  if (entryData.startedAt !== undefined && entryData.endedAt !== undefined) {
    const startedAt = new Date(entryData.startedAt)
    const endedAt = new Date(entryData.endedAt)
    updatePayload.duration_seconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
  }

  const { data, error } = await supabase
    .from('time_entries')
    .update(updatePayload)
    .eq('id', entryId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'Time entry not found')
  return data
}

export async function deleteEntry(
  supabase: DbClient,
  entryId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId)

  if (error) throw new ServiceError('NOT_FOUND', error.message)
}

export async function getTaskTotalDuration(
  supabase: DbClient,
  taskId: string
): Promise<number> {
  const { data, error } = await supabase.rpc('get_task_total_duration', {
    p_task_id: taskId,
  })

  if (error) throw new ServiceError('NOT_FOUND', error.message)
  return data ?? 0
}
