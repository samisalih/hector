# Phase 2 — TypeScript Typen

**Status:** ✅ Fertig
**Abhängigkeiten:** Phase 1 (DB-Schema muss existieren)
**Gibt frei:** Phase 3, 4

## Ziel
Vollständiges TypeScript-Typsystem für alle Schichten: DB-Typen (auto-generiert), API Request/Response-Typen und Frontend-App-Typen. Alle anderen Phasen importieren ausschließlich aus `types/`.

---

## Schritt 2.1 — Datenbank-Typen (auto-generiert)

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Supabase CLI installieren | global / devDependency | ✅ (via npx) |
| DB-Typen generieren via Supabase CLI | `types/database.types.ts` | ✅ (manuell aus Schema, CLI braucht Account-Login) |
| In `package.json` als Script hinterlegen (`gen:types`) | `package.json` | ✅ |

**Befehl:**
```bash
npx supabase gen types typescript --project-id <SUPABASE_PROJECT_ID> \
  --schema public > types/database.types.ts
```

**Wichtig:** Diese Datei nie manuell bearbeiten. Bei Schema-Änderungen neu generieren.

---

## Schritt 2.2 — API-Typen

| Typ-Gruppe | Beschreibung | Datei | Status |
|------------|-------------|-------|--------|
| `ApiResponse<T>` | Standard-Envelope für alle API-Antworten | `types/api.types.ts` | ✅ |
| `PaginatedResponse<T>` | Envelope mit total/page/limit | `types/api.types.ts` | ✅ (via meta-Feld in ApiResponse) |
| `CreateListRequest` | POST /lists Body | `types/api.types.ts` | ✅ |
| `UpdateListRequest` | PATCH /lists/:id Body | `types/api.types.ts` | ✅ |
| `ListResponse` | GET /lists Response-Shape | `types/api.types.ts` | ✅ |
| `CreateTaskRequest` | POST /tasks Body | `types/api.types.ts` | ✅ |
| `UpdateTaskRequest` | PATCH /tasks/:id Body | `types/api.types.ts` | ✅ |
| `TaskResponse` | GET /tasks/:id Response-Shape (inkl. Subtasks, Zeit-Summary) | `types/api.types.ts` | ✅ |
| `CreateSubtaskRequest` | POST /subtasks Body | `types/api.types.ts` | ✅ |
| `UpdateSubtaskRequest` | PATCH /subtasks/:id Body | `types/api.types.ts` | ✅ |
| `StartTimerRequest` | POST time-entries { action: 'start' } | `types/api.types.ts` | ✅ |
| `StopTimerRequest` | PATCH time-entries/:id { action: 'stop' } | `types/api.types.ts` | ✅ |
| `CreateManualTimeEntryRequest` | POST manueller Eintrag | `types/api.types.ts` | ✅ |
| `TimeEntryResponse` | Response-Shape für Time Entries | `types/api.types.ts` | ✅ |
| `CreateApiKeyRequest` | POST /api-keys Body | `types/api.types.ts` | ✅ |
| `ApiKeyResponse` | Liste-Ansicht (ohne Key-Secret) | `types/api.types.ts` | ✅ |
| `NewApiKeyResponse` | Einmalige Antwort beim Erstellen (mit Key-Secret) | `types/api.types.ts` | ✅ |
| `TimeEntryFilters` | Query-Parameter für GET /time-entries | `types/api.types.ts` | ✅ |
| `ReorderRequest` | Body für Reorder-Endpoints | `types/api.types.ts` | ✅ |

**Kern-Struktur (`ApiResponse<T>`):**
```typescript
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
```

---

## Schritt 2.3 — App-Typen (Frontend-State)

| Typ | Beschreibung | Datei | Status |
|-----|-------------|-------|--------|
| `AppList` | TaskList mit UI-State (isLoading, isEditing, taskCount) | `types/app.types.ts` | ✅ |
| `AppTask` | Task mit UI-State (isExpanded, isTimerRunning, totalDuration) | `types/app.types.ts` | ✅ |
| `AppSubtask` | Subtask mit isEditing | `types/app.types.ts` | ✅ |
| `AppTimeEntry` | TimeEntry mit isEditing, formattedDuration | `types/app.types.ts` | ✅ |
| `TimerState` | Globaler Timer-State (activeTaskId, startedAt, elapsedSeconds) | `types/app.types.ts` | ✅ |
| `ThemeMode` | `'light' \| 'dark' \| 'system'` | `types/app.types.ts` | ✅ (als `Theme` re-exportiert) |
| `BoardView` | State des Boards (selectedListId, searchQuery) | `types/app.types.ts` | ✅ (als `BoardState`) |
| `Priority` | `'none' \| 'low' \| 'medium' \| 'high'` | `types/app.types.ts` | ✅ |

---

## Verzeichnisstruktur nach Phase 2

```
hector/
└── types/
    ├── database.types.ts    ← auto-generiert, nie manuell bearbeiten
    ├── api.types.ts         ← API Request/Response Shapes
    └── app.types.ts         ← Frontend UI-State Typen
```

---

## Testkriterien

- [x] `tsc --noEmit` läuft ohne Fehler
- [x] `database.types.ts` enthält alle 6 Tabellen + 4 DB-Funktionen
- [x] Alle API-Request-Typen sind vollständig (keine `any`)
- [x] `ApiResponse<T>` ist generisch und korrekt typisiert
