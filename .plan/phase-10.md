# Phase 10 — Auth-Flows

**Status:** ✅ Fertig
**Abhängigkeiten:** Phase 3
**Gibt frei:** Phase 6 (Frontend kann gebaut werden)

## Ziel
Vollständige Auth-UI: Login, Registrierung, Passwort-Reset. Supabase Auth übernimmt die Sicherheit, Next.js Middleware den Schutz der App-Routen. Nach dieser Phase können sich User registrieren und einloggen.

---

## Schritt 10.1 — Login-Seite

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Login-Form: Email + Password | `app/(auth)/login/page.tsx` | 🔲 |
| Submit → Supabase `signInWithPassword()` | `app/(auth)/login/page.tsx` | 🔲 |
| Fehlerbehandlung: "Falsche E-Mail oder Passwort" | `app/(auth)/login/page.tsx` | 🔲 |
| Loading-State während Sign-In | `app/(auth)/login/page.tsx` | 🔲 |
| Redirect zu `/` nach erfolgreichem Login | `app/(auth)/login/page.tsx` | 🔲 |
| Link zu "Registrieren" | `app/(auth)/login/page.tsx` | 🔲 |
| Link zu "Passwort vergessen" | `app/(auth)/login/page.tsx` | 🔲 |
| Design: zentrierte Card, Hector-Logo oben | `app/(auth)/login/page.module.less` | 🔲 |

---

## Schritt 10.2 — Registrierungs-Seite

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Register-Form: Email + Password + Passwort bestätigen | `app/(auth)/register/page.tsx` | 🔲 |
| Client-seitige Validierung: Passwort-Match, Mindestlänge | `app/(auth)/register/page.tsx` | 🔲 |
| Submit → Supabase `signUp()` | `app/(auth)/register/page.tsx` | 🔲 |
| Supabase Trigger erstellt `profiles`-Eintrag automatisch | *(DB-Trigger aus Phase 1)* | 🔲 |
| E-Mail-Bestätigung: Info-Hinweis "Prüfe dein Postfach" | `app/(auth)/register/page.tsx` | 🔲 |
| Fehlerbehandlung: "E-Mail bereits registriert" | `app/(auth)/register/page.tsx` | 🔲 |
| Link zu "Bereits registriert? Anmelden" | `app/(auth)/register/page.tsx` | 🔲 |

---

## Schritt 10.3 — Passwort-Reset

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Forgot-Password-Seite: Email-Input | `app/(auth)/forgot-password/page.tsx` | 🔲 |
| Submit → Supabase `resetPasswordForEmail()` | `app/(auth)/forgot-password/page.tsx` | 🔲 |
| Bestätigung: "Link wurde gesendet" | `app/(auth)/forgot-password/page.tsx` | 🔲 |
| Reset-Seite: neues Passwort setzen (via Supabase Magic Link) | `app/(auth)/reset-password/page.tsx` | 🔲 |
| Redirect zu `/login` nach erfolgreichem Reset | `app/(auth)/reset-password/page.tsx` | 🔲 |

---

## Schritt 10.4 — Logout

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Logout-Button in Settings oder Sidebar | `components/layout/Sidebar/Sidebar.tsx` | 🔲 |
| `supabase.auth.signOut()` aufrufen | `components/layout/Sidebar/Sidebar.tsx` | 🔲 |
| Redirect zu `/login` nach Logout | `components/layout/Sidebar/Sidebar.tsx` | 🔲 |

---

## Schritt 10.5 — Auth Layout

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Zentriertes Auth-Layout (kein Sidebar, kein Bottom Nav) | `app/(auth)/layout.tsx` | 🔲 |
| Hintergrund: leichter Gradient mit Akzentfarbe | `app/(auth)/layout.module.less` | 🔲 |
| Bereits eingeloggte User → Redirect zu `/` | `app/(auth)/layout.tsx` | 🔲 |

---

## Verzeichnisstruktur nach Phase 10

```
hector/
└── app/
    └── (auth)/
        ├── layout.tsx
        ├── layout.module.less
        ├── login/
        │   ├── page.tsx
        │   └── page.module.less
        ├── register/
        │   ├── page.tsx
        │   └── page.module.less
        ├── forgot-password/
        │   └── page.tsx
        └── reset-password/
            └── page.tsx
```

---

## Testkriterien

- [ ] Registrierung erstellt User in Supabase Auth + Eintrag in `profiles`
- [ ] Login setzt Session-Cookie korrekt
- [ ] Nach Login → Redirect zu `/` (Board)
- [ ] Nach Logout → Redirect zu `/login`
- [ ] Nicht-eingeloggter User auf `/` → Redirect zu `/login`
- [ ] Bereits eingeloggter User auf `/login` → Redirect zu `/`
- [ ] Passwort-Reset-Email kommt an, Link funktioniert
- [ ] Falsche Credentials → verständliche Fehlermeldung
