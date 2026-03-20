# Fix UI Bugs — Phase 6 Nachbearbeitung

**Status:** ✅ Fertig
**Erstellt:** 2026-03-19

Alle identifizierten Darstellungs- und Funktionsfehler nach Phase 6. Tasks sind in Priorität geordnet.

---

## Übersicht der Bugs

| # | Bug | Ursache | Priorität |
|---|-----|---------|-----------|
| 1 | BottomNav auf Desktop sichtbar | Kein `display:none` Media Query | Hoch |
| 2 | Sidebar-Content-Überlappung | Sidebar `position:fixed` + Layout inkonsistent | Hoch |
| 3 | Inputs erscheinen riesig (16px min) | `reset.less` override: `font-size: max(16px, 1em)` | Hoch |
| 4 | Daten-Fetch 3–4 Sekunden | Doppelter Fetch: SSR in Layout + CSR in `useLists()` | Hoch |
| 5 | Font-Weight zu leicht | `body font-weight: 400` statt Medium 500 | Mittel |
| 6 | Links führen zu 404 | `/marked`, `/timer`, `/time`, `/settings` nicht implementiert | Mittel |

---

## Task 1 — BottomNav Desktop ausblenden

**Datei:** `components/layout/BottomNav/BottomNav.module.less`

**Problem:** `.bottomNav` hat kein Media Query. Es ist `position: fixed; bottom: 0` und damit immer sichtbar — auch auf Desktop.

**Fix:**
```less
// Am Ende der Datei ergänzen:
@media (min-width: @bp-mobile) {
  .bottomNav {
    display: none;
  }
}
```

**Zudem:** `app/(app)/layout.module.less` hat `.content { padding-bottom: 64px }` nur für `max-width: @bp-mobile`. Das ist korrekt, aber prüfen ob es greift.

---

## Task 2 — Layout-Struktur reparieren

**Dateien:** `app/(app)/layout.module.less`, `components/layout/Sidebar/Sidebar.module.less`

**Problem:** Die Sidebar ist `position: fixed` (bleibt oben bei Scroll, korrekt). Aber der App-Layout-Shell muss den Content korrekt neben der Sidebar platzieren. Aktuell gibt es einen Wrapper-Div der 240px breit ist (im Flex-Flow), aber die fixed-positionierte `<aside>` springt aus dem Flow heraus und der Wrapper-Div kollabiert auf 0 Höhe → der `<aside>` überlappt nichts nicht korrekt.

**Richtiger Ansatz:** Die Sidebar-Komponente soll **nicht** `position: fixed` sein. Stattdessen:
- Shell: `display: flex; flex-direction: row; height: 100dvh; overflow: hidden`
- Sidebar: normaler Flex-Item, `flex-shrink: 0; width: 240px; overflow-y: auto`
- Content: `flex: 1; overflow: hidden`

Das ist einfacher und robuster als fixed + margin-kompensation.

**Änderungen:**
1. `Sidebar.module.less`: `.sidebar` → `position: relative` (nicht fixed), `height: 100%`
2. `app/(app)/layout.module.less`: Shell korrekt als Flex-Row

---

## Task 3 — Input Font-Size Reset reparieren

**Datei:** `styles/reset.less`

**Problem:**
```css
input, textarea, select {
  font-size: max(16px, 1em);  /* iOS zoom prevention */
}
```
Das überschreibt alle Eingabefelder auf mindestens 16px — auch die kleinen Inline-Inputs im Task-Add (sollten 13px/14px sein). Das macht sie viel zu groß.

**Fix:** Die iOS-Zoom-Prevention nur auf bestimmte Elemente anwenden, nicht global. iOS zoomt nur wenn `font-size < 16px`. Wir können stattdessen:
1. Regel auf `max(15px, 1em)` setzen — 15px ist nahe genug an 16px dass kein Zoom auftritt
2. ODER: die Regel auf `16px` belassen, aber alle Component-CSS-Module setzen `font-size` explizit auf `16px` (statt 13px) wenn sie es überschreiben wollen — das kollidiert dann nicht

**Empfehlung:** Regel entfernen, da wir `font-size: 15px` als body-base haben und iOS bei 16px nicht zoomt. Stattdessen in den spezifischen Inputs `font-size: 1rem` setzen (= 15px, kein Zoom).

---

## Task 4 — Doppelter Datenabruf eliminieren

**Dateien:** `app/(app)/layout.tsx`, `app/(app)/page.tsx`, `lib/hooks/useLists.ts`

**Problem:**
1. `app/(app)/layout.tsx` fetcht Lists via `getLists()` (Server Component, Supabase) → 1-2 Sekunden
2. `app/(app)/page.tsx` ruft `useLists()` auf → fetcht nochmal via `/api/v1/lists` → weitere 1-2 Sekunden
3. Ergebnis: 3-4 Sekunden bis Daten sichtbar

**Lösung — Initial-Daten von Server an Client übergeben:**

```
Server (layout.tsx)
  → lädt lists
  → übergibt als prop an page.tsx wrapper

Client (page.tsx)
  → nimmt initialLists als prop
  → useLists({ initialData: initialLists })
  → zeigt sofort Daten, kein Ladescreen
```

Konkret:
1. `useLists(initialData?: TaskList[])` — optionales initial-Data-Parameter
2. `app/(app)/page.tsx` als Server Component, übergibt `initialLists` ans Client-Board
3. `BoardClient.tsx` — neues Client-Wrapper-Component das den Hook mit initialData aufruft

---

## Task 5 — Satoshi Medium als Hauptfont

**Datei:** `styles/typography.less`

**Problem:** `body { font-weight: 400; }` — die App sieht zu leicht aus

**Fix:**
```less
body {
  font-weight: 500; // Satoshi Medium
}
```

---

## Task 6 — Stub-Seiten für fehlende Links

**Neue Dateien:**
- `app/(app)/marked/page.tsx` → "Markierte Aufgaben — kommt bald"
- `app/(app)/timer/page.tsx` → "Timer — kommt in Phase 7"
- `app/(app)/time/page.tsx` → "Zeitauswertung — kommt bald"
- `app/(app)/settings/page.tsx` → "Einstellungen — kommt bald"

**Hinweis:** `/settings` und `/timer` sind auch in BottomNav verlinkt. Alle vier Links sollen einen sauberen Platzhalter zeigen statt 404.

---

## Implementierungsreihenfolge

```
Task 1 → BottomNav Desktop Fix    (5 min)
Task 2 → Layout-Struktur          (20 min)
Task 3 → Input Font-Size          (5 min)
Task 5 → Font-Weight              (2 min)
Task 4 → Doppelter Fetch          (30 min) — nach Layout fix
Task 6 → Stub-Seiten              (10 min)
```

---

## Testanweisungen nach Fix

### Desktop (> 768px):
1. Browser auf Vollbild öffnen
2. ✅ Sidebar links sichtbar, kein Überlappen mit Content
3. ✅ BottomNav (Unterleiste) nicht sichtbar
4. ✅ Board lädt sofort (< 500ms) ohne Ladescreen
5. ✅ Inputs in Spalten haben normale Schriftgröße (~14px)
6. Neue Liste erstellen → erscheint sofort
7. Task hinzufügen → erscheint sofort

### Mobile (< 768px Viewport, DevTools simulieren):
1. ✅ Sidebar nicht sichtbar
2. ✅ BottomNav am unteren Rand sichtbar
3. Board scrollt horizontal

### Links:
- Sidebar-Links `/marked`, `/timer`, `/settings` klicken → kein 404, Platzhalter
