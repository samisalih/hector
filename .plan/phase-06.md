# Phase 6 — Frontend: Core Layout & Board

**Status:** ✅ Fertig
**Abhängigkeiten:** Phase 3, 5
**Gibt frei:** Phase 7, 8

## Ziel
Das charakteristische Google-Tasks-ähnliche Spalten-Layout mit vollständigem CRUD auf Listen und Tasks. Responsive: Desktop = Spalten nebeneinander, Mobile = eine Spalte + Bottom Navigation. Design nach samisalih.com mit ClashDisplay + Satoshi, Akzentfarbe und Light/Dark Mode.

---

## Schritt 6.1 — Root Layout & Theme-Provider

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Root Layout mit Font-Einbindung (ClashDisplay, Satoshi via `next/font/local`) | `app/layout.tsx` | 🔲 |
| `globals.less` mit allen Style-Imports | `app/globals.less` | 🔲 |
| Theme-Provider: `data-theme` auf `<html>` setzen | `app/layout.tsx` | 🔲 |
| Theme aus User-Profil laden (SSR) | `app/layout.tsx` | 🔲 |
| System-Theme-Fallback via `prefers-color-scheme` | `app/layout.tsx` | 🔲 |
| Theme-Toggle-Logik (Client Component) | `components/ui/ThemeToggle/ThemeToggle.tsx` | 🔲 |

---

## Schritt 6.2 — App Layout (nach Auth)

| Aufgabe | Datei | Status |
|---------|-------|--------|
| App-Layout-Wrapper mit Sidebar + Content-Bereich | `app/(app)/layout.tsx` | 🔲 |
| Initiale Listen-Daten via Server Component laden | `app/(app)/layout.tsx` | 🔲 |
| Desktop: Sidebar links, Content rechts | `app/(app)/layout.tsx` | 🔲 |
| Mobile: Header oben, Content, Bottom Navigation | `app/(app)/layout.tsx` | 🔲 |
| Responsive Breakpoint bei 768px | `app/(app)/layout.module.less` | 🔲 |

---

## Schritt 6.3 — Sidebar (Desktop)

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Hector-Logo / Wordmark oben | `components/layout/Sidebar/Sidebar.tsx` | 🔲 |
| "Alle Aufgaben" Link (zeigt Tasks aller Listen) | `components/layout/Sidebar/Sidebar.tsx` | 🔲 |
| "Markiert" Link (später) | `components/layout/Sidebar/Sidebar.tsx` | 🔲 |
| Listen-Sektion mit Einträgen pro Liste | `components/layout/Sidebar/Sidebar.tsx` | 🔲 |
| Aktiver Listen-State (Highlight) | `components/layout/Sidebar/Sidebar.tsx` | 🔲 |
| "+ Neue Liste erstellen" Button am Ende | `components/layout/Sidebar/Sidebar.tsx` | 🔲 |
| Zeiteintrag-Link | `components/layout/Sidebar/Sidebar.tsx` | 🔲 |
| Settings-Link | `components/layout/Sidebar/Sidebar.tsx` | 🔲 |
| Hover/Active-States mit Akzentfarbe | `components/layout/Sidebar/Sidebar.module.less` | 🔲 |

---

## Schritt 6.4 — Bottom Navigation (Mobile)

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Bottom Nav mit 4 Items: Home, Timer, Zeit, Settings | `components/layout/BottomNav/BottomNav.tsx` | 🔲 |
| Aktiver Tab-Indikator mit Akzentfarbe | `components/layout/BottomNav/BottomNav.module.less` | 🔲 |
| Safe-Area-Inset für iPhone (padding-bottom) | `components/layout/BottomNav/BottomNav.module.less` | 🔲 |
| Icons (SVG oder Icon-Library) | `components/layout/BottomNav/BottomNav.tsx` | 🔲 |

---

