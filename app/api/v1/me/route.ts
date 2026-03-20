import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, UpdateProfileSchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { ServiceError } from '@/lib/services/errors'

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  try {
    const supabase = createRouteHandlerClient(request)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', auth.userId)
      .single()

    if (error || !data) throw new ServiceError('NOT_FOUND', 'Profile not found')
    return successResponse(data)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const body = await request.json().catch(() => null)
  const parsed = parseBody(UpdateProfileSchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)
    const updatePayload: Record<string, unknown> = {}
    if (parsed.data.displayName !== undefined) updatePayload.display_name = parsed.data.displayName
    if (parsed.data.theme !== undefined) updatePayload.theme = parsed.data.theme

    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', auth.userId)
      .select()
      .single()

    if (error || !data) throw new ServiceError('NOT_FOUND', 'Profile not found')
    return successResponse(data)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
