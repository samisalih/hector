import React from 'react'
import type { DailyEntry } from '@/lib/hooks/useTrackedTime'
import TimeEntryRow from '../TimeEntryRow/TimeEntryRow'
import styles from './TimeEntryList.module.less'

interface Props {
  entries: DailyEntry[]
  loading: boolean
}

export default function TimeEntryList({ entries, loading }: Props) {
  if (loading) {
    return (
      <div className={styles.list}>
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <span>No time tracked this day</span>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {entries.map(entry => (
        <TimeEntryRow key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
