import { type NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { validateApiKey } from '@/lib/services/api-keys.service'
import { unauthorizedResponse } from './response'
import type { NextResponse } from 'next/server'

export type AuthMethod = 'session' | 'api-key'

export interface AuthResult {
  userId: string
  method: AuthMethod
}

/**
 * Dual-Auth: Bearer API-Key zuerst, dann Session-Cookie.
 * Returns null if no valid auth is found.
 */
export async function authenticate(request: NextRequest): Promise<AuthResult | null> {
  const authorization = request.headers.get('authorization')

  if (authorization?.startsWith('Bearer ')) {
    const rawKey = authorization.slice(7).trim()
    if (rawKey.startsWith('tsx_')) {
      const userId = await validateApiKey(rawKey)
      if (userId) {
        return { userId, method: 'api-key' }
      }
      return null
    }
  }

  const supabase = createRouteHandlerClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    return { userId: user.id, method: 'session' }
  }

  return null
}

/**
 * Like authenticate(), but blocks API key auth.
 * For endpoints that MUST only be reachable via session (e.g. API key management).
 */
export async function authenticateSessionOnly(request: NextRequest): Promise<AuthResult | null> {
  const result = await authenticate(request)
  if (!result) return null
  if (result.method === 'api-key') return null
  return result
}

export { unauthorizedResponse }
