import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Server Component Client — reads cookies via next/headers.
// For Server Components, Server Actions, and Route Handlers (without a Request object).
export async function createServerComponentClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll cannot be called in Server Components — ignore.
            // Session refresh happens in the proxy (proxy.ts).
          }
        },
      },
    }
  )
}

// Route Handler Client — reads request cookies and writes response cookies.
// For API Route Handlers (/api/v1/...) that need direct access to Request/Response.
export function createRouteHandlerClient(request: Request) {
  // Build a cookie adapter that reads from the request.
  // Writing cookies happens via response headers in the API route itself.
  const requestCookies = parseCookies(request.headers.get('cookie') ?? '')

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(requestCookies).map(([name, value]) => ({
            name,
            value,
          }))
        },
        setAll() {
          // Cookie writing is handled by the caller via response headers
        },
      },
    }
  )
}

// Service Role Client — bypasses RLS entirely.
// ONLY for internal server operations: API key validation, admin tasks.
// NEVER use in the frontend or in code influenced by user input.
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...val] = c.trim().split('=')
      return [key.trim(), decodeURIComponent(val.join('='))]
    })
  )
}
