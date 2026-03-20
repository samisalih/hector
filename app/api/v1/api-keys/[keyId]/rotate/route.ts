import { type NextRequest } from 'next/server'
import { authenticateSessionOnly } from '@/lib/api/auth'
import { successResponse, serviceErrorResponse, unauthorizedResponse } from '@/lib/api/response'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { rotateKey } from '@/lib/services/api-keys.service'

type Params = { params: Promise<{ keyId: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await authenticateSessionOnly(request)
  if (!auth) return unauthorizedResponse()

  const { keyId } = await params
  try {
    const supabase = createRouteHandlerClient(request)
    const { key, record } = await rotateKey(supabase, keyId, auth.userId)
    return successResponse({ ...record, key })
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
