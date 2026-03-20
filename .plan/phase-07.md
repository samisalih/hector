# Phase 7 — Frontend: Time Tracking UI

**Status:** 🔄 In Arbeit
**Abhängigkeiten:** Phase 5, 6
**Gibt frei:** Phase 8

## Ziel
Time-Tracking-UI: Manuelle Zeiteinträge auf Task-Karten, Tagesübersicht in der Hauptseite, Wochenreport auf `/time`. Der ursprüngliche Plan (globaler Live-Timer) wurde bewusst nicht umgesetzt — die bestehende Timer-Logik soll unverändert bleiben.

---

## Was gebaut wurde (abweichend vom ursprünglichen Plan)

### ✅ Schritt 7.A — Tages-Hook & Hauptseite

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `useTrackedTime()` — fetcht Einträge für gewählten Tag, Tages-Goal, Prev/Next-Navigation | `lib/hooks/useTrackedTime.ts` | ✅ |
| `DailyRing` — SVG-Fortschrittsring mit Stoppuhr-Icon | `components/time/DailyRing/DailyRing.tsx` | ✅ |
| `TimeEntryList` — Einträge-Liste mit Skeleton & Empty State | `components/time/TimeEntryList/TimeEntryList.tsx` | ✅ |
| `TimeEntryRow` — Zeile: Task-Name, List-Name, Dauer | `components/time/TimeEntryRow/TimeEntryRow.tsx` | ✅ |
| `TimeColumn` — Sidebar-Wrapper (DailyRing + List) in BoardClient | `components/time/TimeColumn/TimeColumn.tsx` | ✅ |

### ✅ Schritt 7.B — Manuelle Zeiteinträge auf TaskCard

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Zeit-Badges auf TaskCard (pro Eintrag, klickbar zum Editieren) | `components/tasks/TaskCard/TaskCard.tsx` | ✅ |
| "Log time"-Button auf jeder TaskCard | `components/tasks/TaskCard/TaskCard.tsx` | ✅ |
| `TimeLogModal` — Modal für h/m-Eingabe, Datum, Löschen | `components/ui/TimeLogModal/TimeLogModal.tsx` | ✅ |
| Gesamtzeit bei mehreren Einträgen anzeigen | `components/tasks/TaskCard/TaskCard.tsx` | ✅ |

### ✅ Schritt 7.C — Wochenreport `/time`

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `useWeeklyReport()` — fetcht Mo–So parallel via `daily`-API, Prev/Next-Woche | `lib/hooks/useWeeklyReport.ts` | ✅ |
| Wochen-Header mit Datumsbereich und Gesamt-Summe | `app/(app)/time/page.tsx` | ✅ |
| 7 Tagesabschnitte mit Einträgen (Task, List, Dauer) | `app/(app)/time/page.tsx` | ✅ |
| Heutiger Tag mit Akzentfarbe hervorgehoben | `app/(app)/time/page.tsx` | ✅ |
| Leere Tage gedimmt, zeigen "—" | `app/(app)/time/page.tsx` | ✅ |
| Skeleton-Loader beim Laden | `app/(app)/time/page.tsx` | ✅ |
| Reaktion auf `hector:time-updated` Event | `lib/hooks/useWeeklyReport.ts` | ✅ |

---

## Nicht umgesetzt (bewusste Entscheidung)

| Schritt | Begründung |
|---------|------------|
| 7.1 `useActiveTimer` — globaler Live-Timer-Hook | Bestehende Timer-Logik soll nicht angefasst werden |
| 7.2 `useTaskTime(taskId)` | Nicht benötigt im aktuellen Ansatz |
| 7.3 `TimeTracker`-Komponente in TaskDetail | Kein Live-Timer-UI geplant |
| 7.4 Pulsierender Dot auf TaskCard | Kein Live-Timer-UI geplant |
| 7.6 TimeEntryList im TaskDetail-Panel | Noch offen — könnte nachgerüstet werden |
| `lib/utils/time.ts` | Format-Hilfsfunktionen sind inline in den Komponenten |

---

## Noch offen

| Aufgabe | Datei | Status |
|---------|-------|--------|
| TimeEntryList im TaskDetail-Panel einbinden | `components/tasks/TaskDetail/` | 🔲 |
| Zeitraum-Filter auf `/time` (custom range) | `app/(app)/time/page.tsx` | 🔲 |

---

## Testkriterien

- [x] TaskCard zeigt Zeit-Badges und Log-Button
- [x] DailyRing auf Hauptseite aktualisiert sich nach Zeitbuchung
- [x] `/time` zeigt aktuelle Woche mit allen Einträgen
- [x] Wochennavigation (Prev/Next) funktioniert, "Next" gesperrt in aktueller Woche
- [x] Heutiger Tag visuell hervorgehoben
- [ ] TimeEntryList im TaskDetail sichtbar
