import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api/response'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const dateParam =
    request.nextUrl.searchParams.get('date') ?? new Date().toISOString().slice(0, 10)

  const dayStart = new Date(dateParam + 'T00:00:00.000Z')
  const dayEnd = new Date(dayStart.getTime() + 86400000)

  const supabase = createRouteHandlerClient(request)

  // Step 1: fetch time entries for the day
  const { data: entries, error: entriesError } = await supabase
    .from('time_entries')
    .select('id, duration_seconds, started_at, task_id')
    .eq('user_id', auth.userId)
    .gte('started_at', dayStart.toISOString())
    .lt('started_at', dayEnd.toISOString())
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: false })

  if (entriesError) return errorResponse(entriesError.message, 500)
  if (!entries || entries.length === 0) {
    return successResponse({ date: dateParam, totalSeconds: 0, entries: [] })
  }

  // Step 2: fetch tasks for the found task IDs
  const taskIds = [...new Set(entries.map(e => e.task_id).filter(Boolean))]
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, list_id')
    .in('id', taskIds)

  if (tasksError) return errorResponse(tasksError.message, 500)

  // Step 3: fetch lists for the found list IDs
  const listIds = [...new Set((tasks ?? []).map(t => t.list_id).filter(Boolean))]
  const { data: lists, error: listsError } = await supabase
    .from('task_lists')
    .select('id, title')
    .in('id', listIds)

  if (listsError) return errorResponse(listsError.message, 500)

  // Step 4: join in JS
  const taskMap = new Map((tasks ?? []).map(t => [t.id, t]))
  const listMap = new Map((lists ?? []).map(l => [l.id, l]))

  const result = entries.map(entry => {
    const task = taskMap.get(entry.task_id)
    const list = task ? listMap.get(task.list_id) : undefined
    return {
      id: entry.id,
      durationSeconds: entry.duration_seconds ?? 0,
      startedAt: entry.started_at,
      taskId: entry.task_id ?? '',
      taskTitle: task?.title ?? '',
      listId: task?.list_id ?? '',
      listTitle: list?.title ?? '',
    }
  })

  const totalSeconds = result.reduce((sum, e) => sum + e.durationSeconds, 0)

  return successResponse({ date: dateParam, totalSeconds, entries: result })
}
