import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, createdResponse, serviceErrorResponse, unauthorizedResponse, errorResponse } from '@/lib/api/response'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getAllEntries } from '@/lib/services/time-entries.service'

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { searchParams } = request.nextUrl
  const filters = {
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    taskId: searchParams.get('taskId') ?? undefined,
  }

  try {
    const supabase = createRouteHandlerClient(request)
    const entries = await getAllEntries(supabase, auth.userId, filters)
    return successResponse(entries)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  let body: { taskId: string; durationSeconds: number; date?: string }
  try {
    body = await request.json()
  } catch {
    return errorResponse('Invalid JSON', 400)
  }

  const { taskId, durationSeconds, date } = body
  if (!taskId || typeof durationSeconds !== 'number' || durationSeconds <= 0) {
    return errorResponse('taskId and durationSeconds (> 0) required', 400)
  }

  try {
    const supabase = createRouteHandlerClient(request)
    // If a date is provided, anchor startedAt to midnight of that date (UTC)
    // so the entry is correctly attributed to the right day regardless of duration.
    const startedAt = date
      ? new Date(date + 'T00:00:00.000Z')
      : new Date(Date.now() - durationSeconds * 1000)
    const endedAt = new Date(startedAt.getTime() + durationSeconds * 1000)

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        task_id: taskId,
        user_id: auth.userId,
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        duration_seconds: durationSeconds,
        is_manual: true,
      })
      .select()
      .single()

    if (error || !data) return errorResponse(error?.message ?? 'Failed', 500)
    return createdResponse(data)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
