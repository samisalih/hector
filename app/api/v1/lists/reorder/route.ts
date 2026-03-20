import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, ReorderListsSchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { reorderLists } from '@/lib/services/lists.service'

export async function POST(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const body = await request.json().catch(() => null)
  const parsed = parseBody(ReorderListsSchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)
    await reorderLists(supabase, parsed.data.listIds, auth.userId)
    return successResponse({ ok: true })
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
