'use client'

import { useState, useRef, useEffect, useMemo, Fragment } from 'react'
import type { Task, TaskList } from '@/types/database.types'
import { useAllTasks } from '@/lib/hooks/useAllTasks'
import type { TaskTimeEntry } from '@/lib/hooks/useAllTasks'
import ListColumn from '@/components/lists/ListColumn/ListColumn'
import styles from './ListBoard.module.less'

interface ListBoardProps {
  initialLists: TaskList[]
  initialTasksByList?: Record<string, Task[]>
  onListsChange: (lists: TaskList[]) => void
  onCreateList: (title: string) => Promise<void>
  onUpdateList: (listId: string, data: { title?: string; color?: string | null }) => Promise<void>
  onDeleteList: (listId: string) => Promise<void>
  onReorderLists: (listIds: string[]) => Promise<void>
}

export default function ListBoard({
  initialLists,
  initialTasksByList,
  onCreateList,
  onUpdateList,
  onDeleteList,
  onReorderLists,
}: ListBoardProps) {
  const [showNewList, setShowNewList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [creating, setCreating] = useState(false)

  // List drag state — parallel state + refs to avoid stale closures in dragend handlers
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const draggedIdRef = useRef<string | null>(null)
  const dropIndexRef = useRef<number | null>(null)
  const listsRef = useRef(initialLists)
  listsRef.current = initialLists

  function setDrag(id: string | null) {
    draggedIdRef.current = id
    setDraggedId(id)
  }
  function setDrop(idx: number | null) {
    dropIndexRef.current = idx
    setDropIndex(idx)
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const colRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const wrapperRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (showNewList) inputRef.current?.focus()
  }, [showNewList])

  // Task state — centralized for cross-list drag support
  const listIds = useMemo(() => initialLists.map(l => l.id), [initialLists])
  const {
    tasksByList,
    taskTimeEntries,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
    moveTask,
    logTime,
    updateTimeEntry,
    deleteTimeEntry,
  } = useAllTasks(listIds, initialTasksByList)

  // tasksByList ref so handleTaskDragEnd sees the latest state without closure staleness
  const tasksByListRef = useRef(tasksByList)
  tasksByListRef.current = tasksByList

  // Task drag state — parallel state + refs
  const [taskDraggedId, setTaskDraggedId] = useState<string | null>(null)
  const [taskDragFromListId, setTaskDragFromListId] = useState<string | null>(null)
  const [taskDropListId, setTaskDropListId] = useState<string | null>(null)
  const [taskDropIndex, setTaskDropIndex] = useState<number | null>(null)
  const taskDraggedIdRef = useRef<string | null>(null)
  const taskDragFromListIdRef = useRef<string | null>(null)
  const taskDropListIdRef = useRef<string | null>(null)
  const taskDropIndexRef = useRef<number | null>(null)

  function resetTaskDrag() {
    taskDraggedIdRef.current = null
    taskDragFromListIdRef.current = null
    taskDropListIdRef.current = null
    taskDropIndexRef.current = null
    setTaskDraggedId(null)
    setTaskDragFromListId(null)
    setTaskDropListId(null)
    setTaskDropIndex(null)
  }

  async function handleCreateList() {
    const title = newListTitle.trim()
    if (!title) return
    try {
      setCreating(true)
      await onCreateList(title)
      setNewListTitle('')
      setShowNewList(false)
    } finally {
      setCreating(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCreateList()
    if (e.key === 'Escape') { setShowNewList(false); setNewListTitle('') }
  }

  function handleDragStart(e: React.DragEvent, listId: string) {
    setDrag(listId)
    const colEl = colRefs.current.get(listId)
    if (colEl) e.dataTransfer.setDragImage(colEl, 30, 20)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const el = wrapperRefs.current.get(listsRef.current[index].id)
    if (!el) return
    const rect = el.getBoundingClientRect()
    setDrop(e.clientX < rect.left + rect.width / 2 ? index : index + 1)
  }

  const handleDragEndRef = useRef<() => void>(() => {})
  handleDragEndRef.current = function handleDragEnd() {
    const id = draggedIdRef.current
    const idx = dropIndexRef.current
    const lists = listsRef.current

    if (id && idx !== null) {
      const from = lists.findIndex(l => l.id === id)
      if (from !== -1) {
        const filtered = lists.filter(l => l.id !== id)
        const insertAt = idx > from ? idx - 1 : idx
        filtered.splice(insertAt, 0, lists[from])
        const newIds = filtered.map(l => l.id)
        if (newIds.join() !== lists.map(l => l.id).join()) {
          onReorderLists(newIds)
        }
      }
    }
    setDrag(null)
    setDrop(null)
  }

  function handleTaskDragStart(e: React.DragEvent, taskId: string, listId: string, cardEl: HTMLDivElement) {
    taskDraggedIdRef.current = taskId
    taskDragFromListIdRef.current = listId
    setTaskDraggedId(taskId)
    setTaskDragFromListId(listId)
    e.dataTransfer.setDragImage(cardEl, 30, 20)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleTaskDragOver(e: React.DragEvent, listId: string, taskIndex: number) {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    taskDropListIdRef.current = listId
    setTaskDropListId(listId)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const idx = e.clientY < rect.top + rect.height / 2 ? taskIndex : taskIndex + 1
    taskDropIndexRef.current = idx
    setTaskDropIndex(idx)
  }

  function makeColumnDragOver(listId: string) {
    return (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      taskDropListIdRef.current = listId
      setTaskDropListId(listId)
      const tasks = tasksByListRef.current[listId] ?? []
      taskDropIndexRef.current = tasks.length
      setTaskDropIndex(tasks.length)
    }
  }

  // Stable ref so onDragEnd always calls the latest version (avoids stale closure on tasksByList)
  const handleTaskDragEndRef = useRef<() => void>(() => {})
  handleTaskDragEndRef.current = function handleTaskDragEnd() {
    const taskId = taskDraggedIdRef.current
    const fromListId = taskDragFromListIdRef.current
    const toListId = taskDropListIdRef.current
    const toIndex = taskDropIndexRef.current

    if (taskId && fromListId && toListId && toIndex !== null) {
      const fromTasks = tasksByListRef.current[fromListId] ?? []
      const fromIndex = fromTasks.findIndex(t => t.id === taskId)
      let insertAt = toIndex
      if (fromListId === toListId && fromIndex < toIndex) insertAt = toIndex - 1
      if (fromListId !== toListId || fromIndex !== insertAt) {
        moveTask(taskId, fromListId, toListId, insertAt)
      }
    }
    resetTaskDrag()
  }

  return (
    <div className={styles.board}>
      {initialLists.length === 0 && !showNewList && (
        <div className={styles.empty}>
          <span className={styles.emptyTitle}>No lists yet</span>
          <span className={styles.emptySubtitle}>Create your first list to get started</span>
        </div>
      )}

      {initialLists.map((list, i) => (
        <Fragment key={list.id}>
          {draggedId !== null && dropIndex === i && (
            <div className={styles.dropIndicator} />
          )}
          <div
            ref={el => { if (el) wrapperRefs.current.set(list.id, el); else wrapperRefs.current.delete(list.id) }}
            className={draggedId === list.id ? styles.dragging : undefined}
            onDragOver={e => handleDragOver(e, i)}
          >
            <ListColumn
              list={list}
              onUpdate={data => onUpdateList(list.id, data)}
              onDelete={() => onDeleteList(list.id)}
              colRef={el => { if (el) colRefs.current.set(list.id, el); else colRefs.current.delete(list.id) }}
              dragHandleProps={{
                draggable: true,
                onDragStart: e => handleDragStart(e, list.id),
                onDragEnd: () => handleDragEndRef.current(),
              }}
              tasks={tasksByList[list.id] ?? []}
              taskTimeEntries={taskTimeEntries}
              onCreateTask={(title: string) => createTask(list.id, title)}
              onRenameTask={(taskId, title) => updateTask(taskId, list.id, { title })}
              onToggleComplete={(taskId: string) => toggleComplete(taskId, list.id)}
              onDeleteTask={(taskId: string) => deleteTask(taskId, list.id)}
              onLogTime={(taskId: string, seconds: number) => logTime(taskId, seconds)}
              onUpdateTimeEntry={(taskId: string, entryId: string, seconds: number) => updateTimeEntry(taskId, entryId, seconds)}
              onDeleteTimeEntry={(taskId: string, entryId: string) => deleteTimeEntry(taskId, entryId)}
              taskDrag={{
                draggingId: taskDraggedId,
                dropIndex: taskDropListId === list.id ? taskDropIndex : null,
              }}
              onTaskDragStart={(e, taskId, cardEl) => handleTaskDragStart(e, taskId, list.id, cardEl)}
              onTaskDragOver={(e, taskIndex) => handleTaskDragOver(e, list.id, taskIndex)}
              onColumnDragOver={makeColumnDragOver(list.id)}
              onTaskDragEnd={() => handleTaskDragEndRef.current()}
            />
          </div>
        </Fragment>
      ))}

      {draggedId !== null && dropIndex === initialLists.length && (
        <div className={styles.dropIndicator} />
      )}

      <div className={styles.addColumn}>
        {showNewList ? (
          <div className={styles.newListForm}>
            <input
              ref={inputRef}
              className={styles.newListInput}
              value={newListTitle}
              onChange={e => setNewListTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="List name..."
            />
            <div className={styles.newListActions}>
              <button onClick={handleCreateList} disabled={creating || !newListTitle.trim()}>
                Create
              </button>
              <button onClick={() => { setShowNewList(false); setNewListTitle('') }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.addColumnBtn} onClick={() => setShowNewList(true)}>
            <span className={styles.icon}>+</span>
            <span>New list</span>
          </button>
        )}
      </div>
    </div>
  )
}
