import type { Priority, Theme } from './database.types'
import type {
  ListResponse,
  TaskResponse,
  SubtaskResponse,
  TimeEntryResponse,
} from './api.types'

// ─── UI-State-erweiterte Typen ────────────────────────────────────────────────
// Diese Typen wrappen die API-Response-Typen und fügen UI-spezifischen State hinzu.
// Sie werden in Hooks und Komponenten genutzt — nie direkt für API-Calls.

export interface AppList extends ListResponse {
  isLoading: boolean
  isEditing: boolean      // Inline-Rename aktiv
  tasks: AppTask[]
}

export interface AppTask extends TaskResponse {
  isExpanded: boolean     // Detail-Panel offen
  isTimerRunning: boolean // Aktiver Timer auf diesem Task
  isLoading: boolean      // API-Call läuft (z.B. toggle)
  subtasks: AppSubtask[]
  timeEntries: AppTimeEntry[]
}

export interface AppSubtask extends SubtaskResponse {
  isEditing: boolean
}

export interface AppTimeEntry extends TimeEntryResponse {
  isEditing: boolean
  formattedDuration: string  // z.B. '1h 23m', '0:42:17'
}

// ─── Globaler Timer-State ─────────────────────────────────────────────────────

export interface TimerState {
  entryId: string | null
  taskId: string | null
  startedAt: Date | null
  elapsedSeconds: number
  isRunning: boolean
}

export const INITIAL_TIMER_STATE: TimerState = {
  entryId: null,
  taskId: null,
  startedAt: null,
  elapsedSeconds: 0,
  isRunning: false,
}

// ─── Board-State ──────────────────────────────────────────────────────────────

export interface BoardState {
  lists: AppList[]
  selectedListId: string | null   // Für Mobile: aktuell sichtbare Spalte
  activeTaskId: string | null     // Detail-Panel
  searchQuery: string
  isLoading: boolean
}

// ─── Re-Exports (Convenience) ─────────────────────────────────────────────────

export type { Priority, Theme }

// ─── UI-Utility-Typen ─────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number      // ms, default 4000
}

export type DropdownItem =
  | { type: 'item'; label: string; icon?: string; onClick: () => void; danger?: boolean }
  | { type: 'separator' }
