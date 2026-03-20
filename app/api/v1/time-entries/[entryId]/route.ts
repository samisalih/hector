import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, noContentResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { entryId } = await params
  const supabase = createRouteHandlerClient(request)

  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', auth.userId)

  if (error) return errorResponse(error.message, 404)
  return noContentResponse()
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const { entryId } = await params
  let body: { durationSeconds: number }
  try {
    body = await request.json()
  } catch {
    return errorResponse('Invalid JSON', 400)
  }

  const { durationSeconds } = body
  if (typeof durationSeconds !== 'number' || durationSeconds <= 0) {
    return errorResponse('durationSeconds (> 0) required', 400)
  }

  const supabase = createRouteHandlerClient(request)
  const endedAt = new Date()
  const startedAt = new Date(endedAt.getTime() - durationSeconds * 1000)

  const { data, error } = await supabase
    .from('time_entries')
    .update({
      duration_seconds: durationSeconds,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
    })
    .eq('id', entryId)
    .eq('user_id', auth.userId)
    .select()
    .single()

  if (error || !data) return errorResponse(error?.message ?? 'Not found', 404)
  return successResponse(data)
}
