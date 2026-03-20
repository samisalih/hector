import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Subtask } from '@/types/database.types'
import type { UpdateSubtaskRequest } from '@/types/api.types'
import { ServiceError } from './errors'

type DbClient = SupabaseClient<Database>

export async function getSubtasks(
  supabase: DbClient,
  taskId: string,
  userId: string
): Promise<Subtask[]> {
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .order('position', { ascending: true })

  if (error) throw new ServiceError('NOT_FOUND', error.message)
  return data ?? []
}

export async function createSubtask(
  supabase: DbClient,
  taskId: string,
  title: string,
  userId: string
): Promise<Subtask> {
  const { data: maxData } = await supabase
    .from('subtasks')
    .select('position')
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = maxData ? maxData.position + 1 : 0

  const { data, error } = await supabase
    .from('subtasks')
    .insert({
      task_id: taskId,
      user_id: userId,
      title,
      position,
    })
    .select()
    .single()

  if (error || !data) throw new ServiceError('CONFLICT', error?.message ?? 'Failed to create subtask')
  return data
}

export async function updateSubtask(
  supabase: DbClient,
  subtaskId: string,
  subtaskData: UpdateSubtaskRequest,
  userId: string
): Promise<Subtask> {
  const { data, error } = await supabase
    .from('subtasks')
    .update({
      ...(subtaskData.title !== undefined && { title: subtaskData.title }),
      ...(subtaskData.isCompleted !== undefined && {
        is_completed: subtaskData.isCompleted,
        completed_at: subtaskData.isCompleted ? new Date().toISOString() : null,
      }),
      ...(subtaskData.position !== undefined && { position: subtaskData.position }),
    })
    .eq('id', subtaskId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'Subtask not found')
  return data
}

export async function deleteSubtask(
  supabase: DbClient,
  subtaskId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', subtaskId)
    .eq('user_id', userId)

  if (error) throw new ServiceError('NOT_FOUND', error.message)
}

export async function toggleComplete(
  supabase: DbClient,
  subtaskId: string,
  userId: string
): Promise<Subtask> {
  const { data: current, error: fetchError } = await supabase
    .from('subtasks')
    .select('*')
    .eq('id', subtaskId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !current) throw new ServiceError('NOT_FOUND', 'Subtask not found')

  const isCompleted = !current.is_completed

  const { data, error } = await supabase
    .from('subtasks')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('id', subtaskId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'Subtask not found')
  return data
}

export async function reorderSubtasks(
  supabase: DbClient,
  taskId: string,
  subtaskIds: string[],
  userId: string
): Promise<void> {
  for (let i = 0; i < subtaskIds.length; i++) {
    const { error } = await supabase
      .from('subtasks')
      .update({ position: i })
      .eq('id', subtaskIds[i])
      .eq('task_id', taskId)
      .eq('user_id', userId)

    if (error) throw new ServiceError('CONFLICT', error.message)
  }
}
