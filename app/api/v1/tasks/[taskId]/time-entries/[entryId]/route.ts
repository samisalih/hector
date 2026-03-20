import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, noContentResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, StopTimerSchema, UpdateTimeEntrySchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { stopTimer, updateEntry, deleteEntry } from '@/lib/services/time-entries.service'

type Params = { params: Promise<{ taskId: string; entryId: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { entryId } = await params
  const body = await request.json().catch(() => null)

  // Unterscheide: { action: 'stop' } vs. normales Update
  if (body && body.action === 'stop') {
    const parsed = parseBody(StopTimerSchema, body)
    if ('error' in parsed) return errorResponse(parsed.error, 400)

    try {
      const supabase = createRouteHandlerClient(request)
      const entry = await stopTimer(supabase, entryId, parsed.data.notes, auth.userId)
      return successResponse(entry)
    } catch (err) {
      return serviceErrorResponse(err)
    }
  }

  const parsed = parseBody(UpdateTimeEntrySchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)
    const entry = await updateEntry(supabase, entryId, parsed.data, auth.userId)
    return successResponse(entry)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { entryId } = await params
  try {
    const supabase = createRouteHandlerClient(request)
    await deleteEntry(supabase, entryId, auth.userId)
    return noContentResponse()
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
