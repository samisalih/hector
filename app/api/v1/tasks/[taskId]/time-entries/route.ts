import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, createdResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, StartTimerSchema, CreateManualEntrySchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getEntriesByTask, startTimer, createManualEntry } from '@/lib/services/time-entries.service'

type Params = { params: Promise<{ taskId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { taskId } = await params
  try {
    const supabase = createRouteHandlerClient(request)
    const entries = await getEntriesByTask(supabase, taskId, auth.userId)
    return successResponse(entries)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { taskId } = await params
  const body = await request.json().catch(() => null)

  // Unterscheide: { action: 'start' } vs. manueller Eintrag { startedAt, endedAt }
  if (body && body.action === 'start') {
    const parsed = parseBody(StartTimerSchema, body)
    if ('error' in parsed) return errorResponse(parsed.error, 400)

    try {
      const supabase = createRouteHandlerClient(request)
      const entry = await startTimer(supabase, taskId, auth.userId)
      return createdResponse(entry)
    } catch (err) {
      return serviceErrorResponse(err)
    }
  }

  const parsed = parseBody(CreateManualEntrySchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)
    const entry = await createManualEntry(supabase, { ...parsed.data, taskId }, auth.userId)
    return createdResponse(entry)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
