'use client'

import { useState, useCallback, useEffect } from 'react'
import type { TaskList } from '@/types/database.types'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'API error')
  return json.data as T
}

export function useLists(initialData: TaskList[] = []) {
  const [lists, setLists] = useState<TaskList[]>(initialData)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      const data = await apiFetch<TaskList[]>('/api/v1/lists')
      setLists(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    }
  }, [])

  useEffect(() => {
    const handler = () => refetch()
    window.addEventListener('hector:board-updated', handler)
    return () => window.removeEventListener('hector:board-updated', handler)
  }, [refetch])

  const createList = useCallback(async (title: string, color?: string) => {
    const optimisticId = `optimistic-${Date.now()}`
    const optimistic: TaskList = {
      id: optimisticId,
      user_id: '',
      title,
      color: color ?? null,
      icon: null,
      position: lists.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setLists(prev => [...prev, optimistic])

    try {
      const created = await apiFetch<TaskList>('/api/v1/lists', {
        method: 'POST',
        body: JSON.stringify({ title, color }),
      })
      setLists(prev => prev.map(l => l.id === optimisticId ? created : l))
      return created
    } catch (err) {
      setLists(prev => prev.filter(l => l.id !== optimisticId))
      throw err
    }
  }, [lists.length])

  const updateList = useCallback(async (listId: string, data: { title?: string; color?: string | null }) => {
    setLists(prev => prev.map(l => l.id === listId ? { ...l, ...data } : l))
    try {
      const updated = await apiFetch<TaskList>(`/api/v1/lists/${listId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      setLists(prev => prev.map(l => l.id === listId ? updated : l))
    } catch (err) {
      refetch()
      throw err
    }
  }, [refetch])

  const deleteList = useCallback(async (listId: string) => {
    const snapshot = lists
    setLists(cur => cur.filter(l => l.id !== listId))
    try {
      await fetch(`/api/v1/lists/${listId}`, { method: 'DELETE' })
    } catch (err) {
      setLists(snapshot)
      throw err
    }
  }, [lists])

  const reorderLists = useCallback(async (listIds: string[]) => {
    const reordered = listIds
      .map(id => lists.find(l => l.id === id))
      .filter((l): l is TaskList => l !== undefined)
      .map((l, i) => ({ ...l, position: i }))
    setLists(reordered)

    try {
      await apiFetch('/api/v1/lists/reorder', {
        method: 'POST',
        body: JSON.stringify({ listIds }),
      })
    } catch {
      refetch()
    }
  }, [lists, refetch])

  return { lists, error, createList, updateList, deleteList, reorderLists, refetch }
}
