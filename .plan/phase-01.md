# Phase 1 — Fundament & Datenbankschema

**Status:** ✅ Fertig
**Abhängigkeiten:** Keine
**Gibt frei:** Phase 2, 3

## Ziel
Lauffähiges Next.js-Projekt mit vollständigem Supabase-Datenbankschema, RLS-Policies, Datenbankfunktionen und Realtime-Konfiguration. Nach dieser Phase ist das Datenfundament komplett — alle weiteren Phasen bauen darauf auf.

---

## Schritt 1.1 — Projekt-Setup

| Aufgabe | Datei/Befehl | Status |
|---------|-------------|--------|
| Next.js App erstellen (App Router, TypeScript, kein Tailwind) | `npx create-next-app@latest` | ✅ |
| Dependencies installieren | `package.json` | ✅ |
| `next.config.ts` konfigurieren (LESS via Turbopack `rules`, nicht `next-with-less`) | `next.config.ts` | ✅ |
| `tsconfig.json` Path-Aliases einrichten (`@/*` → `./`) | `tsconfig.json` | ✅ |
| `.env.local` anlegen mit Supabase-Variablen | `.env.local` | ✅ |
| `.env.example` für Dokumentation | `.env.example` | ✅ |
| `.gitignore` prüfen (`.env.local` drin?) | `.gitignore` | ✅ |

**Dependencies:**
```
next react react-dom typescript
@supabase/supabase-js @supabase/ssr
less next-with-less
zod
next-pwa
@types/node @types/react @types/react-dom
```

---

## Schritt 1.2 — Design-Token-System (LESS)

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Design-Tokens definieren (Farben, Spacing, Radius, Z-Index, Transitions) | `styles/variables.less` | ✅ |
| CSS Custom Properties für Light/Dark Theme | `styles/themes.less` | ✅ |
| Font-Faces einrichten (ClashDisplay Variable, Satoshi Variable) | `styles/typography.less` | ✅ |
| CSS-Reset | `styles/reset.less` | ✅ |
| Globale Styles einbinden | `app/globals.less` | ✅ |
| Schriftdateien ablegen | `public/fonts/` | 🔲 Manuell: Du legst ClashDisplay-Variable.woff2 + Satoshi-Variable.woff2 in `public/fonts/` ab |

**Kernvariablen (`styles/variables.less`):**
```less
@accent:            rgb(0, 209, 150);
@accent-hover:      rgb(0, 185, 133);
@text-light:        #161616;
@text-dark:         #eeeeee;
@bg-light:          #ffffff;
@bg-dark:           #0f0f0f;
@surface-light:     #f5f5f5;
@surface-dark:      #1a1a1a;
@border-light:      rgba(0, 0, 0, 0.08);
@border-dark:       rgba(255, 255, 255, 0.08);
@column-width:      320px;
@radius-md:         10px;
@radius-lg:         16px;
```

---

## Schritt 1.3 — Supabase Datenbankschema

| Tabelle | Aufgabe | Datei | Status |
|---------|---------|-------|--------|
| `profiles` | Erstellen mit Feldern: id, email, display_name, theme | `supabase/migrations/001_initial_schema.sql` | ✅ |
| `task_lists` | Erstellen mit Feldern: id, user_id, title, color, icon, position | `supabase/migrations/001_initial_schema.sql` | ✅ |
| `tasks` | Erstellen mit Feldern: id, list_id, user_id, title, description, is_completed, completed_at, due_date, due_time, position, priority | `supabase/migrations/001_initial_schema.sql` | ✅ |
| `subtasks` | Erstellen mit Feldern: id, task_id, user_id, title, is_completed, completed_at, position | `supabase/migrations/001_initial_schema.sql` | ✅ |
| `time_entries` | Erstellen mit Feldern: id, task_id, user_id, started_at, ended_at, duration_seconds, notes, is_manual | `supabase/migrations/001_initial_schema.sql` | ✅ |
| `api_keys` | Erstellen mit Feldern: id, user_id, name, key_hash, key_prefix, last_used_at, expires_at | `supabase/migrations/001_initial_schema.sql` | ✅ |
| Indizes | idx auf list_id, user_id, due_date, active timer (partial) | `supabase/migrations/001_initial_schema.sql` | ✅ |
| `updated_at` Trigger | Funktion + Trigger auf alle Tabellen | `supabase/migrations/001_initial_schema.sql` | ✅ |

