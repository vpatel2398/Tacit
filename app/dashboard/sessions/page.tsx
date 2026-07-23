import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

const statusStyles: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: '#f3f4f6', text: '#6b7280' },
  active: { bg: '#E1F5EE', text: '#0F6E56' },
  processing: { bg: '#FAEEDA', text: '#633806' },
  processed: { bg: '#EEEDFE', text: '#3C3489' },
  failed: { bg: '#FAECE7', text: '#712B13' },
}

async function SessionsContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: member } = await supabase
    .from('team_members')
    .select('company_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!member) redirect('/onboarding')

  const { data: holders } = await supabase
    .from('knowledge_holders')
    .select('id, name')
    .eq('company_id', member.company_id)

  const holderIds = (holders || []).map((h: { id: string }) => h.id)
  const holderNames: Record<string, string> = {}
  for (const h of holders || []) holderNames[h.id] = h.name

  let sessions: Array<{
    id: string
    holder_id: string
    session_number: number
    session_type: string
    status: string
    transcript: unknown
    created_at: string
  }> = []

  if (holderIds.length > 0) {
    const { data } = await supabase
      .from('sessions')
      .select('id, holder_id, session_number, session_type, status, transcript, created_at')
      .in('holder_id', holderIds)
      .order('created_at', { ascending: false })
      .limit(50)
    sessions = data || []
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '820px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>Sessions</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Every interview and capture session across your organisation.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>&#9678;</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
            No sessions yet
          </div>
          <div style={{ fontSize: '13px' }}>
            Start an interview from a Knowledge Holder&rsquo;s profile.
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {sessions.map((s, i) => {
            const turns = Array.isArray(s.transcript) ? s.transcript.length : 0
            const st = statusStyles[s.status] || statusStyles.scheduled
            return (
              <Link
                key={s.id}
                href={`/dashboard/sessions/${s.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: i < sessions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>
                      {holderNames[s.holder_id] || 'Unknown'} &middot; Session {s.session_number}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                      {s.session_type.replace(/_/g, ' ')} &middot; {turns} turns &middot;{' '}
                      {new Date(s.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      background: st.bg,
                      color: st.text,
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      flexShrink: 0,
                    }}
                  >
                    {s.status}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <SessionsContent />
    </Suspense>
  )
}
