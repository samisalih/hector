import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, noContentResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, UpdateTaskSchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getTaskById, updateTask, deleteTask, moveTask } from '@/lib/services/tasks.service'

type Params = { params: Promise<{ taskId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { taskId } = await params
  try {
    const supabase = createRouteHandlerClient(request)
    const task = await getTaskById(supabase, taskId, auth.userId)
    return successResponse(task)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { taskId } = await params
  const body = await request.json().catch(() => null)
  const parsed = parseBody(UpdateTaskSchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)

    // If listId was provided → move task to another list
    if (parsed.data.listId) {
      const { listId, ...rest } = parsed.data
      // Zuerst verschieben, dann andere Felder updaten wenn vorhanden
      const task = await moveTask(supabase, taskId, listId, auth.userId)
      const hasOtherChanges = Object.keys(rest).length > 0
      if (!hasOtherChanges) return successResponse(task)
      const updated = await updateTask(supabase, taskId, rest, auth.userId)
      return successResponse(updated)
    }

    const task = await updateTask(supabase, taskId, parsed.data, auth.userId)
    return successResponse(task)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { taskId } = await params
  try {
    const supabase = createRouteHandlerClient(request)
    await deleteTask(supabase, taskId, auth.userId)
    return noContentResponse()
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
