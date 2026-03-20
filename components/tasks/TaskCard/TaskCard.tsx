'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Task } from '@/types/database.types'
import type { TaskTimeEntry } from '@/lib/hooks/useAllTasks'
import styles from './TaskCard.module.less'

interface TaskCardProps {
  task: Task
  timeEntries?: TaskTimeEntry[]
  totalSeconds?: number
  onClick: () => void
  onRename: (newTitle: string) => void
  onToggleComplete: () => void
  onDelete: () => void
  onLogTime: () => void
  onEditTime: (entryId: string, currentSeconds: number) => void
}

function formatDueDate(dueDate: string | null): { label: string; type: 'today' | 'overdue' | 'future' } | null {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  if (due.getTime() === today.getTime()) return { label: 'Today', type: 'today' }
  if (due < today) {
    const days = Math.round((today.getTime() - due.getTime()) / 86400000)
    return { label: `${days}d overdue`, type: 'overdue' }
  }
  return { label: due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), type: 'future' }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

const ClockIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" width="9" height="9">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M6 3.5v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)


export default function TaskCard({
  task,
  timeEntries = [],
  totalSeconds = 0,
  onClick,
  onRename,
  onToggleComplete,
  onDelete,
  onLogTime,
  onEditTime,
}: TaskCardProps) {
  const reducedMotion = useReducedMotion()
  const dueInfo = formatDueDate(task.due_date)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])

  function commitRename() {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== task.title) onRename(trimmed)
    else setEditValue(task.title)
    setEditing(false)
  }

  function handleCheckboxClick(e: React.MouseEvent) { e.stopPropagation(); onToggleComplete() }
  function handleDelete(e: React.MouseEvent) { e.stopPropagation(); onDelete() }
  function handleLogTime(e: React.MouseEvent) { e.stopPropagation(); onLogTime() }

  return (
    <motion.div
      layout
      className={`${styles.card} ${task.is_completed ? styles.completed : ''}`}
      onClick={onClick}
      initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reducedMotion ? {} : { opacity: 0, x: -10, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {task.priority !== 'none' && (
        <div className={`${styles.priorityStripe} ${styles[task.priority]}`} />
      )}

      <motion.div
        key={`cb-${task.id}-${task.is_completed}`}
        className={`${styles.checkbox} ${task.is_completed ? styles.checked : ''}`}
        onClick={handleCheckboxClick}
        role="checkbox"
        aria-checked={task.is_completed}
        initial={task.is_completed && !reducedMotion ? { scale: 0.75 } : false}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      >
        {task.is_completed && (
          <svg className={styles.checkmark} viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </motion.div>

      <div className={styles.body}>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.titleInput}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); commitRename() }
              if (e.key === 'Escape') { setEditValue(task.title); setEditing(false) }
            }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span
            className={`${styles.title} ${task.is_completed ? styles.completed : ''}`}
            onDoubleClick={e => { e.stopPropagation(); setEditing(true) }}
          >
            {task.title}
          </span>
        )}

        <div className={styles.meta}>
          {dueInfo && (
            <span className={`${styles.dueBadge} ${styles[dueInfo.type]}`}>
              {dueInfo.label}
            </span>
          )}
        </div>

        {timeEntries.length > 0 && (
          <div className={styles.timeSection}>
            <div className={styles.timeBadges}>
              {timeEntries.map(entry => (
                <button
                  key={entry.id}
                  className={styles.timeBadge}
                  onClick={e => { e.stopPropagation(); onEditTime(entry.id, entry.durationSeconds) }}
                  title="Edit time"
                >
                  <ClockIcon />
                  {formatDuration(entry.durationSeconds)}
                </button>
              ))}
            </div>
            {timeEntries.length > 1 && (
              <span className={styles.timeTotal}>
                <ClockIcon />
                {formatDuration(totalSeconds)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={styles.cardActions}>
        <button className={styles.timeBtn} onClick={handleLogTime} aria-label="Log time">
          <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6 3.5v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className={styles.deleteBtn} onClick={handleDelete} aria-label="Delete">
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
            <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M5 3.5l.5 7.5M9 3.5l-.5 7.5M3.5 3.5l.5 7.5a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9l.5-7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}
