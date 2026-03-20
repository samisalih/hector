'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import styles from './TimeLogModal.module.less'

interface TimeLogModalProps {
  taskTitle: string
  initialSeconds?: number
  onSave: (seconds: number, date: string) => void
  onSkip: () => void
  onDelete?: () => void
}

function todayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function TimeLogModal({ taskTitle, initialSeconds, onSave, onSkip, onDelete }: TimeLogModalProps) {
  const initH = initialSeconds != null ? String(Math.floor(initialSeconds / 3600)) : ''
  const initM = initialSeconds != null ? String(Math.floor((initialSeconds % 3600) / 60)) : ''
  const [hours, setHours] = useState(initH)
  const [minutes, setMinutes] = useState(initM)
  const [date, setDate] = useState(todayLocal)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const hoursRef = useRef<HTMLInputElement>(null)
  const deleteBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (mounted) hoursRef.current?.focus() }, [mounted])

  function handleSave() {
    const h = parseInt(hours || '0', 10)
    const m = parseInt(minutes || '0', 10)
    const seconds = h * 3600 + m * 60
    if (seconds <= 0) { onSkip(); return }
    onSave(seconds, date)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onSkip()
  }

  function sanitizeNum(val: string, max: number) {
    const n = val.replace(/\D/g, '')
    if (n === '') return ''
    return String(Math.min(parseInt(n, 10), max))
  }

  function handleDeleteClick() {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      // Focus the button so blur fires correctly when user clicks away
      setTimeout(() => deleteBtnRef.current?.focus(), 0)
    } else {
      onDelete?.()
    }
  }

  function handleDeleteBlur() {
    setDeleteConfirm(false)
  }

  if (!mounted) return null

  return createPortal(
    <motion.div
      className={styles.overlay}
      onClick={e => e.target === e.currentTarget && onSkip()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 6 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      >
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className={styles.title}>{initialSeconds != null ? 'Edit time entry' : 'How long did it take?'}</div>
        <div className={styles.taskName}>{taskTitle}</div>

        <input
          type="date"
          className={styles.dateInput}
          value={date}
          max={todayLocal()}
          onChange={e => setDate(e.target.value)}
        />

        <div className={styles.inputs} onKeyDown={handleKeyDown}>
          <div className={styles.field}>
            <input
              ref={hoursRef}
              className={styles.numInput}
              value={hours}
              onChange={e => setHours(sanitizeNum(e.target.value, 99))}
              placeholder="0"
              inputMode="numeric"
            />
            <span className={styles.unit}>h</span>
          </div>
          <span className={styles.sep}>:</span>
          <div className={styles.field}>
            <input
              className={styles.numInput}
              value={minutes}
              onChange={e => setMinutes(sanitizeNum(e.target.value, 59))}
              placeholder="0"
              inputMode="numeric"
            />
            <span className={styles.unit}>min</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>
            Save
          </button>
          <button className={styles.skipBtn} onClick={onSkip}>
            {initialSeconds != null ? 'Cancel' : 'Skip'}
          </button>
          {onDelete && (
            <button
              ref={deleteBtnRef}
              className={deleteConfirm ? styles.deleteBtnConfirm : styles.deleteBtnDanger}
              onClick={handleDeleteClick}
              onBlur={handleDeleteBlur}
            >
              {deleteConfirm ? 'Are you sure?' : 'Delete time entry'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}
