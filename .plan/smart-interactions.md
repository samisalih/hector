# Smart Interactions — motion.dev

**Status:** ✅ Fertig
**Paket:** `motion` v12 (`motion/react`) — installiert
**Ziel:** Die App fühlt sich lebendig an — durch physikalisch korrekte Animationen an den richtigen Stellen, nicht überall.

---

## Technische Vorabklärung

### Was motion.dev leistet, was CSS nicht kann
- **Exit-Animationen** via `AnimatePresence` — Task-Löschung, Modal-Schließen
- **Stagger** — Liste von Items animiert versetzt rein
- **Spring-Physik** — natürlich federnde Interaktionen statt linearer Kurven
- **Layout-Animationen** — wenn sich Layout-Positionen ändern (z.B. Task-Reorder), kann motion den Übergang interpolieren

### Was wir NICHT anfassen
- **HTML5 Drag & Drop** bleibt unangetastet — motion's DnD wäre ein kompletter Umbau von ListBoard/ListColumn
- **CSS Hover-States** bleiben in LESS — `transform: translateY(-1px)` etc. lassen sich nicht verbessern durch motion
- **Loading-Skeleton** bleibt CSS `@keyframes shimmer`

### Import-Pfad (motion v12)
```typescript
import { motion, AnimatePresence, useSpring } from 'motion/react'
```
Nicht `framer-motion`. Nicht `motion` direkt (das ist die vanilla-JS API).

### Hydration
Alle Ziel-Components sind bereits `'use client'` → kein Hydration-Problem.
motion initialisiert auf dem Client — kein SSR-Konflikt.

### Bundle-Größe
motion v12 ist gut tree-shakeable. Nur importierte Features landen im Bundle.
`AnimatePresence` + `motion.div` allein: ~20 KB gzip.

---

## Schritt 1 — Installation

```bash
npm install motion
```

Keine weiteren Config-Änderungen nötig.

---

## Schritt 2 — TaskCard: Erscheinen & Verschwinden

**Datei:** `components/tasks/TaskCard/TaskCard.tsx`
**Datei:** `components/lists/ListColumn/ListColumn.tsx`

Das ist der größte UX-Gewinn: Tasks erscheinen weich wenn sie erstellt werden, und verschwinden animiert wenn sie gelöscht oder abgehakt werden.

### 2a — Card-Entrance (Erstellung)

Jede `<motion.div>` um eine TaskCard mit:
```typescript
initial={{ opacity: 0, y: 8, scale: 0.97 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
transition={{ type: 'spring', stiffness: 400, damping: 28 }}
```

### 2b — Card-Exit (Löschen / Abschließen)

`AnimatePresence` um die Task-Liste in ListColumn.
Jede Card bekommt:
```typescript
exit={{ opacity: 0, x: -12, scale: 0.95 }}
transition={{ duration: 0.18, ease: 'easeIn' }}
```

### 2c — Checkbox Spring

Die Checkbox bekommt beim Abhaken:
```typescript
// Wenn is_completed: true
animate={{ scale: [1, 1.3, 1] }}
transition={{ type: 'spring', stiffness: 500, damping: 20 }}
```

---

## Schritt 3 — TaskList Stagger beim Laden

**Datei:** `components/lists/ListColumn/ListColumn.tsx`

Wenn die Tasks initial gerendert werden (nach dem ersten Fetch), kommen sie versetzt rein:

```typescript
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 26 } }
}
```

`staggerChildren: 0.04` → 40ms zwischen jedem Item — subtil, nicht ablenkend.
Nur beim initialen Mount abspielen, nicht bei jedem Re-render.

---

## Schritt 4 — Modal & TimeLogModal Entrance/Exit

**Dateien:** `components/ui/Modal/Modal.tsx`, `components/ui/TimeLogModal/TimeLogModal.tsx`

Aktuell: CSS `opacity` + `transform` im Overlay, kein Exit.
Mit motion:

**Backdrop:**
```typescript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.15 }}
```

**Panel:**
```typescript
initial={{ opacity: 0, scale: 0.96, y: 8 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.96, y: 4 }}
transition={{ type: 'spring', stiffness: 400, damping: 30 }}
```

`AnimatePresence` sitzt im Portal — da die `createPortal`-Komponente mounted/unmounted wird wenn `isOpen` false ist, muss `AnimatePresence` die Bedingung wrappen, nicht das Portal selbst.

---

## Schritt 5 — DailyRing: Progress-Animation

**Datei:** `components/time/DailyRing/DailyRing.tsx`

Aktuell wird `stroke-dashoffset` direkt als SVG-Attribut gesetzt.
Mit motion:

```typescript
import { motion } from 'motion/react'

// <circle> → <motion.circle>
// stroke-dashoffset via animate prop
<motion.circle
  strokeDashoffset={dashOffset}
  animate={{ strokeDashoffset: dashOffset }}
  transition={{ type: 'spring', stiffness: 80, damping: 20, mass: 1 }}
/>
```

Wenn das Datum wechselt oder neue Einträge reinkommen, federt der Ring auf den neuen Wert.

---

## Schritt 6 — Sidebar Listen-Items Hover-Feedback

**Datei:** `components/layout/Sidebar/Sidebar.tsx`

Die Listen-Links bekommen ein subtiles `whileHover`:
```typescript
<motion.a whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
```

Nur 3px — kaum sichtbar, aber spürbar.

---

## Schritt 7 — Page Transitions

**Datei:** `app/(app)/layout.tsx`

Zwischen `/`, `/time`, `/settings` ein einfacher Fade:
```typescript
<motion.main
  key={pathname}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.15 }}
>
  {children}
</motion.main>
```

`usePathname()` als `key` → bei Route-Wechsel wird die Component re-mounted und die Animation spielt.

---

## Priorisierung

| Schritt | Aufwand | UX-Gewinn | Priorität |
|---------|---------|-----------|-----------|
| 2 — TaskCard Erscheinen/Verschwinden | mittel | ⭐⭐⭐⭐⭐ | 1 |
| 4 — Modal Entrance/Exit | niedrig | ⭐⭐⭐⭐ | 2 |
| 5 — DailyRing Animation | niedrig | ⭐⭐⭐⭐ | 3 |
| 3 — Stagger beim Laden | niedrig | ⭐⭐⭐ | 4 |
| 7 — Page Transitions | niedrig | ⭐⭐⭐ | 5 |
| 6 — Sidebar Hover | sehr niedrig | ⭐⭐ | 6 |

---

## Risiken & Gegenmaßnahmen

| Risiko | Gegenmaßnahme |
|--------|---------------|
| `AnimatePresence` + `createPortal` — die `exit`-Animation läuft nicht, weil das Portal die DOM-Node sofort entfernt | `AnimatePresence` muss um die `isOpen`-Bedingung wrappen, nicht um `createPortal` selbst. Alternativ: unmount erst nach Animation via `mode="wait"` |
| motion's `layout`-Animation kollidiert mit dem Scroll-Container der TaskList | Nur `layout` auf dem direkten Elternelement aktivieren, nicht auf dem Scroll-Container |
| Stagger-Animation spielt auch bei optimistischen Updates ab (neue Task hinzufügen) | `initial={false}` auf dem Container-Variant → nur beim Mount, nicht bei nachfolgenden State-Changes |
| Performance auf Low-End-Geräten | `prefers-reduced-motion` Media Query via `useReducedMotion()` Hook von motion respektieren |
