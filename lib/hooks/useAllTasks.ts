'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Task } from '@/types/database.types'

export type TaskTimeEntry = { id: string; durationSeconds: number }

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'API error')
  return json.data as T
}

export function useAllTasks(listIds: string[], initialTasksByList?: Record<string, Task[]>) {
  const listIdsKey = listIds.join(',')
  const [tasksByList, setTasksByList] = useState<Record<string, Task[]>>(initialTasksByList ?? {})
  const [taskTimeEntries, setTaskTimeEntries] = useState<Record<string, TaskTimeEntry[]>>({})

  const fetchAll = useCallback(async () => {
    const ids = listIdsKey.split(',').filter(Boolean)
    if (ids.length === 0) return

    const [tasksResult, timeResult] = await Promise.all([
      apiFetch<Record<string, Task[]>>(`/api/v1/tasks?listIds=${ids.join(',')}`).catch(() => ({} as Record<string, Task[]>)),
      apiFetch<Record<string, TaskTimeEntry[]>>(`/api/v1/time-entries/totals?listIds=${ids.join(',')}`).catch(() => ({} as Record<string, TaskTimeEntry[]>)),
    ])

    setTasksByList(tasksResult)
    setTaskTimeEntries(timeResult)
  }, [listIdsKey])

  useEffect(() => { fetchAll() }, [fetchAll])

  const fetchAllRef = useRef(fetchAll)
  fetchAllRef.current = fetchAll

  useEffect(() => {
    const handler = () => fetchAllRef.current()
    window.addEventListener('hector:board-updated', handler)
    return () => window.removeEventListener('hector:board-updated', handler)
  }, [])

  const createTask = useCallback(async (listId: string, title: string) => {
    const optimisticId = `optimistic-${Date.now()}`
    const tasks = tasksByList[listId] ?? []
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
    setTasksByList(prev => ({ ...prev, [listId]: [...(prev[listId] ?? []), optimistic] }))
    try {
      const created = await apiFetch<Task>(`/api/v1/lists/${listId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      })
      setTasksByList(prev => ({
        ...prev,
        [listId]: (prev[listId] ?? []).map(t => t.id === optimisticId ? created : t),
      }))
    } catch {
      setTasksByList(prev => ({
        ...prev,
        [listId]: (prev[listId] ?? []).filter(t => t.id !== optimisticId),
      }))
    }
  }, [tasksByList])

  const toggleComplete = useCallback(async (taskId: string, listId: string): Promise<boolean> => {
    const task = (tasksByList[listId] ?? []).find(t => t.id === taskId)
    if (!task) return false
    const isNowCompleted = !task.is_completed
    setTasksByList(prev => ({
      ...prev,
      [listId]: (prev[listId] ?? []).map(t => t.id === taskId ? { ...t, is_completed: isNowCompleted } : t),
    }))
    try {
      await apiFetch<Task>(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isCompleted: isNowCompleted }),
      })
    } catch {
      fetchAll()
    }
    return isNowCompleted
  }, [tasksByList, fetchAll])

  const deleteTask = useCallback(async (taskId: string, listId: string) => {
    const snapshot = tasksByList[listId]
    setTasksByList(prev => ({
      ...prev,
      [listId]: (prev[listId] ?? []).filter(t => t.id !== taskId),
    }))
    try {
      await fetch(`/api/v1/tasks/${taskId}`, { method: 'DELETE' })
    } catch {
      setTasksByList(prev => ({ ...prev, [listId]: snapshot }))
    }
  }, [tasksByList])

  const updateTask = useCallback(async (
    taskId: string,
    listId: string,
    data: Partial<Pick<Task, 'title' | 'description' | 'due_date' | 'priority'>>
  ) => {
    setTasksByList(prev => ({
      ...prev,
      [listId]: (prev[listId] ?? []).map(t => t.id === taskId ? { ...t, ...data } : t),
    }))
    try {
      const apiData: Record<string, unknown> = {}
      if ('title' in data) apiData.title = data.title
      if ('description' in data) apiData.description = data.description
      if ('due_date' in data) apiData.dueDate = data.due_date
      if ('priority' in data) apiData.priority = data.priority
      await apiFetch(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(apiData),
      })
    } catch {
      fetchAll()
    }
  }, [fetchAll])

  const moveTask = useCallback(async (
    taskId: string,
    fromListId: string,
    toListId: string,
    toIndex: number
  ) => {
    const fromTasks = tasksByList[fromListId] ?? []
    const task = fromTasks.find(t => t.id === taskId)
    if (!task) return
    const updatedTask = { ...task, list_id: toListId }

    setTasksByList(prev => {
      const fromList = (prev[fromListId] ?? []).filter(t => t.id !== taskId)
      const toList = fromListId === toListId ? [...fromList] : [...(prev[toListId] ?? [])]
      toList.splice(toIndex, 0, updatedTask)
      return { ...prev, [fromListId]: fromList, [toListId]: toList }
    })

    try {
      if (fromListId !== toListId) {
        await apiFetch(`/api/v1/tasks/${taskId}`, {
          method: 'PATCH',
          body: JSON.stringify({ listId: toListId }),
        })
      }
      setTasksByList(prev => {
        const destIds = (prev[toListId] ?? []).map(t => t.id)
        apiFetch(`/api/v1/lists/${toListId}/tasks/reorder`, {
          method: 'POST',
          body: JSON.stringify({ taskIds: destIds }),
        }).catch(() => {})
        if (fromListId !== toListId) {
          const srcIds = (prev[fromListId] ?? []).map(t => t.id)
          apiFetch(`/api/v1/lists/${fromListId}/tasks/reorder`, {
            method: 'POST',
            body: JSON.stringify({ taskIds: srcIds }),
          }).catch(() => {})
        }
        return prev
      })
    } catch {
      fetchAll()
    }
  }, [tasksByList, fetchAll])

  const logTime = useCallback(async (taskId: string, seconds: number, date?: string): Promise<TaskTimeEntry> => {
    const optimisticEntry: TaskTimeEntry = { id: `optimistic-${Date.now()}`, durationSeconds: seconds }
    setTaskTimeEntries(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] ?? []), optimisticEntry],
    }))
    try {
      const created = await apiFetch<{ id: string }>('/api/v1/time-entries', {
        method: 'POST',
        body: JSON.stringify({ taskId, durationSeconds: seconds, ...(date ? { date } : {}) }),
      })
      const real: TaskTimeEntry = { id: created.id, durationSeconds: seconds }
      setTaskTimeEntries(prev => ({
        ...prev,
        [taskId]: (prev[taskId] ?? []).map(e => e.id === optimisticEntry.id ? real : e),
      }))
      window.dispatchEvent(new CustomEvent('hector:time-updated'))
      return real
    } catch {
      setTaskTimeEntries(prev => ({
        ...prev,
        [taskId]: (prev[taskId] ?? []).filter(e => e.id !== optimisticEntry.id),
      }))
      throw new Error('Zeit konnte nicht gespeichert werden')
    }
  }, [])

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
      window.dispatchEvent(new CustomEvent('hector:time-updated'))
    } catch {
      fetchAll()
    }
  }, [fetchAll])

  const deleteTimeEntry = useCallback(async (taskId: string, entryId: string) => {
    const snapshot = taskTimeEntries[taskId] ?? []
    setTaskTimeEntries(prev => ({
      ...prev,
      [taskId]: (prev[taskId] ?? []).filter(e => e.id !== entryId),
    }))
    try {
      await fetch(`/api/v1/time-entries/${entryId}`, { method: 'DELETE' })
      window.dispatchEvent(new CustomEvent('hector:time-updated'))
    } catch {
      setTaskTimeEntries(prev => ({ ...prev, [taskId]: snapshot }))
    }
  }, [taskTimeEntries])

  return {
    tasksByList,
    taskTimeEntries,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
    moveTask,
    logTime,
    updateTimeEntry,
    deleteTimeEntry,
    refetch: fetchAll,
  }
}
