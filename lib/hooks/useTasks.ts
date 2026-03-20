'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Task } from '@/types/database.types'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'API error')
  return json.data as T
}

export type TaskTimeEntry = { id: string; durationSeconds: number }

export function useTasks(listId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskTimeEntries, setTaskTimeEntries] = useState<Record<string, TaskTimeEntry[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!listId) return
    try {
      setLoading(true)
      const data = await apiFetch<Task[]>(`/api/v1/lists/${listId}/tasks`)
      setTasks(data)

      if (data.length > 0) {
        const ids = data.map(t => t.id).join(',')
        const grouped = await apiFetch<Record<string, TaskTimeEntry[]>>(
          `/api/v1/time-entries/totals?taskIds=${ids}`
        )
        setTaskTimeEntries(grouped)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setLoading(false)
    }
  }, [listId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = useCallback(async (title: string) => {
    if (!listId) return
    const optimisticId = `optimistic-${Date.now()}`
    const optimistic: Task = {
      id: optimisticId,
      list_id: listId,
      user_id: '',
      title,
      description: null,
      is_completed: false,
      completed_at: null,
      due_date: null,
      due_time: null,
      priority: 'none',
      position: tasks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTasks(prev => [...prev, optimistic])
    try {
      const created = await apiFetch<Task>(`/api/v1/lists/${listId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      })
      setTasks(prev => prev.map(t => t.id === optimisticId ? created : t))
      return created
    } catch (err) {
      setTasks(prev => prev.filter(t => t.id !== optimisticId))
      throw err
    }
  }, [listId, tasks.length])

  const updateTask = useCallback(async (taskId: string, data: Partial<Pick<Task, 'title' | 'description' | 'due_date' | 'priority' | 'is_completed'>>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...data } : t))
    try {
      const updated = await apiFetch<Task>(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t))
    } catch {
      fetchTasks()
    }
  }, [fetchTasks])

  const toggleComplete = useCallback(async (taskId: string): Promise<boolean> => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return false
    const isNowCompleted = !task.is_completed
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: isNowCompleted } : t))
    try {
      await apiFetch<Task>(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isCompleted: isNowCompleted }),
      })
    } catch {
      fetchTasks()
    }
    return isNowCompleted
  }, [tasks, fetchTasks])

  const deleteTask = useCallback(async (taskId: string) => {
    const prev = tasks
    setTasks(cur => cur.filter(t => t.id !== taskId))
    try {
      await fetch(`/api/v1/tasks/${taskId}`, { method: 'DELETE' })
    } catch {
      setTasks(prev)
    }
  }, [tasks])

  const logTime = useCallback(async (taskId: string, seconds: number): Promise<TaskTimeEntry> => {
    const optimisticEntry: TaskTimeEntry = { id: `optimistic-${Date.now()}`, durationSeconds: seconds }
    setTaskTimeEntries(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] ?? []), optimisticEntry],
    }))
    try {
      const created = await apiFetch<{ id: string }>('/api/v1/time-entries', {
        method: 'POST',
        body: JSON.stringify({ taskId, durationSeconds: seconds }),
      })
      const real: TaskTimeEntry = { id: created.id, durationSeconds: seconds }
      setTaskTimeEntries(prev => ({
        ...prev,
        [taskId]: (prev[taskId] ?? []).map(e => e.id === optimisticEntry.id ? real : e),
      }))
      return real
    } catch {
      setTaskTimeEntries(prev => ({
        ...prev,
        [taskId]: (prev[taskId] ?? []).filter(e => e.id !== optimisticEntry.id),
      }))
      throw new Error('Zeit konnte nicht gespeichert werden')
    }
  }, [])

  const deleteTimeEntry = useCallback(async (taskId: string, entryId: string) => {
    const snapshot = taskTimeEntries[taskId] ?? []
    setTaskTimeEntries(prev => ({
      ...prev,
      [taskId]: (prev[taskId] ?? []).filter(e => e.id !== entryId),
    }))
    try {
      await fetch(`/api/v1/time-entries/${entryId}`, { method: 'DELETE' })
    } catch {
      setTaskTimeEntries(prev => ({ ...prev, [taskId]: snapshot }))
    }
  }, [taskTimeEntries])

  const updateTimeEntry = useCallback(async (taskId: string, entryId: string, seconds: number) => {
    setTaskTimeEntries(prev => ({
      ...prev,
      [taskId]: (prev[taskId] ?? []).map(e => e.id === entryId ? { ...e, durationSeconds: seconds } : e),
    }))
    try {
      await apiFetch(`/api/v1/time-entries/${entryId}`, {
        method: 'PATCH',
        body: JSON.stringify({ durationSeconds: seconds }),
      })
    } catch {
      fetchTasks()
    }
  }, [fetchTasks])

  return {
    tasks, taskTimeEntries, loading, error,
    createTask, updateTask, toggleComplete, deleteTask,
    logTime, updateTimeEntry, deleteTimeEntry,
    refetch: fetchTasks,
  }
}
