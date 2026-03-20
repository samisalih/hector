# Phase 9 — API-Key Management UI

**Status:** ✅ Fertig
**Abhängigkeiten:** Phase 5, 6
**Gibt frei:** Phase 11

## Ziel
Vollständige UI für API-Key-Verwaltung in den Settings. Keys können erstellt, angezeigt (nur Prefix), rotiert und gelöscht werden. Das ist das Tor für externe Tools und MCP-Server zu Hector.

---

## Schritt 9.1 — Settings Layout

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Settings-Seite mit Navigation (Profil, API-Keys, Erscheinungsbild) | `app/(app)/settings/page.tsx` | ✅ |
| Settings-Layout mit linker Nav + Inhalt | `app/(app)/settings/layout.tsx` | ✅ |
| Mobile: Tabs statt Sidebar | `app/(app)/settings/layout.module.less` | ✅ |

---

## Schritt 9.2 — API-Key Liste

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Alle Keys laden (GET `/api/v1/api-keys`) | `app/(app)/settings/api-keys/page.tsx` | ✅ |
| Key-Eintrag: Name, Prefix (`tsx_abc123...`), Erstellt-am, Zuletzt-verwendet | `components/settings/ApiKeyList/ApiKeyList.tsx` | ✅ |
| "Noch nie verwendet" wenn `last_used_at` null | `components/settings/ApiKeyList/ApiKeyList.tsx` | ✅ |
| Ablaufdatum anzeigen (rot wenn abgelaufen) | `components/settings/ApiKeyList/ApiKeyList.tsx` | ✅ |
| Rotieren-Button pro Key | `components/settings/ApiKeyList/ApiKeyList.tsx` | ✅ |
| Löschen-Button pro Key (mit Bestätigungs-Modal) | `components/settings/ApiKeyList/ApiKeyList.tsx` | ✅ |
| Leerer State: "Noch keine API-Keys. Erstelle deinen ersten Key." | `components/settings/ApiKeyList/ApiKeyList.tsx` | ✅ |

---

## Schritt 9.3 — Key erstellen

| Aufgabe | Datei | Status |
|---------|-------|--------|
| "Neuen Key erstellen" Button → öffnet Modal | `app/(app)/settings/api-keys/page.tsx` | ✅ |
| Modal: Name-Input (Pflichtfeld) | `components/settings/CreateApiKeyModal/CreateApiKeyModal.tsx` | ✅ |
| Modal: Optionales Ablaufdatum | `components/settings/CreateApiKeyModal/CreateApiKeyModal.tsx` | ✅ |
| POST an API, Response enthält einmalig den Key | `components/settings/CreateApiKeyModal/CreateApiKeyModal.tsx` | ✅ |
| **Key-Anzeige-Screen:** Key im Mono-Font, Copy-Button | `components/settings/ApiKeyReveal/ApiKeyReveal.tsx` | ✅ |
| Deutliche Warnung: "Dieser Key wird nie wieder angezeigt. Kopiere ihn jetzt." | `components/settings/ApiKeyReveal/ApiKeyReveal.tsx` | ✅ |
| Copy-Button: Zwischenablage + "Kopiert!" Feedback | `components/settings/ApiKeyReveal/ApiKeyReveal.tsx` | ✅ |
| "Ich habe den Key gespeichert" → schließt Modal, Liste aktualisiert | `components/settings/ApiKeyReveal/ApiKeyReveal.tsx` | ✅ |

---

## Schritt 9.4 — Key rotieren

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Rotieren-Button → Bestätigungs-Modal ("Alter Key wird sofort ungültig") | `components/settings/ApiKeyList/ApiKeyList.tsx` | ✅ |
| POST an `/api/v1/api-keys/:id/rotate` | `components/settings/ApiKeyList/ApiKeyList.tsx` | ✅ |
| Neuen Key im Key-Anzeige-Screen anzeigen (gleiche Komponente wie beim Erstellen) | `components/settings/ApiKeyReveal/ApiKeyReveal.tsx` | ✅ |

---

## Schritt 9.5 — Profil-Settings (Bonus)

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Display Name ändern | `app/(app)/settings/page.tsx` | ✅ |
| Theme umschalten (Light / Dark / System) | `app/(app)/settings/page.tsx` | ✅ |
| PATCH an `/api/v1/me` | `app/(app)/settings/page.tsx` | ✅ |

---

## Verzeichnisstruktur nach Phase 9

```
hector/
├── app/(app)/settings/
│   ├── layout.tsx
│   ├── layout.module.less
│   ├── page.tsx               ← Profil
│   └── api-keys/
│       └── page.tsx
└── components/settings/
    ├── ApiKeyList/
    ├── CreateApiKeyModal/
    └── ApiKeyReveal/
```

---

## Testkriterien

- [x] Key erstellen → Key-Secret wird einmalig angezeigt
- [x] Copy-Button kopiert Key in Zwischenablage
- [x] Nach Modal schließen → Key-Secret nicht mehr abrufbar (UI und API)
- [x] Rotieren → alter Key ungültig (API-Call mit altem Key → 401)
- [x] Neuer Key nach Rotation funktioniert (API-Call → 200)
- [x] Löschen → Key aus Liste verschwunden, API-Call mit geletem Key → 401
- [x] `last_used_at` aktualisiert sich nach API-Call mit Key
