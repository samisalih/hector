import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Task, TaskList } from '@/types/database.types'
import type { CreateListRequest, UpdateListRequest } from '@/types/api.types'
import { ServiceError } from './errors'

type DbClient = SupabaseClient<Database>

export async function getLists(
  supabase: DbClient,
  userId: string
): Promise<TaskList[]> {
  const { data, error } = await supabase
    .from('task_lists')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })

  if (error) throw new ServiceError('NOT_FOUND', error.message)
  return data ?? []
}

export async function getListById(
  supabase: DbClient,
  listId: string,
  userId: string
): Promise<TaskList> {
  const { data, error } = await supabase
    .from('task_lists')
    .select('*')
    .eq('id', listId)
    .eq('user_id', userId)
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'List not found')
  return data
}

export async function getListWithTasks(
  supabase: DbClient,
  listId: string,
  userId: string
): Promise<TaskList & { tasks: Task[] }> {
  const { data, error } = await supabase
    .from('task_lists')
    .select('*, tasks(*)')
    .eq('id', listId)
    .eq('user_id', userId)
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'List not found')

  const { tasks, ...list } = data as TaskList & { tasks: Task[] }
  return { ...list, tasks: tasks ?? [] }
}

export async function createList(
  supabase: DbClient,
  listData: CreateListRequest,
  userId: string
): Promise<TaskList> {
  const { data: maxData } = await supabase
    .from('task_lists')
    .select('position')
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = maxData ? maxData.position + 1 : 0

  const { data, error } = await supabase
    .from('task_lists')
    .insert({
      user_id: userId,
      title: listData.title,
      color: listData.color ?? null,
      icon: listData.icon ?? null,
      position,
    })
    .select()
    .single()

  if (error || !data) throw new ServiceError('CONFLICT', error?.message ?? 'Failed to create list')
  return data
}

export async function updateList(
  supabase: DbClient,
  listId: string,
  listData: UpdateListRequest,
  userId: string
): Promise<TaskList> {
  const { data, error } = await supabase
    .from('task_lists')
    .update({
      ...(listData.title !== undefined && { title: listData.title }),
      ...(listData.color !== undefined && { color: listData.color }),
      ...(listData.icon !== undefined && { icon: listData.icon }),
      ...(listData.position !== undefined && { position: listData.position }),
    })
    .eq('id', listId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'List not found')
  return data
}

export async function deleteList(
  supabase: DbClient,
  listId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('task_lists')
    .delete()
    .eq('id', listId)
    .eq('user_id', userId)

  if (error) throw new ServiceError('NOT_FOUND', error.message)
}

export async function reorderLists(
  supabase: DbClient,
  listIds: string[],
  userId: string
): Promise<void> {
  const { error } = await supabase.rpc('reorder_lists', {
    p_user_id: userId,
    p_list_ids: listIds,
  })

  if (error) throw new ServiceError('CONFLICT', error.message)
}
