'use client'

import type { Task, TaskList } from '@/types/database.types'
import { useLists } from '@/lib/hooks/useLists'
import { useRealtime } from '@/lib/hooks/useRealtime'
import ListBoard from '@/components/lists/ListBoard/ListBoard'
import TimeColumn from '@/components/time/TimeColumn/TimeColumn'
import styles from './BoardClient.module.less'

interface BoardClientProps {
  initialLists: TaskList[]
  initialTasksByList?: Record<string, Task[]>
}

export default function BoardClient({ initialLists, initialTasksByList }: BoardClientProps) {
  useRealtime()
  const { lists, error, createList, updateList, deleteList, reorderLists } = useLists(initialLists)

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--danger)',
        fontFamily: 'var(--font-ui)',
        fontSize: '14px',
      }}>
        {error}
      </div>
    )
  }

  return (
    <div className={styles.shell}>
      <div className={styles.boardWrapper}>
        <ListBoard
          initialLists={lists}
          initialTasksByList={initialTasksByList}
          onListsChange={() => {}}
          onCreateList={async (title) => { await createList(title) }}
          onUpdateList={async (listId, data) => { await updateList(listId, data) }}
          onDeleteList={async (listId) => { await deleteList(listId) }}
          onReorderLists={async (listIds) => { await reorderLists(listIds) }}
        />
      </div>
      <div className={styles.timePanel}>
        <TimeColumn />
      </div>
    </div>
  )
}
