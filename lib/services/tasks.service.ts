import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Subtask, Task } from '@/types/database.types'
import type { CreateTaskRequest, UpdateTaskRequest } from '@/types/api.types'
import { ServiceError } from './errors'

type DbClient = SupabaseClient<Database>

export async function getTasksForLists(
  supabase: DbClient,
  listIds: string[],
  userId: string
): Promise<Record<string, Task[]>> {
  if (listIds.length === 0) return {}
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .in('list_id', listIds)
    .order('position', { ascending: true })
    .order('is_completed', { ascending: true })

  if (error || !data) return {}
  return data.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.list_id]) acc[task.list_id] = []
    acc[task.list_id].push(task)
    return acc
  }, {})
}

export async function getTasksByList(
  supabase: DbClient,
  listId: string,
  userId: string
): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('list_id', listId)
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('is_completed', { ascending: true })

  if (error) throw new ServiceError('NOT_FOUND', error.message)
  return data ?? []
}

export async function getTaskById(
  supabase: DbClient,
  taskId: string,
  userId: string
): Promise<Task & { subtasks: Subtask[]; totalDurationSeconds: number }> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, subtasks(*)')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'Task not found')

  const { data: duration } = await supabase.rpc('get_task_total_duration', {
    p_task_id: taskId,
  })

  const { subtasks, ...task } = data as Task & { subtasks: Subtask[] }
  return {
    ...task,
    subtasks: subtasks ?? [],
    totalDurationSeconds: duration ?? 0,
  }
}

export async function createTask(
  supabase: DbClient,
  taskData: CreateTaskRequest,
  userId: string
): Promise<Task> {
  const { data: maxData } = await supabase
    .from('tasks')
    .select('position')
    .eq('list_id', taskData.listId)
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = maxData ? maxData.position + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      list_id: taskData.listId,
      user_id: userId,
      title: taskData.title,
      description: taskData.description ?? null,
      due_date: taskData.dueDate ?? null,
      due_time: taskData.dueTime ?? null,
      priority: taskData.priority ?? 'none',
      position,
    })
    .select()
    .single()

  if (error || !data) throw new ServiceError('CONFLICT', error?.message ?? 'Failed to create task')
  return data
}

export async function updateTask(
  supabase: DbClient,
  taskId: string,
  taskData: UpdateTaskRequest,
  userId: string
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...(taskData.listId !== undefined && { list_id: taskData.listId }),
      ...(taskData.title !== undefined && { title: taskData.title }),
      ...(taskData.description !== undefined && { description: taskData.description }),
      ...(taskData.dueDate !== undefined && { due_date: taskData.dueDate }),
      ...(taskData.dueTime !== undefined && { due_time: taskData.dueTime }),
      ...(taskData.priority !== undefined && { priority: taskData.priority }),
      ...(taskData.isCompleted !== undefined && { is_completed: taskData.isCompleted }),
      ...(taskData.position !== undefined && { position: taskData.position }),
    })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'Task not found')
  return data
}

export async function deleteTask(
  supabase: DbClient,
  taskId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)

  if (error) throw new ServiceError('NOT_FOUND', error.message)
}

export async function toggleComplete(
  supabase: DbClient,
  taskId: string,
  userId: string
): Promise<Task> {
  const current = await getTaskById(supabase, taskId, userId)
  const isCompleted = !current.is_completed

  const { data, error } = await supabase
    .from('tasks')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'Task not found')
  return data
}

export async function moveTask(
  supabase: DbClient,
  taskId: string,
  newListId: string,
  userId: string
): Promise<Task> {
  const { data: maxData } = await supabase
    .from('tasks')
    .select('position')
    .eq('list_id', newListId)
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = maxData ? maxData.position + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .update({ list_id: newListId, position })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'Task not found')
  return data
}

export async function reorderTasks(
  supabase: DbClient,
  listId: string,
  taskIds: string[],
  userId: string
): Promise<void> {
  const { error } = await supabase.rpc('reorder_tasks', {
    p_list_id: listId,
    p_user_id: userId,
    p_task_ids: taskIds,
  })

  if (error) throw new ServiceError('CONFLICT', error.message)
}
