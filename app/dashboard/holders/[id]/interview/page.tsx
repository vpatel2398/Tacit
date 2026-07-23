import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { InterviewChat } from './InterviewChat'

async function InterviewContent({ id }: { id: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: holder } = await supabase
    .from('knowledge_holders')
    .select('id, name, role')
    .eq('id', id)
    .maybeSingle()

  if (!holder) notFound()

  return (
    <div style={{ padding: '2rem', maxWidth: '820px' }}>
      <Link href={`/dashboard/holders/${id}`} style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>
        ← Back to {holder.name}
      </Link>

      <div style={{ margin: '1rem 0 1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>
          Interview session
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          {holder.name}{holder.role ? ` · ${holder.role}` : ''}
        </p>
      </div>

      <InterviewChat holderId={holder.id} holderName={holder.name} />
    </div>
  )
}

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <InterviewContent id={id} />
    </Suspense>
  )
}
