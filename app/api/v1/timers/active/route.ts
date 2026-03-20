import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, serviceErrorResponse, unauthorizedResponse } from '@/lib/api/response'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getActiveTimer } from '@/lib/services/time-entries.service'

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  try {
    const supabase = createRouteHandlerClient(request)
    const timer = await getActiveTimer(supabase, auth.userId)

    if (!timer) {
      return successResponse(null)
    }

    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(timer.started_at).getTime()) / 1000
    )

    return successResponse({
      entryId: timer.id,
      taskId: timer.task_id,
      startedAt: timer.started_at,
      elapsedSeconds,
    })
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