## Schritt 6.5 — Board Layout (Kernkomponente)

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Horizontal scrollbares Board | `components/lists/ListBoard/ListBoard.tsx` | 🔲 |
| `scroll-snap-type: x mandatory` für Mobile | `components/lists/ListBoard/ListBoard.module.less` | 🔲 |
| Custom Scrollbar-Styling | `components/lists/ListBoard/ListBoard.module.less` | 🔲 |
| "+ Neue Liste" Spalte am Ende des Boards | `components/lists/ListBoard/ListBoard.tsx` | 🔲 |
| Spalten aus API laden | `components/lists/ListBoard/ListBoard.tsx` | 🔲 |

```less
.board {
  display: flex;
  flex-direction: row;
  gap: @column-gap;
  overflow-x: auto;
  height: 100%;
  padding: @space-lg;
  scroll-snap-type: x mandatory;
  scroll-padding: @space-lg;
}
```

---

## Schritt 6.6 — Listen-Spalte (ListColumn)

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Spalten-Container mit fester Breite (320px) | `components/lists/ListColumn/ListColumn.tsx` | 🔲 |
| Header: Farb-Dot, Listentitel, Task-Anzahl, Options-Menü | `components/lists/ListColumn/ListColumn.tsx` | 🔲 |
| Scrollbarer Task-Bereich | `components/lists/ListColumn/ListColumn.tsx` | 🔲 |
| "+ Aufgabe hinzufügen" Inline-Input am Ende | `components/lists/ListColumn/ListColumn.tsx` | 🔲 |
| "Erledigt (n)" Akkordeon (eingeklappt by default) | `components/lists/ListColumn/ListColumn.tsx` | 🔲 |
| Scroll-Snap-Item | `components/lists/ListColumn/ListColumn.module.less` | 🔲 |
| Options-Menü: Umbenennen, Farbe ändern, Löschen | `components/lists/ListColumn/ListColumn.tsx` | 🔲 |

---

## Schritt 6.7 — Task Card

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Checkbox zum Abhaken (animiert) | `components/tasks/TaskCard/TaskCard.tsx` | 🔲 |
| Titel (durchgestrichen + gedimmt wenn completed) | `components/tasks/TaskCard/TaskCard.tsx` | 🔲 |
| Due-Date Badge (gelb = heute, rot = überfällig) | `components/tasks/TaskCard/TaskCard.tsx` | 🔲 |
| Priority-Indikator (linker farbiger Border-Stripe) | `components/tasks/TaskCard/TaskCard.tsx` | 🔲 |
| Subtask-Fortschritt (z.B. "2/5 ✓") | `components/tasks/TaskCard/TaskCard.tsx` | 🔲 |
| Aktiver-Timer-Indikator (pulsierender grüner Dot) | `components/tasks/TaskCard/TaskCard.tsx` | 🔲 |
| Hover-State: leichter Hintergrund, Edit-Icon | `components/tasks/TaskCard/TaskCard.module.less` | 🔲 |
| Klick → TaskDetail öffnen | `components/tasks/TaskCard/TaskCard.tsx` | 🔲 |

---

## Schritt 6.8 — Task Detail Panel

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Desktop: Side-Panel von rechts einschieben | `components/tasks/TaskDetail/TaskDetail.tsx` | 🔲 |
| Mobile: Bottom Sheet / Modal | `components/tasks/TaskDetail/TaskDetail.tsx` | 🔲 |
| Titel bearbeitbar (Inline-Input) | `components/tasks/TaskDetail/TaskDetail.tsx` | 🔲 |
| Beschreibungs-Textarea | `components/tasks/TaskDetail/TaskDetail.tsx` | 🔲 |
| Due Date Picker | `components/tasks/TaskDetail/TaskDetail.tsx` | 🔲 |
| Priority Selector (4 Optionen) | `components/tasks/TaskDetail/TaskDetail.tsx` | 🔲 |
| Subtask-Liste mit Inline-Hinzufügen | `components/tasks/TaskDetail/TaskDetail.tsx` | 🔲 |
| Zeit-Sektion (Platzhalter für Phase 7) | `components/tasks/TaskDetail/TaskDetail.tsx` | 🔲 |
| Schließen-Button + Escape-Key | `components/tasks/TaskDetail/TaskDetail.tsx` | 🔲 |
| Löschen-Button (mit Bestätigung) | `components/tasks/TaskDetail/TaskDetail.tsx` | 🔲 |

