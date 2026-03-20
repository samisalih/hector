import { type NextRequest } from 'next/server'
import { authenticateSessionOnly } from '@/lib/api/auth'
import { successResponse, createdResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, CreateApiKeySchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getKeys, createKey } from '@/lib/services/api-keys.service'

// API-Key-Endpoints sind NUR per Session erreichbar
export async function GET(request: NextRequest) {
  const auth = await authenticateSessionOnly(request)
  if (!auth) return unauthorizedResponse()

  try {
    const supabase = createRouteHandlerClient(request)
    const keys = await getKeys(supabase, auth.userId)
    return successResponse(keys)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticateSessionOnly(request)
  if (!auth) return unauthorizedResponse()

  const body = await request.json().catch(() => null)
  const parsed = parseBody(CreateApiKeySchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)
    const { key, record } = await createKey(supabase, parsed.data, auth.userId)
    return createdResponse({ ...record, key })
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
