'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
import { AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'
import type { TaskList, Task } from '@/types/database.types'
import type { TaskTimeEntry } from '@/lib/hooks/useAllTasks'
import TaskCard from '@/components/tasks/TaskCard/TaskCard'
import TimeLogModal from '@/components/ui/TimeLogModal/TimeLogModal'
import styles from './ListColumn.module.less'

interface DragHandleProps {
  draggable: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: (e: React.DragEvent) => void
}

interface TaskDragState {
  draggingId: string | null
  dropIndex: number | null
}

interface ListColumnProps {
  list: TaskList
  onUpdate: (data: { title?: string; color?: string | null }) => Promise<void>
  onDelete: () => Promise<void>
  colRef?: (el: HTMLDivElement | null) => void
  dragHandleProps?: DragHandleProps
  // Task data
  tasks: Task[]
  taskTimeEntries: Record<string, TaskTimeEntry[]>
  // Task handlers (pre-bound to this listId in ListBoard)
  onCreateTask: (title: string) => Promise<void>
  onRenameTask: (taskId: string, title: string) => Promise<void>
  onToggleComplete: (taskId: string) => Promise<boolean>
  onDeleteTask: (taskId: string) => Promise<void>
  onLogTime: (taskId: string, seconds: number, date?: string) => Promise<TaskTimeEntry>
  onUpdateTimeEntry: (taskId: string, entryId: string, seconds: number) => Promise<void>
  onDeleteTimeEntry: (taskId: string, entryId: string) => Promise<void>
  // Task drag
  taskDrag: TaskDragState
  onTaskDragStart: (e: React.DragEvent, taskId: string, cardEl: HTMLDivElement) => void
  onTaskDragOver: (e: React.DragEvent, taskIndex: number) => void
  onColumnDragOver: (e: React.DragEvent) => void
  onTaskDragEnd: () => void
}

export default function ListColumn({
  list,
  onUpdate,
  onDelete,
  colRef,
  dragHandleProps,
  tasks,
  taskTimeEntries,
  onCreateTask,
  onRenameTask,
  onToggleComplete,
  onDeleteTask,
  onLogTime,
  onUpdateTimeEntry,
  onDeleteTimeEntry,
  taskDrag,
  onTaskDragStart,
  onTaskDragOver,
  onColumnDragOver,
  onTaskDragEnd,
}: ListColumnProps) {
  const [mounted, setMounted] = useState(false)
  const [pendingTimeLog, setPendingTimeLog] = useState<{
    taskId: string
    taskTitle: string
    entryId?: string
    initialSeconds?: number
  } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(list.title)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const taskInputRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const taskWrapperRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const activeTasks = tasks.filter(t => !t.is_completed)

  async function handleToggleComplete(task: Task) {
    const isNowCompleted = await onToggleComplete(task.id)
    if (isNowCompleted) setPendingTimeLog({ taskId: task.id, taskTitle: task.title })
  }

  async function handleTimeLogSave(seconds: number, date: string) {
    if (!pendingTimeLog) return
    if (pendingTimeLog.entryId) {
      await onUpdateTimeEntry(pendingTimeLog.taskId, pendingTimeLog.entryId, seconds)
    } else {
      await onLogTime(pendingTimeLog.taskId, seconds, date)
    }
    setPendingTimeLog(null)
  }

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (addingTask) taskInputRef.current?.focus()
  }, [addingTask])

  useEffect(() => {
    if (editingTitle) titleRef.current?.select()
  }, [editingTitle])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        menuBtnRef.current && !menuBtnRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  function handleMenuToggle() {
    if (!showMenu && menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setShowMenu(v => !v)
  }

  async function handleAddTask() {
    const title = newTaskTitle.trim()
    if (!title) { setAddingTask(false); return }
    await onCreateTask(title)
    setNewTaskTitle('')
    taskInputRef.current?.focus()
  }

  function handleTaskKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAddTask()
    if (e.key === 'Escape') { setAddingTask(false); setNewTaskTitle('') }
  }

  async function handleTitleBlur() {
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== list.title) await onUpdate({ title: trimmed })
    else setTitleValue(list.title)
    setEditingTitle(false)
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') titleRef.current?.blur()
    if (e.key === 'Escape') { setTitleValue(list.title); setEditingTitle(false) }
  }

  async function handleDelete() {
    setShowMenu(false)
    if (confirm(`Delete list "${list.title}" and all its tasks?`)) {
      await onDelete()
    }
  }

  return (
    <div className={styles.column} ref={colRef}>
      <div className={`${styles.header} ${editingTitle ? styles.headerEditing : ''}`} {...dragHandleProps}>
        {editingTitle ? (
          <input
            ref={titleRef}
            className={styles.title}
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            onDragStart={e => e.stopPropagation()}
          />
        ) : (
          <span
            className={styles.title}
            onDoubleClick={() => setEditingTitle(true)}
          >
            {list.title}
          </span>
        )}
        <span className={styles.count}>{activeTasks.length}</span>
        <button
          ref={menuBtnRef}
          className={styles.menuBtn}
          onClick={handleMenuToggle}
          aria-label="Options"
        >
          ···
        </button>
        {mounted && showMenu && menuPos && createPortal(
          <div
            ref={menuRef}
            className={styles.menu}
            style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
          >
            <button className={styles.menuItem} onClick={() => { setEditingTitle(true); setShowMenu(false) }}>
              Rename
            </button>
            <button className={`${styles.menuItem} ${styles.danger}`} onClick={handleDelete}>
              Delete
            </button>
          </div>,
          document.body
        )}
      </div>

      <div className={styles.taskList} onDragOver={onColumnDragOver}>
        <AnimatePresence initial={false}>
          {tasks.map((task, i) => (
            <Fragment key={task.id}>
              {taskDrag.draggingId !== null && taskDrag.dropIndex === i && (
                <div className={styles.taskDropIndicator} />
              )}
              <div
                ref={el => {
                  if (el) taskWrapperRefs.current.set(task.id, el)
                  else taskWrapperRefs.current.delete(task.id)
                }}
                draggable
                className={taskDrag.draggingId === task.id ? styles.taskDragging : undefined}
                onDragStart={e => {
                  const wrapper = taskWrapperRefs.current.get(task.id)
                  if (wrapper) onTaskDragStart(e, task.id, wrapper as HTMLDivElement)
                }}
                onDragEnd={onTaskDragEnd}
                onDragOver={e => { e.stopPropagation(); onTaskDragOver(e, i) }}
              >
                <TaskCard
                  task={task}
                  timeEntries={taskTimeEntries[task.id] ?? []}
                  totalSeconds={(taskTimeEntries[task.id] ?? []).reduce((s, e) => s + e.durationSeconds, 0)}
                  onClick={() => {}}
                  onToggleComplete={() => handleToggleComplete(task)}
                  onRename={(newTitle) => onRenameTask(task.id, newTitle)}
                  onDelete={() => onDeleteTask(task.id)}
                  onLogTime={() => setPendingTimeLog({ taskId: task.id, taskTitle: task.title })}
                  onEditTime={(entryId, currentSeconds) =>
                    setPendingTimeLog({ taskId: task.id, taskTitle: task.title, entryId, initialSeconds: currentSeconds })
                  }
                />
              </div>
            </Fragment>
          ))}
        </AnimatePresence>
        {taskDrag.draggingId !== null && taskDrag.dropIndex === tasks.length && (
          <div className={styles.taskDropIndicator} />
        )}
      </div>

      <AnimatePresence>
        {mounted && pendingTimeLog && (
          <TimeLogModal
            taskTitle={pendingTimeLog.taskTitle}
            initialSeconds={pendingTimeLog.initialSeconds}
            onSave={handleTimeLogSave}
            onSkip={() => setPendingTimeLog(null)}
            onDelete={pendingTimeLog.entryId ? async () => {
              await onDeleteTimeEntry(pendingTimeLog.taskId, pendingTimeLog.entryId!)
              setPendingTimeLog(null)
            } : undefined}
          />
        )}
      </AnimatePresence>

      <div className={styles.addTask}>
        <div
          className={`${styles.addTaskInput} ${addingTask ? styles.active : ''}`}
          onClick={() => !addingTask && setAddingTask(true)}
        >
          {addingTask ? (
            <>
              <input
                ref={taskInputRef}
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={handleTaskKeyDown}
                onBlur={handleAddTask}
                placeholder="Add a task..."
              />
              <button
                className={styles.confirmBtn}
                onMouseDown={e => { e.preventDefault(); handleAddTask() }}
                aria-label="Confirm"
              >
                <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <span className={styles.addIcon}>+</span>
              <span>Add task</span>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
