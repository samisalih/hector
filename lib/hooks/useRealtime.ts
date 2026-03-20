'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtime() {
  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    function fireUpdate() {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('hector:board-updated'))
      }, 300)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return
      const userId = session.user.id
      channel = supabase
        .channel(`board:${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, fireUpdate)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'task_lists', filter: `user_id=eq.${userId}` }, fireUpdate)
        .subscribe()
    })

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      if (channel) supabase.removeChannel(channel)
    }
  }, [])
}
