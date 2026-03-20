import { type NextRequest } from 'next/server'
import { authenticateSessionOnly } from '@/lib/api/auth'
import { noContentResponse, serviceErrorResponse, unauthorizedResponse } from '@/lib/api/response'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { deleteKey } from '@/lib/services/api-keys.service'

type Params = { params: Promise<{ keyId: string }> }

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await authenticateSessionOnly(request)
  if (!auth) return unauthorizedResponse()

  const { keyId } = await params
  try {
    const supabase = createRouteHandlerClient(request)
    await deleteKey(supabase, keyId, auth.userId)
    return noContentResponse()
  } catch (err) {
    return serviceErrorResponse(err)
  }
}
