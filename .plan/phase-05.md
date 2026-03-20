# Phase 5 — REST-API (vollständig)

**Status:** ✅ Fertig
**Abhängigkeiten:** Phase 2, 3, 4
**Gibt frei:** Phase 6, 7, 8, 9 (und MCP-Anbindung)

## Ziel
Vollständige REST-API unter `/api/v1/` mit Dual-Auth (Session + API-Key). Nach dieser Phase ist Hector MCP-fähig: Ein LLM kann über API-Keys alle Operationen ausführen, ohne das Frontend zu benötigen.

---

## Schritt 5.1 — API-Infrastruktur

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `authenticate(request)` — Dual-Auth Middleware | `lib/api/auth.ts` | ✅ |
| `successResponse<T>(data, status?)` | `lib/api/response.ts` | ✅ |
| `errorResponse(message, status)` | `lib/api/response.ts` | ✅ |
| `paginatedResponse<T>(data, total, page, limit)` | `lib/api/response.ts` | ✅ |
| `ServiceError → HTTP Status` Mapping | `lib/api/response.ts` | ✅ |
| Zod-Schemas für alle Request-Bodies | `lib/api/validate.ts` | ✅ |

**Auth-Logik (`lib/api/auth.ts`):**
```
1. Header: Authorization: Bearer tsx_... vorhanden?
   → API-Key-Service: validateApiKey(key)
   → userId gefunden? → AuthResult { userId, method: 'api-key' }
   → nicht gefunden? → 401

2. Kein Bearer-Header → Session-Cookie prüfen
   → Supabase getUser() → userId gefunden? → AuthResult { userId, method: 'session' }
   → keine Session? → 401
```

---

## Schritt 5.2 — Lists Endpoints

| Methode | Pfad | Beschreibung | Status |
|---------|------|-------------|--------|
| GET | `/api/v1/lists` | Alle Listen des Users | 🔲 |
| POST | `/api/v1/lists` | Neue Liste erstellen | 🔲 |
| GET | `/api/v1/lists/:listId` | Liste mit Tasks | 🔲 |
| PATCH | `/api/v1/lists/:listId` | Liste aktualisieren | 🔲 |
| DELETE | `/api/v1/lists/:listId` | Liste löschen | 🔲 |
| POST | `/api/v1/lists/reorder` | Reihenfolge der Listen setzen | 🔲 |
| GET | `/api/v1/lists/:listId/tasks` | Tasks einer Liste | 🔲 |
| POST | `/api/v1/lists/:listId/tasks` | Task in Liste erstellen | 🔲 |

---

## Schritt 5.3 — Tasks Endpoints

| Methode | Pfad | Beschreibung | Status |
|---------|------|-------------|--------|
| GET | `/api/v1/tasks/:taskId` | Task mit Subtasks + Zeit-Summary | 🔲 |
| PATCH | `/api/v1/tasks/:taskId` | Task aktualisieren (inkl. listId für Move) | 🔲 |
| DELETE | `/api/v1/tasks/:taskId` | Task löschen | 🔲 |
| POST | `/api/v1/lists/:listId/tasks/reorder` | Task-Reihenfolge in Liste setzen | 🔲 |

---

## Schritt 5.4 — Subtasks Endpoints

| Methode | Pfad | Beschreibung | Status |
|---------|------|-------------|--------|
| GET | `/api/v1/tasks/:taskId/subtasks` | Alle Subtasks eines Tasks | 🔲 |
| POST | `/api/v1/tasks/:taskId/subtasks` | Subtask erstellen | 🔲 |
| PATCH | `/api/v1/tasks/:taskId/subtasks/:subtaskId` | Subtask aktualisieren | 🔲 |
| DELETE | `/api/v1/tasks/:taskId/subtasks/:subtaskId` | Subtask löschen | 🔲 |

---

## Schritt 5.5 — Time Entries Endpoints

