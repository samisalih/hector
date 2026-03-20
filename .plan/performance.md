# Performance-Optimierung

**Status:** ✅ Fertig
**Symptom:** Mehrere Sekunden bis Tasks sichtbar, noch länger bis Zeitbuchungen
**Root Cause:** N serielle API-Calls (1 pro Liste) + Waterfall Tasks → Zeitbuchungen + kein SSR-Daten-Pass

---

## Diagnose: Kompletter Waterfall

```
Server (layout.tsx)
  └─ getUser() → getLists()                              [~100ms]

Server (page.tsx)
  └─ getUser() → getLists() [DUPLIKAT]                   [~100ms]

Client (BoardClient mountet)
  └─ useAllTasks() Effect feuert
       └─ Promise.all([
            GET /api/v1/lists/1/tasks,                   ┐
            GET /api/v1/lists/2/tasks,                   │ N parallele Calls
            GET /api/v1/lists/3/tasks, ...               ┘ [~200-400ms]
         ])
       └─ ERST DANN: GET /api/v1/time-entries/totals     [+150-250ms Waterfall]
```

**Gesamtlatenz für 3 Listen + Zeitbuchungen: 600-900ms, bei 6 Listen: 1-1,5s**

---

## Phase 1 — Batch-Tasks-Endpoint + parallele Zeitbuchungen

**Status:** ✅ Fertig
**Impact:** ★★★★★ Größter Einzelgewinn

### Problem
`useAllTasks` macht `N` API-Calls (einer pro Liste) und erst danach die Zeitbuchungsabfrage.

### Lösung A: Neuer Batch-Endpoint `GET /api/v1/tasks?listIds=1,2,3`
**Neue Datei:** `app/api/v1/tasks/route.ts`

```
GET /api/v1/tasks?listIds=id1,id2,id3
→ SELECT * FROM tasks WHERE list_id IN (...) AND user_id = ?
→ Gibt zurück: Record<listId, Task[]>
```

N Calls → 1 Call. Spart für 5 Listen ~4 API-Round-Trips.

### Lösung B: Zeitbuchungen parallel zu Tasks starten
In `useAllTasks.fetchAll()`:

```typescript
// JETZT (Waterfall):
const taskResults = await Promise.all(ids.map(id => fetchTasks(id)))
const allTaskIds = taskResults.flat().map(t => t.id)
const timeEntries = await fetchTimeEntries(allTaskIds)  // wartet auf Tasks

// NEU (parallel):
const [taskResults, allTimeEntries] = await Promise.all([
  Promise.all(ids.map(id => fetchTasks(id))),
  fetchTimeEntriesForLists(ids)   // neuer Endpoint: /api/v1/time-entries/totals?listIds=...
])
```

Neuer Endpoint `GET /api/v1/time-entries/totals?listIds=1,2,3` (statt taskIds):
→ JOIN time_entries ON tasks WHERE tasks.list_id IN (...)

**Dateien:**
- `app/api/v1/tasks/route.ts` — neu
- `app/api/v1/time-entries/totals/route.ts` — erweitern um `listIds` param
- `lib/hooks/useAllTasks.ts` — fetchAll umschreiben

---

## Phase 2 — Server-Side Initial Data

**Status:** ✅ Fertig
**Impact:** ★★★★☆ Tasks erscheinen sofort beim ersten Load

### Problem
`page.tsx` fetcht Listen serverseitig, gibt sie als `initialLists` weiter — aber Tasks kommen erst client-seitig. Der User sieht leere Spalten bis der Client-Fetch durch ist.

### Lösung: Tasks serverseitig prefetchen, als `initialTasks` weitergeben

**`app/(app)/page.tsx`:**
```typescript
// Zusätzlich zu initialLists:
const allTasks = await getTasksForLists(supabase, lists.map(l => l.id), user.id)
// Gibt: Record<listId, Task[]>
```

**`BoardClient.tsx`:**
```typescript
// useAllTasks mit initialTasks initialisieren:
const [tasksByList, setTasksByList] = useState(initialTasks)
// Kein leerer State mehr → Tasks sofort sichtbar
```

**Dateien:**
- `lib/services/tasks.service.ts` — `getTasksForLists()` hinzufügen
- `app/(app)/page.tsx` — tasks prefetchen
- `app/(app)/BoardClient.tsx` — `initialTasks` prop
- `lib/hooks/useAllTasks.ts` — `initialTasksByList` Parameter

### Bonus: Duplikat-Listen-Fetch entfernen
`layout.tsx` und `page.tsx` fetchen beide `getLists()`. Layout braucht es für Sidebar, Page für BoardClient. Lösung: Page liest `initialLists` aus dem Layout via shared fetch oder verwendet `unstable_cache`.

---

## Phase 3 — Loading States & Skeleton UI

**Status:** ✅ Fertig
**Impact:** ★★★☆☆ Gefühlte Performance massiv besser

### Problem
Keine `loading.tsx`, keine Suspense-Boundaries → User sieht leeren Screen.

### Lösung

**`app/(app)/loading.tsx`** — Board-Skeleton:
```tsx
// Zeigt 3 Spalten-Skelette mit Shimmer-Animation
// Exakt gleiche Dimensionen wie echte Columns
```

**`components/lists/ListColumn/ListColumnSkeleton.tsx`** — Wiederverwendbar:
```tsx
// 1 Spalte mit 3 Task-Skeletten
// .skeleton Klasse aus ListColumn.module.less
```

Sobald `loading.tsx` existiert, rendert Next.js es sofort während der Server-Fetch läuft → gefühlte Ladezeit nahezu 0.

---

## Phase 4 — API-Response-Caching

**Status:** ✅ Fertig
**Impact:** ★★☆☆☆ Hilft bei Navigation innerhalb der App

### Problem
Jede Navigation re-fetched alle Daten. Bei Back/Forward keine Cache-Hits.

### Lösung: `stale-while-revalidate` Headers auf GET-Endpoints

```typescript
// In /api/v1/lists/[listId]/tasks/route.ts:
return successResponse(tasks, {
  headers: { 'Cache-Control': 's-maxage=0, stale-while-revalidate=30' }
})
```

Nur für GET-Endpoints mit öffentlich-unveränderlichen Daten sinnvoll. Mutations invalidieren via `revalidatePath` oder client-seitige State-Updates (bereits vorhanden).

---

## Priorisierte Implementierungsreihenfolge

| Phase | Maßnahme | Impact | Aufwand | Erwartete Ersparnis |
|-------|----------|--------|---------|---------------------|
| 1a | Batch-Tasks-Endpoint | ★★★★★ | M | −300-600ms |
| 1b | Zeitbuchungen parallel | ★★★★☆ | S | −150-250ms |
| 2  | Server-Side Initial Data | ★★★★☆ | M | Tasks sofort sichtbar |
| 3  | loading.tsx + Skeleton | ★★★☆☆ | S | Gefühlte Latenz −80% |
| 4  | Cache-Headers | ★★☆☆☆ | S | Bei Navigation |

**Empfehlung:** Phase 1 + Phase 3 zuerst → größter objektiver + subjektiver Gewinn.

---

## Verifikation

Nach jeder Phase messen:
- Chrome DevTools → Network Tab → Seite neu laden
- Ziel: Tasks sichtbar in < 500ms (statt 2-3s)
- Zeitbuchungen sichtbar: gleichzeitig mit Tasks (statt nach)
- `npx tsc --noEmit` nach jeder Phase
