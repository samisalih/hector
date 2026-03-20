import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, unauthorizedResponse } from '@/lib/api/response'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export type TaskTimeEntry = { id: string; durationSeconds: number }

async function resolveTaskIds(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  userId: string,
  taskIds: string[],
  listIds: string[]
): Promise<string[]> {
  if (listIds.length > 0) {
    const { data } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', userId)
      .in('list_id', listIds)
    return (data ?? []).map(t => t.id)
  }
  return taskIds
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const params = request.nextUrl.searchParams
  const taskIds = params.get('taskIds')?.split(',').filter(Boolean) ?? []
  const listIds = params.get('listIds')?.split(',').filter(Boolean) ?? []

  if (taskIds.length === 0 && listIds.length === 0) return successResponse({})

  const supabase = createRouteHandlerClient(request)
  const resolvedTaskIds = await resolveTaskIds(supabase, auth.userId, taskIds, listIds)

  if (resolvedTaskIds.length === 0) return successResponse({})

  const { data } = await supabase
    .from('time_entries')
    .select('id, task_id, duration_seconds')
    .eq('user_id', auth.userId)
    .in('task_id', resolvedTaskIds)
    .not('duration_seconds', 'is', null)
    .order('created_at', { ascending: true })

  const grouped: Record<string, TaskTimeEntry[]> = {}
  for (const entry of data ?? []) {
    if (entry.duration_seconds) {
      if (!grouped[entry.task_id]) grouped[entry.task_id] = []
      grouped[entry.task_id].push({ id: entry.id, durationSeconds: entry.duration_seconds })
    }
  }

  return successResponse(grouped)
}
