import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, ReorderTasksSchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { reorderTasks } from '@/lib/services/tasks.service'

type Params = { params: Promise<{ listId: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { listId } = await params
  const body = await request.json().catch(() => null)
  const parsed = parseBody(ReorderTasksSchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)
    await reorderTasks(supabase, listId, parsed.data.taskIds, auth.userId)
    return successResponse({ ok: true })
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
