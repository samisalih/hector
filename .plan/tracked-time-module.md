# Tracked Time Module

**Status:** ✅ Done
**Route:** `/time`
**Goal:** Daily time overview — circular progress ring + entry list, configurable 8h daily goal

---

## Overview

The `/time` page shows:
1. **Circular ring** — SVG progress ring showing `totalSeconds / goalSeconds`. Center: stopwatch icon + total time (H:MM) + date. Left/right arrows to navigate between days.
2. **Entry list** — all time entries for the selected day, each showing task title (bold) + list name (small/muted) + duration (right-aligned).
3. **Daily goal** — default 8h (28800s), stored in `localStorage`, settable later via Settings.

---

## Phase 1 — API: `GET /api/v1/time-entries/daily`

**Status:** ✅ Done
**File:** `app/api/v1/time-entries/daily/route.ts`

**Request:** `GET /api/v1/time-entries/daily?date=2026-03-20`
Date defaults to today (UTC) if omitted.

**Response shape:**
```typescript
type DailyEntry = {
  id: string
  durationSeconds: number
  taskId: string
  taskTitle: string
  listId: string
  listTitle: string
  startedAt: string
}

type DailyResponse = {
  date: string           // ISO date string, e.g. "2026-03-20"
  totalSeconds: number   // sum of all durationSeconds for the day
  entries: DailyEntry[]  // ordered by startedAt DESC
}
```

**DB query:**
```sql
SELECT
  te.id,
  te.duration_seconds,
  te.started_at,
  t.id        AS task_id,
  t.title     AS task_title,
  l.id        AS list_id,
  l.title     AS list_title
FROM time_entries te
JOIN tasks t ON t.id = te.task_id
JOIN lists l ON l.id = t.list_id
WHERE te.user_id = $userId
  AND te.started_at >= $dayStart   -- date 00:00:00 UTC
  AND te.started_at <  $dayEnd     -- date+1 00:00:00 UTC
  AND te.ended_at IS NOT NULL      -- only completed entries
ORDER BY te.started_at DESC
```

**Implementation notes:**
- `dayStart` = `new Date(date + 'T00:00:00.000Z')`
- `dayEnd` = `new Date(date + 'T00:00:00.000Z')` + 86400000ms
- Use `supabase.from('time_entries').select('*, tasks(id, title, list_id, lists(id, title))')`
- Map nested result to flat `DailyEntry[]`
- `totalSeconds` = sum of `duration_seconds` from all entries (filter null)
- Return `{ data: { date, totalSeconds, entries } }`

---

## Phase 2 — Hook: `useTrackedTime`

**Status:** ✅ Done
**File:** `lib/hooks/useTrackedTime.ts`

```typescript
type DailyEntry = {
  id: string
  durationSeconds: number
  taskId: string
  taskTitle: string
  listId: string
  listTitle: string
  startedAt: string
}

function useTrackedTime() {
  // selectedDate: ISO date string 'YYYY-MM-DD', default today
  // goalSeconds: from localStorage key 'hector_daily_goal', default 28800
  // entries: DailyEntry[]
  // totalSeconds: number
  // loading: boolean
  // goToPrevDay() / goToNextDay() — clamp at today (no future)
  // setGoalSeconds(n: number) — persists to localStorage
}
```

**localStorage key:** `hector_daily_goal` (value: number of seconds as string)

**Fetch:** `GET /api/v1/time-entries/daily?date=${selectedDate}` on mount + on date change.

---

## Phase 3 — Components

**Status:** ✅ Done

### `components/time/DailyRing/DailyRing.tsx`

SVG circular progress ring.

**Props:**
```typescript
{
  totalSeconds: number
  goalSeconds: number
  date: string          // ISO date string
  onPrev: () => void
  onNext: () => void
  canGoNext: boolean    // false when date === today
}
```

