import React from 'react'
import type { DailyEntry } from '@/lib/hooks/useTrackedTime'
import styles from './TimeEntryRow.module.less'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

export default function TimeEntryRow({ entry }: { entry: DailyEntry }) {
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <span className={styles.taskTitle}>{entry.taskTitle}</span>
        <span className={styles.listName}>{entry.listTitle}</span>
      </div>
      <span className={styles.duration}>{formatDuration(entry.durationSeconds)}</span>
    </div>
  )
}
