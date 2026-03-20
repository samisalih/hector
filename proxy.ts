import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Öffentliche Routen — kein Login erforderlich
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Session refreshen und userId holen
  const { response, userId } = await updateSession(request)

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  // Nicht eingeloggt → auf geschützter Route → zu /login weiterleiten
  if (!userId && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Eingeloggt → auf Auth-Seite → zur App weiterleiten
  if (userId && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Alle Routen außer statische Assets, API-Routen (eigene Auth-Logik) und Next.js-Internals
    '/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons|fonts).*)',
  ],
}
