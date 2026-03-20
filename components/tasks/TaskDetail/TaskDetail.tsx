'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { Task } from '@/types/database.types'
import { useSubtasks } from '@/lib/hooks/useSubtasks'
import styles from './TaskDetail.module.less'

interface TaskDetailProps {
  taskId: string | null
  onClose: () => void
  onUpdate: (taskId: string, data: Partial<Pick<Task, 'title' | 'description' | 'due_date' | 'priority'>>) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  tasks: Task[]
}

export default function TaskDetail({ taskId, onClose, onUpdate, onDelete, tasks }: TaskDetailProps) {
  const task = tasks.find(t => t.id === taskId) ?? null
  const { subtasks, createSubtask, toggleSubtask, deleteSubtask } = useSubtasks(taskId)
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [priority, setPriority] = useState(task?.priority ?? 'none')
  const [newSubtask, setNewSubtask] = useState('')
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (taskId) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [taskId])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setDueDate(task.due_date ?? '')
      setPriority(task.priority)
    }
  }, [task])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    if (taskId) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [taskId])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 350)
  }

  const scheduleSave = useCallback((data: Partial<Pick<Task, 'title' | 'description' | 'due_date' | 'priority'>>) => {
    if (!taskId) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onUpdate(taskId, data), 800)
  }, [taskId, onUpdate])

  async function handleAddSubtask() {
    const t = newSubtask.trim()
    if (!t) return
    await createSubtask(t)
    setNewSubtask('')
  }

  async function handleDelete() {
    if (!taskId) return
    if (confirm('Delete task?')) {
      handleClose()
      setTimeout(() => onDelete(taskId), 400)
    }
  }

  if (!mounted || !taskId) return null

  return createPortal(
    <>
      <div
        className={`${styles.overlay} ${visible ? styles.visible : ''}`}
        onClick={handleClose}
      />
      <div className={`${styles.panel} ${visible ? styles.visible : ''}`}>
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            ✕
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>Edit task</span>
        </div>

        <div className={styles.body}>
          <textarea
            className={styles.titleInput}
            value={title}
            onChange={e => {
              setTitle(e.target.value)
              scheduleSave({ title: e.target.value })
            }}
            rows={2}
          />

          <div className={styles.section}>
            <span className={styles.sectionLabel}>Description</span>
            <textarea
              className={styles.descTextarea}
              value={description}
              onChange={e => {
                setDescription(e.target.value)
                scheduleSave({ description: e.target.value })
              }}
              placeholder="Add notes..."
            />
          </div>

          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <label>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => {
                  setDueDate(e.target.value)
                  scheduleSave({ due_date: e.target.value || null })
                }}
              />
            </div>
            <div className={styles.metaItem}>
              <label>Priority</label>
              <select
                value={priority}
                onChange={e => {
                  const val = e.target.value as Task['priority']
                  setPriority(val)
                  scheduleSave({ priority: val })
                }}
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>Subtasks ({subtasks.filter(s => s.is_completed).length}/{subtasks.length})</span>
            <div className={styles.subtaskList}>
              {subtasks.map(sub => (
                <div key={sub.id} className={styles.subtaskItem}>
                  <div
                    className={`${styles.subtaskCheck} ${sub.is_completed ? styles.checked : ''}`}
                    onClick={() => toggleSubtask(sub.id)}
                  >
                    {sub.is_completed && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4L3 6L7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`${styles.subtaskTitle} ${sub.is_completed ? styles.completed : ''}`}>
                    {sub.title}
                  </span>
                  <button className={styles.deleteSubtask} onClick={() => deleteSubtask(sub.id)}>✕</button>
                </div>
              ))}
            </div>
            <div className={styles.addSubtask}>
              <input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask() }}
                placeholder="Add subtask..."
              />
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>Time tracking</span>
            <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
              Coming in phase 7
            </span>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            Delete task
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
