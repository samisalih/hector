import { z } from 'zod'

const PriorityEnum = z.enum(['none', 'low', 'medium', 'high'])

// Lists
export const CreateListSchema = z.object({
  title: z.string().min(1).max(255),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export const UpdateListSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  position: z.number().int().optional(),
})

export const ReorderListsSchema = z.object({
  listIds: z.array(z.string().uuid()),
})

// Tasks
export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  priority: PriorityEnum.optional(),
})

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  priority: PriorityEnum.optional(),
  isCompleted: z.boolean().optional(),
  listId: z.string().uuid().optional(),
  position: z.number().int().optional(),
})

export const ReorderTasksSchema = z.object({
  taskIds: z.array(z.string().uuid()),
})

// Subtasks
export const CreateSubtaskSchema = z.object({
  title: z.string().min(1).max(500),
})

export const UpdateSubtaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  isCompleted: z.boolean().optional(),
})

export const ReorderSubtasksSchema = z.object({
  subtaskIds: z.array(z.string().uuid()),
})

// Time Entries — POST body is either { action: 'start' } or { startedAt, endedAt, notes? }
export const StartTimerSchema = z.object({
  action: z.literal('start'),
})

export const CreateManualEntrySchema = z.object({
  startedAt: z.string().datetime({ offset: true }),
  endedAt: z.string().datetime({ offset: true }),
  notes: z.string().optional(),
})

export const StopTimerSchema = z.object({
  action: z.literal('stop'),
  notes: z.string().optional(),
})

export const UpdateTimeEntrySchema = z.object({
  startedAt: z.string().datetime({ offset: true }).optional(),
  endedAt: z.string().datetime({ offset: true }).optional(),
  notes: z.string().optional().nullable(),
})

// API Keys
export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  expiresAt: z.string().datetime({ offset: true }).optional(),
})

// Profile
export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(255).optional().nullable(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
})

// Helper
export function parseBody<T>(schema: z.ZodType<T>, body: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const message = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    return { error: message }
  }
  return { data: result.data }
}
