# Phase 4 — Service Layer (Pre-Backend)

**Status:** ✅ Fertig
**Abhängigkeiten:** Phase 1, 2, 3
**Gibt frei:** Phase 5

## Ziel
Vollständiger Service Layer als einzige Schicht, die mit Supabase spricht. API Routes rufen ausschließlich Services auf — kein Supabase-Code außerhalb von `lib/services/` und `lib/supabase/`. Das macht den Code testbar, austauschbar und die API sauber.

**Prinzip:** Services bekommen immer eine `supabase`-Instanz injiziert (kein Singleton) → ermöglicht Request-scoped Auth-Kontext.

---

## Schritt 4.1 — Lists Service

**Datei:** `lib/services/lists.service.ts`

| Methode | Beschreibung | Status |
|---------|-------------|--------|
| `getLists(userId)` | Alle Listen des Users, sortiert nach `position` | ✅ |
| `getListById(listId, userId)` | Einzelne Liste, wirft 404 wenn nicht gefunden | ✅ |
| `getListWithTasks(listId, userId)` | Liste + alle Tasks (JOIN) | ✅ |
| `createList(data, userId)` | Liste anlegen, `position` = max + 1 | ✅ |
| `updateList(listId, data, userId)` | Felder aktualisieren | ✅ |
| `deleteList(listId, userId)` | Löscht Liste + alle Tasks (CASCADE in DB) | ✅ |
| `reorderLists(listIds, userId)` | Setzt `position` nach Array-Index | ✅ |

---

## Schritt 4.2 — Tasks Service

**Datei:** `lib/services/tasks.service.ts`

| Methode | Beschreibung | Status |
|---------|-------------|--------|
| `getTasksByList(listId, userId)` | Alle Tasks einer Liste, sortiert nach `position` | ✅ |
| `getTaskById(taskId, userId)` | Task mit Subtasks + Zeit-Summary | ✅ |
| `createTask(data, userId)` | Task anlegen, `position` = max + 1 | ✅ |
| `updateTask(taskId, data, userId)` | Felder aktualisieren | ✅ |
| `deleteTask(taskId, userId)` | Löscht Task + Subtasks + Time Entries (CASCADE) | ✅ |
| `toggleComplete(taskId, userId)` | `is_completed` + `completed_at` setzen/leeren | ✅ |
| `moveTask(taskId, newListId, userId)` | Task in andere Liste verschieben | ✅ |
| `reorderTasks(listId, taskIds, userId)` | Ruft DB-Funktion `reorder_tasks()` auf | ✅ |

---

## Schritt 4.3 — Subtasks Service

**Datei:** `lib/services/subtasks.service.ts`

| Methode | Beschreibung | Status |
|---------|-------------|--------|
| `getSubtasks(taskId, userId)` | Alle Subtasks, sortiert nach `position` | ✅ |
| `createSubtask(taskId, title, userId)` | Subtask anlegen | ✅ |
| `updateSubtask(subtaskId, data, userId)` | Titel oder Status ändern | ✅ |
| `deleteSubtask(subtaskId, userId)` | Subtask löschen | ✅ |
| `toggleComplete(subtaskId, userId)` | `is_completed` togglen | ✅ |
| `reorderSubtasks(taskId, subtaskIds, userId)` | Reihenfolge setzen | ✅ |

---

## Schritt 4.4 — Time Entries Service

**Datei:** `lib/services/time-entries.service.ts`

| Methode | Beschreibung | Status |
|---------|-------------|--------|
| `getEntriesByTask(taskId, userId)` | Alle Einträge für einen Task | ✅ |
| `getAllEntries(userId, filters?)` | Alle Einträge des Users, filterbar nach Zeitraum/Task | ✅ |
| `getActiveTimer(userId)` | Laufenden Timer abrufen (ended_at IS NULL) | ✅ |
| `startTimer(taskId, userId)` | Neuen Eintrag mit `started_at = now()` anlegen, wirft Error wenn Timer läuft | ✅ |
| `stopTimer(entryId, notes, userId)` | `ended_at` + `duration_seconds` setzen | ✅ |
| `createManualEntry(data, userId)` | Manuellen Eintrag anlegen, `duration_seconds` berechnen | ✅ |
| `updateEntry(entryId, data, userId)` | Eintrag editieren | ✅ |
| `deleteEntry(entryId, userId)` | Eintrag löschen | ✅ |
| `getTaskTotalDuration(taskId)` | Ruft DB-Funktion `get_task_total_duration()` auf | ✅ |

**Wichtige Geschäftsregel:**
```
startTimer(): Prüft zuerst getActiveTimer()
  → Wenn aktiver Timer existiert → throw ServiceError('TIMER_ALREADY_RUNNING')
  → API Route gibt dann 409 Conflict zurück
```

---

## Schritt 4.5 — API Keys Service

**Datei:** `lib/services/api-keys.service.ts`

| Methode | Beschreibung | Status |
|---------|-------------|--------|
| `getKeys(userId)` | Alle Keys, OHNE `key_hash` (nur Prefix + Metadata) | ✅ |
| `createKey(data, userId)` | Key generieren (`tsx_` + 32 Random-Chars), Hash speichern, Key einmalig zurückgeben | ✅ |
| `rotateKey(keyId, userId)` | Neuen Key generieren, alten Hash überschreiben | ✅ |
| `deleteKey(keyId, userId)` | Key löschen | ✅ |
| `validateApiKey(rawKey)` | Hash vergleichen, `last_used_at` updaten, userId zurückgeben | ✅ |

**Key-Format:** `tsx_` + 32 kryptografisch sichere Zeichen (z.B. via `crypto.randomBytes`)
**Speicherung:** Nur SHA-256-Hash in DB, nie den Klartext-Key

---

## Schritt 4.6 — Service-Fehlerbehandlung

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `ServiceError` Klasse mit Codes definieren | `lib/services/errors.ts` | ✅ |
| Fehlercodes: `NOT_FOUND`, `FORBIDDEN`, `TIMER_ALREADY_RUNNING`, `CONFLICT` | `lib/services/errors.ts` | ✅ |
| API Route Helpers: ServiceError → HTTP Status Mapping | `lib/api/response.ts` | 🔲 Folgt in Phase 5 |

```typescript
// lib/services/errors.ts
export class ServiceError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'FORBIDDEN' | 'TIMER_ALREADY_RUNNING' | 'CONFLICT',
    message: string
  ) { super(message) }
}
```

---

## Verzeichnisstruktur nach Phase 4

```
hector/
└── lib/
    ├── services/
    │   ├── errors.ts
    │   ├── lists.service.ts
    │   ├── tasks.service.ts
    │   ├── subtasks.service.ts
    │   ├── time-entries.service.ts
    │   └── api-keys.service.ts
    └── supabase/
        ├── client.ts
        ├── server.ts
        └── middleware.ts
```

---

## Testkriterien

- [x] Kein Supabase-Import außerhalb von `lib/services/` und `lib/supabase/` (verifiziert via grep)
- [x] `startTimer()` wirft `TIMER_ALREADY_RUNNING` wenn aktiver Timer existiert
- [x] `createKey()` gibt Key nur einmalig zurück, in DB steht nur SHA-256-Hash
- [x] `validateApiKey()` aktualisiert `last_used_at` via `createServiceRoleClient()`
- [x] Alle Services nutzen RLS (nur `validateApiKey` nutzt Service-Role-Client)
- [x] TypeScript-Compiler: keine `any`, alle Return-Types explizit — `tsc --noEmit` sauber
