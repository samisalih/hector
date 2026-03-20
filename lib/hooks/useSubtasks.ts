'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Subtask } from '@/types/database.types'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'API error')
  return json.data as T
}

export function useSubtasks(taskId: string | null) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSubtasks = useCallback(async () => {
    if (!taskId) return
    try {
      setLoading(true)
      const data = await apiFetch<Subtask[]>(`/api/v1/tasks/${taskId}/subtasks`)
      setSubtasks(data)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetchSubtasks()
  }, [fetchSubtasks])

  const createSubtask = useCallback(async (title: string) => {
    if (!taskId) return
    const created = await apiFetch<Subtask>(`/api/v1/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
    setSubtasks(prev => [...prev, created])
    return created
  }, [taskId])

  const toggleSubtask = useCallback(async (subtaskId: string) => {
    const sub = subtasks.find(s => s.id === subtaskId)
    if (!sub) return
    setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s))
    try {
      await apiFetch<Subtask>(`/api/v1/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isCompleted: !sub.is_completed }),
      })
    } catch {
      fetchSubtasks()
    }
  }, [subtasks, taskId, fetchSubtasks])

  const deleteSubtask = useCallback(async (subtaskId: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== subtaskId))
    await fetch(`/api/v1/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'DELETE' })
  }, [taskId])

  return { subtasks, loading, createSubtask, toggleSubtask, deleteSubtask }
}