---

## Schritt 6.9 — UI-Basiskomponenten

| Komponente | Datei | Status |
|------------|-------|--------|
| `Button` (primary, secondary, ghost, danger) | `components/ui/Button/` | 🔲 |
| `Input` (text, mit Label, mit Error-State) | `components/ui/Input/` | 🔲 |
| `Modal` (mit Overlay, Escape-Key, Animation) | `components/ui/Modal/` | 🔲 |
| `Dropdown` (Context Menu / Options Menu) | `components/ui/Dropdown/` | 🔲 |
| `Badge` (Due Date, Priority) | `components/ui/Badge/` | 🔲 |
| `Checkbox` (animiert, Akzentfarbe) | `components/ui/Checkbox/` | 🔲 |
| `Spinner` / Loading-State | `components/ui/Spinner/` | 🔲 |

---

## Schritt 6.10 — Hooks für Datenzugriff

| Hook | Beschreibung | Datei | Status |
|------|-------------|-------|--------|
| `useLists()` | Listen laden, CRUD-Operationen, optimistic updates | `lib/hooks/useLists.ts` | 🔲 |
| `useTasks(listId)` | Tasks einer Liste, CRUD, Toggle | `lib/hooks/useTasks.ts` | 🔲 |
| `useSubtasks(taskId)` | Subtasks eines Tasks | `lib/hooks/useSubtasks.ts` | 🔲 |

---

## Seiten

| Seite | Beschreibung | Datei | Status |
|-------|-------------|-------|--------|
| Board (Hauptansicht) | Alle Listen als Spalten | `app/(app)/page.tsx` | 🔲 |
| Einzelne Liste | Fokus auf eine Liste (für Mobile-Direktlink) | `app/(app)/lists/[listId]/page.tsx` | 🔲 |

---

## Verzeichnisstruktur nach Phase 6

```
hector/
├── app/
│   ├── layout.tsx
│   ├── globals.less
│   └── (app)/
│       ├── layout.tsx
│       ├── layout.module.less
│       ├── page.tsx
│       └── lists/[listId]/page.tsx
└── components/
    ├── ui/
    │   ├── Button/
    │   ├── Input/
    │   ├── Modal/
    │   ├── Dropdown/
    │   ├── Badge/
    │   ├── Checkbox/
    │   ├── Spinner/
    │   └── ThemeToggle/
    ├── layout/
    │   ├── Sidebar/
    │   ├── BottomNav/
    │   └── Header/
    ├── lists/
    │   ├── ListBoard/
    │   └── ListColumn/
    └── tasks/
        ├── TaskCard/
        └── TaskDetail/
```

---

## Testkriterien

- [ ] Board zeigt Spalten nebeneinander (Desktop)
- [ ] Board scrollt horizontal, Spalten snappen (Mobile)
- [ ] Liste erstellen → erscheint sofort als neue Spalte
- [ ] Task erstellen → erscheint in Spalte
- [ ] Task abhaken → Checkbox animiert, Task in "Erledigt" verschoben
- [ ] TaskDetail öffnet sich als Side Panel (Desktop) / Bottom Sheet (Mobile)
- [ ] Light/Dark Mode wechsel funktioniert ohne Reload
- [ ] Fonts (ClashDisplay für Überschriften, Satoshi für UI) werden korrekt geladen
- [ ] Keine Tailwind-Klassen irgendwo — nur LESS-Module
