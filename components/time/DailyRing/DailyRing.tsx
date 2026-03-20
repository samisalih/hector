'use client'

import React from 'react'
import { motion } from 'motion/react'
import styles from './DailyRing.module.less'

interface DailyRingProps {
  totalSeconds: number
  goalSeconds: number
  date: string
  onPrev: () => void
  onNext: () => void
  canGoNext: boolean
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00.000Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const RADIUS = 90
const CX = 110
const CY = 110
const DASH = 2 * Math.PI * RADIUS

function StopwatchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8v3l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 2h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
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

export default function DailyRing({ totalSeconds, goalSeconds, date, onPrev, onNext, canGoNext }: DailyRingProps) {
  const progress = goalSeconds > 0 ? totalSeconds / goalSeconds : 0
  const offset = DASH * (1 - Math.min(progress, 1))
  const isOverGoal = progress > 1

  return (
    <div className={styles.wrapper}>
      <button className={styles.navBtn} onClick={onPrev} aria-label="Previous day">
        <ChevronLeft />
      </button>

      <div className={styles.ringContainer}>
        <svg className={styles.svg} viewBox="0 0 220 220" aria-hidden="true">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(0, 209, 150)" />
              <stop offset="100%" stopColor="rgb(0, 168, 180)" />
            </linearGradient>
            <linearGradient id="ringGradientDanger" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d4d" />
              <stop offset="100%" stopColor="#f5a623" />
            </linearGradient>
          </defs>
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth="14"
          />
          <motion.circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke={isOverGoal ? 'url(#ringGradientDanger)' : 'url(#ringGradient)'}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={DASH}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, mass: 1 }}
            transform={`rotate(-90 ${CX} ${CY})`}
            className={styles.progressArc}
          />
        </svg>

        <div className={styles.center}>
          <span className={styles.icon}><StopwatchIcon /></span>
          <span className={styles.time}>{formatTime(totalSeconds)}</span>
          <span className={styles.dateLabel}>{formatDate(date)}</span>
        </div>
      </div>

      <button
        className={styles.navBtn}
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next day"
      >
        <ChevronRight />
      </button>
    </div>
  )
}
