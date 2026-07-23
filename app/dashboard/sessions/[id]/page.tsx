import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

type Turn = { role: 'agent' | 'holder'; content: string }

async function SessionDetailContent({ id }: { id: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('id, holder_id, session_number, session_type, status, transcript, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!session) notFound()

  const { data: holder } = await supabase
    .from('knowledge_holders')
    .select('id, name, role')
    .eq('id', session.holder_id)
    .maybeSingle()

  const { count: chunkCount } = await supabase
    .from('knowledge_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', id)

  const transcript: Turn[] = Array.isArray(session.transcript)
    ? (session.transcript as Turn[])
    : []

  return (
    <div style={{ padding: '2rem', maxWidth: '820px' }}>
      <Link
        href="/dashboard/sessions"
        style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}
      >
        &larr; Back to Sessions
      </Link>

      <div style={{ margin: '1rem 0 1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>
          {holder?.name || 'Unknown'} &middot; Session {session.session_number}
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          {session.session_type.replace(/_/g, ' ')} &middot; {transcript.length} turns &middot;{' '}
          {chunkCount ?? 0} knowledge chunks extracted &middot;{' '}
          {new Date(session.created_at).toLocaleDateString()}
        </p>
      </div>

      {transcript.length === 0 ? (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          This session has no transcript yet.
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          {transcript.map((turn, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: turn.role === 'holder' ? 'flex-end' : 'flex-start',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius:
                    turn.role === 'holder' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: turn.role === 'holder' ? '#534AB7' : '#f3f4f6',
                  color: turn.role === 'holder' ? '#fff' : '#111',
                  fontSize: '14px',
                  lineHeight: 1.5,
                }}
              >
                {turn.role === 'agent' && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      fontWeight: 500,
                    }}
                  >
                    Interviewer
                  </div>
                )}
                {turn.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {holder && (
        <div style={{ marginTop: '1.5rem' }}>
          <Link
            href={`/dashboard/holders/${holder.id}/interview`}
            style={{
              display: 'inline-block',
              padding: '9px 18px',
              background: '#534AB7',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Start a new session with {holder.name}
          </Link>
        </div>
      )}
    </div>
  )
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <SessionDetailContent id={id} />
    </Suspense>
  )
}