| Methode | Pfad | Beschreibung | Status |
|---------|------|-------------|--------|
| GET | `/api/v1/time-entries` | Alle Einträge des Users (Filter: `?from=&to=&taskId=`) | 🔲 |
| GET | `/api/v1/tasks/:taskId/time-entries` | Einträge eines Tasks | 🔲 |
| POST | `/api/v1/tasks/:taskId/time-entries` | Timer starten (`{ action: 'start' }`) oder manuellen Eintrag anlegen | 🔲 |
| PATCH | `/api/v1/tasks/:taskId/time-entries/:entryId` | Timer stoppen (`{ action: 'stop' }`) oder Eintrag bearbeiten | 🔲 |
| DELETE | `/api/v1/tasks/:taskId/time-entries/:entryId` | Eintrag löschen | 🔲 |
| GET | `/api/v1/timers/active` | Aktiven Timer des Users abrufen | 🔲 |

---

## Schritt 5.6 — API Keys Endpoints

| Methode | Pfad | Beschreibung | Status |
|---------|------|-------------|--------|
| GET | `/api/v1/api-keys` | Alle Keys (nur Prefix + Metadata, kein Secret) | 🔲 |
| POST | `/api/v1/api-keys` | Neuen Key erstellen (Secret einmalig in Response) | 🔲 |
| DELETE | `/api/v1/api-keys/:keyId` | Key löschen | 🔲 |
| POST | `/api/v1/api-keys/:keyId/rotate` | Key rotieren (neues Secret, einmalig) | 🔲 |

**Wichtig:** API-Key-Endpoints sind NUR per Session-Auth erreichbar (kein API-Key kann API-Keys verwalten).

---

## Schritt 5.7 — Profile/Settings Endpoints

| Methode | Pfad | Beschreibung | Status |
|---------|------|-------------|--------|
| GET | `/api/v1/me` | Eigenes Profil abrufen | 🔲 |
| PATCH | `/api/v1/me` | Profil aktualisieren (display_name, theme) | 🔲 |

---

## API Response Format

Alle Endpoints antworten konsistent:

```json
// Erfolg (einzelnes Objekt)
{ "data": { ... }, "error": null }

// Erfolg (Liste)
{ "data": [ ... ], "error": null, "meta": { "total": 42 } }

// Fehler
{ "data": null, "error": "Nicht gefunden" }
```

HTTP Status Codes:
- `200` OK
- `201` Created
- `204` No Content (DELETE)
- `400` Bad Request (Validation)
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict (z.B. Timer läuft bereits)
- `500` Internal Server Error

---

## Verzeichnisstruktur nach Phase 5

```
hector/
└── app/
    └── api/
        └── v1/
            ├── lists/
            │   ├── route.ts
            │   ├── reorder/route.ts
            │   └── [listId]/
            │       ├── route.ts
            │       └── tasks/
            │           ├── route.ts
            │           ├── reorder/route.ts
            │           └── [taskId]/
            │               └── route.ts (delegiert an tasks service)
            ├── tasks/
            │   └── [taskId]/
            │       ├── route.ts
            │       ├── subtasks/
            │       │   ├── route.ts
            │       │   └── [subtaskId]/route.ts
            │       └── time-entries/
            │           ├── route.ts
            │           └── [entryId]/route.ts
            ├── time-entries/
            │   └── route.ts
            ├── timers/
            │   └── active/route.ts
            ├── api-keys/
            │   ├── route.ts
            │   └── [keyId]/
            │       ├── route.ts
            │       └── rotate/route.ts
            └── me/
                └── route.ts
```

---

## Testkriterien

- [ ] `curl -H "Authorization: Bearer tsx_..." /api/v1/lists` gibt Daten zurück
- [ ] Ohne Auth → 401
- [ ] Fremde Ressource (andere userId) → 404 (RLS verhindert Zugriff)
- [ ] POST /lists mit fehlenden Pflichtfeldern → 400 + Fehlermeldung
- [ ] Timer starten wenn Timer läuft → 409
- [ ] API-Key-Endpoints mit API-Key-Auth → 401
- [ ] DELETE /lists/:id löscht alle zugehörigen Tasks (CASCADE)
- [ ] Alle Responses haben `{ data, error }` Envelope
