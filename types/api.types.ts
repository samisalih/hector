import type { Priority, Theme } from './database.types'

// ─── Standard Response Envelope ───────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

// ─── Lists ────────────────────────────────────────────────────────────────────

export interface ListResponse {
  id: string
  userId: string
  title: string
  color: string | null
  icon: string | null
  position: number
  taskCount: number
  completedCount: number
  createdAt: string
  updatedAt: string
}

export interface ListWithTasksResponse extends ListResponse {
  tasks: TaskResponse[]
}

export interface CreateListRequest {
  title: string
  color?: string
  icon?: string
}

export interface UpdateListRequest {
  title?: string
  color?: string | null
  icon?: string | null
  position?: number
}

export interface ReorderListsRequest {
  listIds: string[]
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface TaskResponse {
  id: string
  listId: string
  userId: string
  title: string
  description: string | null
  isCompleted: boolean
  completedAt: string | null
  dueDate: string | null
  dueTime: string | null
  position: number
  priority: Priority
  subtaskCount: number
  completedSubtaskCount: number
  totalDurationSeconds: number
  hasActiveTimer: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskWithDetailsResponse extends TaskResponse {
  subtasks: SubtaskResponse[]
  timeEntries: TimeEntryResponse[]
}

export interface CreateTaskRequest {
  listId: string
  title: string
  description?: string
  dueDate?: string       // ISO date: YYYY-MM-DD
  dueTime?: string       // HH:MM
  priority?: Priority
}

export interface UpdateTaskRequest {
  listId?: string        // Für Task-Verschiebung zwischen Listen
  title?: string
  description?: string | null
  dueDate?: string | null
  dueTime?: string | null
  priority?: Priority
  isCompleted?: boolean
  position?: number
}

export interface ReorderTasksRequest {
  taskIds: string[]
}

// ─── Subtasks ─────────────────────────────────────────────────────────────────

export interface SubtaskResponse {
  id: string
  taskId: string
  userId: string
  title: string
  isCompleted: boolean
  completedAt: string | null
  position: number
  createdAt: string
  updatedAt: string
}

export interface CreateSubtaskRequest {
  title: string
}

export interface UpdateSubtaskRequest {
  title?: string
  isCompleted?: boolean
  position?: number
}

// ─── Time Entries ─────────────────────────────────────────────────────────────

export interface TimeEntryResponse {
  id: string
  taskId: string
  userId: string
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
  notes: string | null
  isManual: boolean
  isActive: boolean       // endedAt === null
  createdAt: string
  updatedAt: string
}

export interface ActiveTimerResponse {
  entryId: string
  taskId: string
  startedAt: string
  elapsedSeconds: number  // Berechnet aus startedAt bis jetzt
}

export type StartTimerRequest = {
  action: 'start'
}

export type StopTimerRequest = {
  action: 'stop'
  notes?: string
}

export interface CreateManualTimeEntryRequest {
  startedAt: string      // ISO datetime
  endedAt: string        // ISO datetime, muss > startedAt sein
  notes?: string
}

export interface UpdateTimeEntryRequest {
  startedAt?: string
  endedAt?: string
  notes?: string | null
}

export interface TimeEntryFilters {
  from?: string          // ISO date
  to?: string            // ISO date
  taskId?: string
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export interface ApiKeyResponse {
  id: string
  name: string
  keyPrefix: string      // z.B. 'tsx_abc12345...' (nur erste 12 Zeichen)
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

// Einmalig beim Erstellen oder Rotieren zurückgegeben — danach nicht mehr abrufbar
export interface NewApiKeyResponse extends ApiKeyResponse {
  key: string            // Vollständiger Key: tsx_<32 Random-Chars>
}

export interface CreateApiKeyRequest {
  name: string
  expiresAt?: string     // ISO datetime, optional
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface ProfileResponse {
  id: string
  email: string
  displayName: string | null
  theme: Theme
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  displayName?: string | null
  theme?: Theme
}
