import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { getListWithTasks } from '@/lib/services/lists.service'

type Params = { params: Promise<{ listId: string }> }

export default async function ListPage({ params }: Params) {
  const { listId } = await params
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  const list = await getListWithTasks(supabase, listId, user.id).catch(() => null)
  if (!list) notFound()

  return (
    <div style={{
      padding: '24px',
      fontFamily: 'var(--font-ui)',
      color: 'var(--text)',
    }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>
        {list.title}
      </h1>
      <p style={{ color: 'var(--text-subtle)', fontSize: '13px' }}>
        {list.tasks.length} {list.tasks.length === 1 ? 'Task' : 'Tasks'}
      </p>
    </div>
  )
}