**Datenbankschema (Übersicht):**
```
profiles ──────────────────────────────────────────────────┐
    │                                                       │
    ├── task_lists (position, color, icon)                  │
    │       └── tasks (position, priority, due_date)        │
    │               ├── subtasks (position)                 │
    │               └── time_entries (started_at, ended_at) │
    └── api_keys (key_hash, key_prefix, expires_at) ────────┘
```

---

## Schritt 1.4 — Row Level Security

| Policy | Tabelle | Status |
|--------|---------|--------|
| SELECT own rows | `profiles` | ✅ |
| UPDATE own rows | `profiles` | ✅ |
| SELECT/INSERT/UPDATE/DELETE own rows | `task_lists` | ✅ |
| SELECT/INSERT/UPDATE/DELETE own rows | `tasks` | ✅ |
| SELECT/INSERT/UPDATE/DELETE own rows | `subtasks` | ✅ |
| SELECT/INSERT/UPDATE/DELETE own rows | `time_entries` | ✅ |
| SELECT/INSERT/DELETE own rows | `api_keys` | ✅ |
| RLS aktivieren auf allen Tabellen | alle | ✅ |

---

## Schritt 1.5 — Datenbankfunktionen

| Funktion | Beschreibung | Datei | Status |
|----------|-------------|-------|--------|
| `handle_new_user()` | Trigger: erstellt `profiles`-Eintrag bei Auth-Registrierung | `supabase/migrations/003_functions.sql` | ✅ |
| `get_active_timer(user_id)` | Gibt laufenden Timer des Users zurück | `supabase/migrations/003_functions.sql` | ✅ |
| `get_task_total_duration(task_id)` | Summiert `duration_seconds` aller beendeten Einträge | `supabase/migrations/003_functions.sql` | ✅ |
| `reorder_tasks(list_id, task_ids[])` | Setzt `position` nach Drag & Drop | `supabase/migrations/003_functions.sql` | ✅ |
| `reorder_lists(user_id, list_ids[])` | Setzt `position` der Listen | `supabase/migrations/003_functions.sql` | ✅ |

---

## Schritt 1.6 — Realtime-Konfiguration

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `task_lists` zu Realtime-Publication hinzufügen | `supabase/migrations/004_realtime.sql` | ✅ |
| `tasks` zu Realtime-Publication hinzufügen | `supabase/migrations/004_realtime.sql` | ✅ |
| `subtasks` zu Realtime-Publication hinzufügen | `supabase/migrations/004_realtime.sql` | ✅ |
| `time_entries` zu Realtime-Publication hinzufügen | `supabase/migrations/004_realtime.sql` | ✅ |

---

## Migrations-Reihenfolge

```
001_initial_schema.sql   → Tabellen, Indizes, updated_at-Trigger
002_rls_policies.sql     → RLS aktivieren + alle Policies
003_functions.sql        → DB-Funktionen + Auth-Trigger (handle_new_user)
004_realtime.sql         → Realtime-Publications
```

---

## Verzeichnisstruktur nach Phase 1

```
hector/
├── .env.local
├── .env.example
├── next.config.ts
├── tsconfig.json
├── package.json
├── styles/
│   ├── variables.less
│   ├── themes.less
│   ├── typography.less
│   └── reset.less
├── app/
│   └── globals.less
├── public/
│   └── fonts/
│       ├── ClashDisplay-Variable.woff2
│       └── Satoshi-Variable.woff2
└── supabase/
    ├── migrations/
    │   ├── 001_initial_schema.sql
    │   ├── 002_rls_policies.sql
    │   ├── 003_functions.sql
    │   └── 004_realtime.sql
    └── seed.sql
```

---

## Testkriterien

- [x] `npm run dev` startet ohne Fehler → HTTP 200
- [ ] Supabase-Dashboard zeigt alle 6 Tabellen (manuell: Migrations in Supabase SQL-Editor ausführen)
- [ ] RLS aktiv auf allen Tabellen (erkennbar im Dashboard)
- [ ] `handle_new_user` Trigger feuert bei Registrierung → `profiles`-Eintrag vorhanden
- [x] LESS wird kompiliert (Turbopack, `less-loader`)
- [ ] Fonts werden geladen (manuell: .woff2-Dateien in `public/fonts/` ablegen)

## Offene manuelle Schritte
1. **Supabase-Projekt erstellen** und Credentials in `.env.local` eintragen
2. **Migrations ausführen**: `001` → `002` → `003` → `004` im Supabase SQL-Editor
3. **Fonts ablegen**: `ClashDisplay-Variable.woff2` + `Satoshi-Variable.woff2` (+ `Satoshi-VariableItalic.woff2`) in `public/fonts/`
