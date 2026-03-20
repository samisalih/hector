import { type NextRequest } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { successResponse, createdResponse, serviceErrorResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { parseBody, CreateListSchema } from '@/lib/api/validate'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getLists, createList } from '@/lib/services/lists.service'

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  try {
    const supabase = createRouteHandlerClient(request)
    const lists = await getLists(supabase, auth.userId)
    return successResponse(lists)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return unauthorizedResponse()

  const body = await request.json().catch(() => null)
  const parsed = parseBody(CreateListSchema, body)
  if ('error' in parsed) return errorResponse(parsed.error, 400)

  try {
    const supabase = createRouteHandlerClient(request)
    const list = await createList(supabase, parsed.data, auth.userId)
    return createdResponse(list)
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
