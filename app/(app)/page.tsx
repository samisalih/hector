import { createServerComponentClient } from '@/lib/supabase/server'
import { getLists } from '@/lib/services/lists.service'
import { getTasksForLists } from '@/lib/services/tasks.service'
import type { Task } from '@/types/database.types'
import BoardClient from './BoardClient'

export default async function BoardPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initialLists = user ? await getLists(supabase, user.id).catch(() => []) : []
  const initialTasksByList: Record<string, Task[]> = user
    ? await getTasksForLists(supabase, initialLists.map(l => l.id), user.id)
    : {}

  return <BoardClient initialLists={initialLists} initialTasksByList={initialTasksByList} />
}
