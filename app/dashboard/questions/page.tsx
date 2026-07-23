import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AskBox } from './AskBox'
import { AnswerForm } from './AnswerForm'

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#f3f4f6', text: '#6b7280', label: 'Pending' },
  answered_by_agent: { bg: '#E1F5EE', text: '#0F6E56', label: 'Answered by AI' },
  routed_to_human: { bg: '#FAEEDA', text: '#633806', label: 'Needs a human' },
  answered_by_human: { bg: '#EEEDFE', text: '#3C3489', label: 'Answered by expert' },
  escalated: { bg: '#FAECE7', text: '#712B13', label: 'Escalated' },
}

async function QuestionsContent() {
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

  const { data: questions } = await supabase
    .from('questions')
    .select(
      'id, content, status, agent_answer, agent_confidence, human_answer, created_at, spawned_chunk_id'
    )
    .eq('company_id', member.company_id)
    .order('created_at', { ascending: false })
    .limit(30)

  const pendingCount = (questions || []).filter(q => q.status === 'routed_to_human').length

  return (
    <div style={{ padding: '2rem', maxWidth: '820px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>Q&amp;A</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Ask anything. The system answers from captured knowledge, or routes it to the right
          person.
        </p>
      </div>

      <AskBox />

      {pendingCount > 0 && (
        <div
          style={{
            background: '#FAEEDA',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#633806',
            marginBottom: '1rem',
          }}
        >
          {pendingCount} question{pendingCount > 1 ? 's' : ''} waiting for a human answer. Answering
          them turns them into permanent knowledge.
        </div>
      )}

      <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px' }}>Recent questions</h2>

      {!questions || questions.length === 0 ? (
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
            No questions yet
          </div>
          <div style={{ fontSize: '13px' }}>Ask something above to get started.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {questions.map(q => {
            const st = statusStyles[q.status] || statusStyles.pending
            return (
              <div
                key={q.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111' }}>{q.content}</div>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: st.bg,
                      color: st.text,
                      fontWeight: 500,
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {st.label}
                  </span>
                </div>

                {q.human_answer ? (
                  <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.6 }}>
                    {q.human_answer}
                    {q.spawned_chunk_id && (
                      <div style={{ fontSize: '11px', color: '#0F6E56', marginTop: '6px' }}>
                        &#10003; Saved as permanent knowledge
                      </div>
                    )}
                  </div>
                ) : q.agent_answer ? (
                  <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.6 }}>
                    {q.agent_answer}
                  </div>
                ) : null}

                {q.status === 'routed_to_human' && <AnswerForm questionId={q.id} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}
    >
      <QuestionsContent />
    </Suspense>
  )
}
