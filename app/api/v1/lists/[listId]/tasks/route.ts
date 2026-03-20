import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, createdResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, CreateTaskSchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getTasksByList, createTask } from '@/lib/services/tasks.service'

type Params = { params: Promise<{ listId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { listId } = await params
  try {
    const supabase = createRouteHandlerClient(request)
    const tasks = await getTasksByList(supabase, listId, auth.userId)
    return successResponse(tasks)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { listId } = await params
  const body = await request.json().catch(() => null)
  const parsed = parseBody(CreateTaskSchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)
    const task = await createTask(supabase, { ...parsed.data, listId }, auth.userId)
    return createdResponse(task)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
