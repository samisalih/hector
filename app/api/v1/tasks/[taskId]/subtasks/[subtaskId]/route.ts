import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, noContentResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, UpdateSubtaskSchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { updateSubtask, deleteSubtask } from '@/lib/services/subtasks.service'

type Params = { params: Promise<{ taskId: string; subtaskId: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { subtaskId } = await params
  const body = await request.json().catch(() => null)
  const parsed = parseBody(UpdateSubtaskSchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)
    const subtask = await updateSubtask(supabase, subtaskId, parsed.data, auth.userId)
    return successResponse(subtask)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { subtaskId } = await params
  try {
    const supabase = createRouteHandlerClient(request)
    await deleteSubtask(supabase, subtaskId, auth.userId)
    return noContentResponse()
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
