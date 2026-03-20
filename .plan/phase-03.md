# Phase 3 — Supabase Clients & Next.js Middleware

**Status:** ✅ Fertig
**Abhängigkeiten:** Phase 1, Phase 2
**Gibt frei:** Phase 4, Phase 10

## Ziel
Konfigurierte Supabase-Clients für Browser und Server, plus Next.js Middleware für Auth-Schutz aller App-Routen. Nach dieser Phase können Server Components und API Routes sicher auf Supabase zugreifen.

---

## Schritt 3.1 — Browser-Client

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `createBrowserClient` einrichten | `lib/supabase/client.ts` | ✅ |
| Singleton-Pattern (kein neuer Client pro Render) | `lib/supabase/client.ts` | ✅ |

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## Schritt 3.2 — Server-Client

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `createServerClient` für Server Components | `lib/supabase/server.ts` | ✅ |
| Cookie-Handling via `next/headers` (async in Next.js 16) | `lib/supabase/server.ts` | ✅ |
| Separate Funktion für API Routes (Request/Response-basiert) | `lib/supabase/server.ts` | ✅ (`createRouteHandlerClient`) |
| Service-Role-Client für Admin-Operationen (API-Key-Validation) | `lib/supabase/server.ts` | ✅ (`createServiceRoleClient`) |

```typescript
// lib/supabase/server.ts
// createServerComponentClient()  → für Server Components (liest cookies)
// createRouteHandlerClient(req)  → für API Route Handlers
// createServiceRoleClient()      → nur für API-Key-Validation (nie im Frontend!)
```

---

## Schritt 3.3 — Middleware

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Session-Refresh-Logik | `lib/supabase/middleware.ts` | ✅ |
| Auth-Guard: Redirect zu `/login` wenn keine Session | `proxy.ts` (Next.js 16: `middleware.ts` → `proxy.ts`) | ✅ |
| Matcher: alle Routen außer API, `_next`, statische Assets | `proxy.ts` | ✅ |
| Öffentliche Routen whitelist (`/login`, `/register`) | `proxy.ts` | ✅ |

```typescript
// middleware.ts (Root)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon|manifest|sw\\.js|icons|fonts).*)',
  ],
}
```

**Ablauf der Middleware:**
```
Request kommt rein
    ↓
Supabase Session refreshen (Cookie aktualisieren)
    ↓
Ist Route öffentlich? (/login, /register)
    ↓ Nein
Hat User eine gültige Session?
    ↓ Nein → Redirect zu /login
    ↓ Ja  → Request durchlassen
```

---

## Verzeichnisstruktur nach Phase 3

```
hector/
├── middleware.ts                    ← Root-Level Auth-Guard
└── lib/
    └── supabase/
        ├── client.ts                ← Browser-Client
        ├── server.ts                ← Server-Client (SSR + API Routes)
        └── middleware.ts            ← Session-Refresh-Hilfsfunktion
```

---

## Testkriterien

- [ ] Nicht eingeloggter User wird von `/` zu `/login` redirectet (testbar nach Phase 10)
- [ ] Nach Login wird User zu `/` weitergeleitet (testbar nach Phase 10)
- [x] API Routes unter `/api/v1/` sind vom Proxy NICHT betroffen (Matcher schließt `/api/` aus)
- [x] Session-Cookie wird bei jedem Request refresht (`updateSession` in `lib/supabase/middleware.ts`)
- [ ] Server Component kann via `createServerComponentClient()` Daten lesen (testbar nach Phase 6)

**Hinweis:** In Next.js 16 wurde `middleware.ts` zu `proxy.ts` umbenannt (Funktion: `proxy` statt `middleware`). Automatische Deprecation-Warnung im Dev-Server wenn `middleware.ts` verwendet wird.
