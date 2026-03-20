'use client'

import React from 'react'
import DailyRing from '@/components/time/DailyRing/DailyRing'
import TimeEntryList from '@/components/time/TimeEntryList/TimeEntryList'
import { useTrackedTime } from '@/lib/hooks/useTrackedTime'
import styles from './TimeColumn.module.less'

export default function TimeColumn(): React.ReactElement {
  const {
    totalSeconds,
    goalSeconds,
    entries,
    loading,
    selectedDate,
    isToday,
    goToPrevDay,
    goToNextDay,
  } = useTrackedTime()

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <span className={styles.title}>Tracked time</span>
      </div>
      <div className={styles.body}>
        <DailyRing
          totalSeconds={totalSeconds}
          goalSeconds={goalSeconds}
          date={selectedDate}
          onPrev={goToPrevDay}
          onNext={goToNextDay}
          canGoNext={!isToday}
        />
        <TimeEntryList entries={entries} loading={loading} />
      </div>
    </div>
  )
}
