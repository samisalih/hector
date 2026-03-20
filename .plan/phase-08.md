# Phase 8 — Realtime & State Management

**Status:** ✅ Fertig
**Abhängigkeiten:** Phase 6, 7
**Gibt frei:** Phase 9, 11

## Ziel
Live-Updates via Supabase Realtime: Änderungen aus anderen Tabs oder externen Clients (MCP, API) erscheinen sofort im Board. Optimistic Updates für schnelle UX bei eigenem CRUD.

---

## Schritt 8.1 — Realtime Hook

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `useRealtime(userId)` — Supabase Channel abonnieren | `lib/hooks/useRealtime.ts` | 🔲 |
| INSERT auf `task_lists` → Liste zum State hinzufügen | `lib/hooks/useRealtime.ts` | 🔲 |
| UPDATE auf `task_lists` → State mergen | `lib/hooks/useRealtime.ts` | 🔲 |
| DELETE auf `task_lists` → aus State entfernen | `lib/hooks/useRealtime.ts` | 🔲 |
| INSERT/UPDATE/DELETE auf `tasks` → entsprechende Liste updaten | `lib/hooks/useRealtime.ts` | 🔲 |
| INSERT/UPDATE/DELETE auf `subtasks` → entsprechenden Task updaten | `lib/hooks/useRealtime.ts` | 🔲 |
| INSERT/UPDATE auf `time_entries` → Timer-State sync | `lib/hooks/useRealtime.ts` | 🔲 |
| Channel cleanup bei Unmount | `lib/hooks/useRealtime.ts` | 🔲 |
| Reconnect-Handling (Supabase übernimmt das) | `lib/hooks/useRealtime.ts` | 🔲 |

**Channel-Filter:** Nur eigene Daten (`user_id = auth.uid()` via RLS, Channel filtert zusätzlich).

---

## Schritt 8.2 — Optimistic Updates

| Operation | Optimistic Verhalten | Datei | Status |
|-----------|---------------------|-------|--------|
| Task abhaken | Checkbox sofort visuell getoggelt, API im Hintergrund | `lib/hooks/useTasks.ts` | 🔲 |
| Task erstellen | Task erscheint sofort mit temp-ID, bei Fehler entfernen | `lib/hooks/useTasks.ts` | 🔲 |
| Task löschen | Task sofort aus UI entfernen, bei Fehler zurück | `lib/hooks/useTasks.ts` | 🔲 |
| Liste erstellen | Spalte sofort sichtbar | `lib/hooks/useLists.ts` | 🔲 |
| Subtask abhaken | Sofort ohne Ladeindikator | `lib/hooks/useSubtasks.ts` | 🔲 |

**Fehlerfall:** Toast anzeigen + State rollback.

---

## Schritt 8.3 — Toast / Notification System

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Toast-Komponente (success, error, info) | `components/ui/Toast/Toast.tsx` | 🔲 |
| Toast-Provider (Context) | `components/ui/Toast/ToastProvider.tsx` | 🔲 |
| `useToast()` Hook | `lib/hooks/useToast.ts` | 🔲 |
| Auto-dismiss nach 4 Sekunden | `components/ui/Toast/Toast.tsx` | 🔲 |
| Position: oben rechts (Desktop), oben (Mobile) | `components/ui/Toast/Toast.module.less` | 🔲 |
| Slide-In Animation | `components/ui/Toast/Toast.module.less` | 🔲 |

---

## Schritt 8.4 — Multi-Tab Sync

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Änderungen aus Tab A erscheinen in Tab B via Realtime | `lib/hooks/useRealtime.ts` | 🔲 |
| Aktiver Timer in Tab B sichtbar wenn in Tab A gestartet | `lib/hooks/useActiveTimer.ts` | 🔲 |
| Kein Duplikat-Rendering (Realtime-Event ≠ optimistic update) | `lib/hooks/useRealtime.ts` | 🔲 |

**Deduplication-Strategie:**
```
Optimistic update setzt lokale ID/Timestamp
Realtime-Event kommt rein → prüfen ob bereits in State (by id)
→ Wenn ja: State mit Server-Daten mergen (Server ist "Wahrheit")
→ Wenn nein: hinzufügen (Änderung von externem Client)
```

---

## Verzeichnisstruktur nach Phase 8

```
hector/
├── components/ui/
│   └── Toast/
│       ├── Toast.tsx
│       ├── Toast.module.less
│       └── ToastProvider.tsx
└── lib/hooks/
    ├── useRealtime.ts
    └── useToast.ts
```

---

## Testkriterien

- [ ] Tab A: Task erstellen → erscheint sofort in Tab B
- [ ] Tab A: Task abhaken → Tab B zeigt sofort als erledigt
- [ ] Externer API-Call (curl) → Änderung erscheint im Browser
- [ ] Optimistic Update: Checkbox-Click sofort reaktiv, kein Warten auf API
- [ ] Fehler-Toast erscheint wenn API-Call schlägt fehl
- [ ] Timer gestartet in Tab A → pulsierender Dot in Tab B sichtbar
