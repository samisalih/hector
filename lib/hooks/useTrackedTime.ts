'use client'

import { useState, useEffect, useCallback } from 'react'

export type DailyEntry = {
  id: string
  durationSeconds: number
  startedAt: string
  taskId: string
  taskTitle: string
  listId: string
  listTitle: string
}

type DailyResponse = {
  date: string
  totalSeconds: number
  entries: DailyEntry[]
}

const GOAL_KEY = 'hector_daily_goal'
const DEFAULT_GOAL = 28800 // 8 hours

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00.000Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function useTrackedTime() {
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [goalSeconds, setGoalSecondsState] = useState(DEFAULT_GOAL)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(GOAL_KEY)
    if (stored) {
      const n = parseInt(stored, 10)
      if (!isNaN(n) && n > 0) setGoalSecondsState(n)
    }
  }, [])

  const fetchDay = useCallback(async (date: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/time-entries/daily?date=${date}`)
      const json = await res.json()
      if (!res.ok) {
        console.error('[useTrackedTime] API error', res.status, json)
        return
      }
      if (json.data) {
        setEntries(json.data.entries ?? [])
        setTotalSeconds(json.data.totalSeconds ?? 0)
      }
    } catch (err) {
      console.error('[useTrackedTime] fetch failed', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDay(selectedDate) }, [fetchDay, selectedDate])

  useEffect(() => {
    const handler = () => fetchDay(selectedDate)
    window.addEventListener('hector:time-updated', handler)
    return () => window.removeEventListener('hector:time-updated', handler)
  }, [fetchDay, selectedDate])

  const isToday = selectedDate === todayStr()

  const goToPrevDay = useCallback(() => {
    setSelectedDate(d => addDays(d, -1))
  }, [])

  const goToNextDay = useCallback(() => {
    if (selectedDate < todayStr()) {
      setSelectedDate(d => addDays(d, 1))
    }
  }, [selectedDate])

  const setGoalSeconds = useCallback((n: number) => {
    setGoalSecondsState(n)
    localStorage.setItem(GOAL_KEY, String(n))
  }, [])

  return {
    selectedDate,
    goalSeconds,
    entries,
    totalSeconds,
    loading,
    isToday,
    goToPrevDay,
    goToNextDay,
    setGoalSeconds,
  }
}
