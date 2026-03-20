'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DailyEntry } from './useTrackedTime'

export type DayReport = {
  date: string
  totalSeconds: number
  entries: DailyEntry[]
  loading: boolean
}

function getMonday(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00.000Z')
  const day = d.getUTCDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().slice(0, 10)
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00.000Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

async function fetchDay(date: string): Promise<{ totalSeconds: number; entries: DailyEntry[] }> {
  try {
    const res = await fetch(`/api/v1/time-entries/daily?date=${date}`)
    const json = await res.json()
    if (!res.ok) return { totalSeconds: 0, entries: [] }
    return {
      totalSeconds: json.data?.totalSeconds ?? 0,
      entries: json.data?.entries ?? [],
    }
  } catch {
    return { totalSeconds: 0, entries: [] }
  }
}

export function useWeeklyReport() {
  const today = todayStr()
  const currentWeekStart = getMonday(today)
  const [weekStart, setWeekStart] = useState(() => currentWeekStart)
  const [days, setDays] = useState<DayReport[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWeek = useCallback(async (start: string) => {
    setLoading(true)
    const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    const results = await Promise.all(
      dates.map(date =>
        fetchDay(date).then(r => ({ date, ...r, loading: false }))
      )
    )
    setDays(results)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchWeek(weekStart)
  }, [fetchWeek, weekStart])

  useEffect(() => {
    const handler = () => fetchWeek(weekStart)
    window.addEventListener('hector:time-updated', handler)
    return () => window.removeEventListener('hector:time-updated', handler)
  }, [fetchWeek, weekStart])

  const isCurrentWeek = weekStart === currentWeekStart
  const weekEnd = addDays(weekStart, 6)
  const totalWeekSeconds = days.reduce((sum, d) => sum + d.totalSeconds, 0)

  const goToPrevWeek = useCallback(() => {
    setWeekStart(s => addDays(s, -7))
  }, [])

  const goToNextWeek = useCallback(() => {
    if (!isCurrentWeek) setWeekStart(s => addDays(s, 7))
  }, [isCurrentWeek])

  return {
    days,
    loading,
    today,
    weekStart,
    weekEnd,
    isCurrentWeek,
    totalWeekSeconds,
    goToPrevWeek,
    goToNextWeek,
  }
}