**SVG spec:**
- `viewBox="0 0 220 220"`, `width` / `height` via CSS (responsive)
- Background circle: `cx=110 cy=110 r=90`, `stroke: var(--border)`, `strokeWidth=14`, `fill=none`
- Progress circle: same cx/cy/r, `stroke: var(--accent)`, `strokeWidth=14`, `strokeLinecap=round`
  - `strokeDasharray = 2 * Math.PI * 90 ≈ 565.5`
  - `strokeDashoffset = dasharray * (1 - Math.min(progress, 1))`
  - `transform="rotate(-90 110 110)"` (starts at top)
  - Smooth CSS transition: `transition: stroke-dashoffset 600ms ease`
- When progress ≥ 1 (goal met): stroke color switches to `var(--color-success)` (`#00d196`)
- Center content (foreignObject or absolute overlay):
  - Stopwatch SVG icon (16px, `var(--accent)`)
  - Time display: `formatTime(totalSeconds)` → `"3:01"` format (H:MM, not zero-padded hours)
  - Date label: formatted as `"Mar 18"` (short month + day)
- Left/right chevron buttons outside the ring for day navigation

**`formatTime(seconds: number): string`**
→ `Math.floor(s/3600) + ':' + String(Math.floor((s%3600)/60)).padStart(2,'0')`

### `components/time/TimeEntryRow/TimeEntryRow.tsx`

Single entry row.

**Props:** `{ entry: DailyEntry }`

**Layout:**
```
[ task title (bold, text-base, var(--text)) ]
[ list name  (text-sm, var(--text-muted))   ]     [ H:MM (text-sm, var(--text-muted)) ]
```

Card-style: `background: var(--surface-gradient)`, `border-radius: @radius-xl`, `padding: @space-3 @space-4`, `box-shadow: var(--shadow-sm-raised)`

### `components/time/TimeEntryList/TimeEntryList.tsx`

**Props:** `{ entries: DailyEntry[], loading: boolean }`

- If `loading`: skeleton placeholders (2–3 rows, pulsing opacity)
- If `entries.length === 0`: empty state ("No time tracked this day")
- Otherwise: vertical list of `TimeEntryRow`, `gap: @space-2`

---

## Phase 4 — Page

**Status:** ✅ Done
**File:** `app/(app)/time/page.tsx`

Replace placeholder with:

```tsx
'use client'
import { useTrackedTime } from '@/lib/hooks/useTrackedTime'
import DailyRing from '@/components/time/DailyRing/DailyRing'
import TimeEntryList from '@/components/time/TimeEntryList/TimeEntryList'

export default function TimePage() {
  const { totalSeconds, goalSeconds, entries, loading, selectedDate, goToPrevDay, goToNextDay, isToday } = useTrackedTime()

  return (
    <main>
      <DailyRing
        totalSeconds={totalSeconds}
        goalSeconds={goalSeconds}
        date={selectedDate}
        onPrev={goToPrevDay}
        onNext={goToNextDay}
        canGoNext={!isToday}
      />
      <TimeEntryList entries={entries} loading={loading} />
    </main>
  )
}
```

**Layout:** scrollable `main` with `padding: @space-6`, max-width `480px` centered, consistent with the rest of the app shell.

---

## Style files

- `components/time/DailyRing/DailyRing.module.less`
- `components/time/TimeEntryRow/TimeEntryRow.module.less`
- `components/time/TimeEntryList/TimeEntryList.module.less`
- `app/(app)/time/page.module.less`

All use LESS modules + CSS custom properties, no Tailwind.

---

## Implementation Order

1. Phase 1 — API route
2. Phase 2 — Hook
3. Phase 3 — Components (DailyRing → TimeEntryRow → TimeEntryList)
4. Phase 4 — Page

---

## Verification

- `npx tsc --noEmit` clean
- Open `/time` in browser (dark mode):
  - Ring renders, progress fills from left-top, teal color
  - Center shows H:MM time + date
  - Prev/Next arrows navigate days, Next disabled on today
  - Entry list shows task title bold + list name small + duration right-aligned
  - Empty state on days with no entries
  - Goal 8h = 100% when 8h tracked; at 4h ring is half filled
