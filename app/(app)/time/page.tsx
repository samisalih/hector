'use client'

import React from 'react'
import { useWeeklyReport } from '@/lib/hooks/useWeeklyReport'
import type { DayReport } from '@/lib/hooks/useWeeklyReport'
import styles from './page.module.less'

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  if (m > 0) return `${m}m`
  return '—'
}

function formatWeekRange(start: string, end: string): string {
  const s = new Date(start + 'T12:00:00Z')
  const e = new Date(end + 'T12:00:00Z')
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`
}

function formatDayHeader(dateStr: string): { name: string; date: string } {
  const d = new Date(dateStr + 'T12:00:00Z')
  return {
    name: d.toLocaleDateString('en-US', { weekday: 'short' }),
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DaySkeleton() {
  return (
    <div className={styles.daySection}>
      <div className={styles.dayHeader}>
        <div className={styles.skeletonLabel} />
        <div className={styles.skeletonDuration} />
      </div>
    </div>
  )
}

function DaySection({ day, isToday }: { day: DayReport; isToday: boolean }) {
  const { name, date } = formatDayHeader(day.date)
  const hasEntries = day.entries.length > 0

  return (
    <div className={`${styles.daySection} ${isToday ? styles.today : ''} ${!hasEntries ? styles.empty : ''}`}>
      <div className={styles.dayHeader}>
        <div className={styles.dayLabel}>
          <span className={styles.dayName}>{name}</span>
          <span className={styles.dayDate}>{date}</span>
        </div>
        <span className={`${styles.dayTotal} ${!hasEntries ? styles.dayTotalEmpty : ''}`}>
          {formatSeconds(day.totalSeconds)}
        </span>
      </div>

      {hasEntries && (
        <div className={styles.entryList}>
          {day.entries.map(entry => (
            <div key={entry.id} className={styles.entryRow}>
              <div className={styles.entryInfo}>
                <span className={styles.entryTask}>{entry.taskTitle}</span>
                <span className={styles.entryListName}>{entry.listTitle}</span>
              </div>
              <span className={styles.entryDuration}>{formatSeconds(entry.durationSeconds)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TimePage() {
  const {
    days,
    loading,
    today,
    weekStart,
    weekEnd,
    isCurrentWeek,
    totalWeekSeconds,
    goToPrevWeek,
    goToNextWeek,
  } = useWeeklyReport()

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <div className={styles.header}>
          <button className={styles.navBtn} onClick={goToPrevWeek} aria-label="Previous week">
            <ChevronLeft />
          </button>
          <div className={styles.weekInfo}>
            <span className={styles.weekRange}>{formatWeekRange(weekStart, weekEnd)}</span>
            <span className={styles.weekTotal}>{formatSeconds(totalWeekSeconds)}</span>
          </div>
          <button
            className={styles.navBtn}
            onClick={goToNextWeek}
            disabled={isCurrentWeek}
            aria-label="Next week"
          >
            <ChevronRight />
          </button>
        </div>

        <div className={styles.days}>
          {loading
            ? Array.from({ length: 7 }, (_, i) => <DaySkeleton key={i} />)
            : days.map(day => (
                <DaySection key={day.date} day={day} isToday={day.date === today} />
              ))}
        </div>
      </div>
    </main>
  )
}
