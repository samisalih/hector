import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, noContentResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, UpdateListSchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getListWithTasks, updateList, deleteList } from '@/lib/services/lists.service'

type Params = { params: Promise<{ listId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { listId } = await params
  try {
    const supabase = createRouteHandlerClient(request)
    const list = await getListWithTasks(supabase, listId, auth.userId)
    return successResponse(list)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { listId } = await params
  const body = await request.json().catch(() => null)
  const parsed = parseBody(UpdateListSchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)
    const list = await updateList(supabase, listId, parsed.data, auth.userId)
    return successResponse(list)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { listId } = await params
  try {
    const supabase = createRouteHandlerClient(request)
    await deleteList(supabase, listId, auth.userId)
    return noContentResponse()
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
