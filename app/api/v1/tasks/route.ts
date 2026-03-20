import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getTasksForLists } from '@/lib/services/tasks.service'

// GET /api/v1/tasks?listIds=id1,id2,id3
export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const listIds = request.nextUrl.searchParams
    .get('listIds')
    ?.split(',')
    .filter(Boolean) ?? []

  if (listIds.length === 0) return errorResponse('listIds query param is required', 400)

  const supabase = createRouteHandlerClient(request)
  const tasksByList = await getTasksForLists(supabase, listIds, auth.userId)
  return successResponse(tasksByList)
}
