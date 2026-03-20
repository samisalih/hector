import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, createdResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, CreateSubtaskSchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getSubtasks, createSubtask } from '@/lib/services/subtasks.service'

type Params = { params: Promise<{ taskId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { taskId } = await params
  try {
    const supabase = createRouteHandlerClient(request)
    const subtasks = await getSubtasks(supabase, taskId, auth.userId)
    return successResponse(subtasks)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { taskId } = await params
  const body = await request.json().catch(() => null)
  const parsed = parseBody(CreateSubtaskSchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)
    const subtask = await createSubtask(supabase, taskId, parsed.data.title, auth.userId)
    return createdResponse(subtask)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
