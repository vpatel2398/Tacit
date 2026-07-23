import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { RunGapAnalysis } from './RunGapAnalysis'

const severityStyles: Record<string, { bg: string; text: string; order: number }> = {
  critical: { bg: '#FAECE7', text: '#712B13', order: 0 },
  high: { bg: '#FAEEDA', text: '#633806', order: 1 },
  medium: { bg: '#E6F1FB', text: '#0C447C', order: 2 },
  low: { bg: '#f3f4f6', text: '#6b7280', order: 3 },
}

async function GapsContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: member } = await supabase
    .from('team_members')
    .select('company_id, member_role')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!member) redirect('/onboarding')

  const isAdmin = member.member_role === 'admin'

  const { data: holders } = await supabase
    .from('knowledge_holders')
    .select('id, name')
    .eq('company_id', member.company_id)
    .order('name')

  const holderIds = (holders || []).map((h: { id: string }) => h.id)
  const holderNames: Record<string, string> = {}
  for (const h of holders || []) holderNames[h.id] = h.name

  let gaps: Array<{
    id: string
    holder_id: string
    description: string
    severity: string
    status: string
  }> = []

  if (holderIds.length > 0) {
    const { data } = await supabase
      .from('gap_flags')
      .select('id, holder_id, description, severity, status')
      .in('holder_id', holderIds)
      .eq('status', 'open')
    gaps = data || []
  }

  gaps.sort(
    (a, b) =>
      (severityStyles[a.severity]?.order ?? 9) - (severityStyles[b.severity]?.order ?? 9)
  )

  const counts = {
    critical: gaps.filter(g => g.severity === 'critical').length,
    high: gaps.filter(g => g.severity === 'high').length,
    medium: gaps.filter(g => g.severity === 'medium').length,
    low: gaps.filter(g => g.severity === 'low').length,
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '820px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>Gap Flags</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Knowledge that should exist but hasn&rsquo;t been captured yet.
        </p>
      </div>

      {gaps.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '1.5rem',
          }}
        >
          {(['critical', 'high', 'medium', 'low'] as const).map(sev => (
            <div
              key={sev}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1rem',
              }}
            >
              <div
                style={{ fontSize: '22px', fontWeight: 600, color: severityStyles[sev].text }}
              >
                {counts[sev]}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'capitalize',
                  marginTop: '2px',
                }}
              >
                {sev}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && <RunGapAnalysis holders={holders || []} />}

      {gaps.length === 0 ? (
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
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>&#9873;</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
            No gaps flagged
          </div>
          <div style={{ fontSize: '13px' }}>
            {isAdmin
              ? 'Run a gap analysis above to find what\u2019s missing.'
              : 'An admin can run gap analysis.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {gaps.map(gap => {
            const sv = severityStyles[gap.severity] || severityStyles.medium
            const [desc, question] = gap.description.split('\n\nSuggested question: ')
            return (
              <div
                key={gap.id}
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
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: sv.bg,
                      color: sv.text,
                      fontWeight: 500,
                      textTransform: 'capitalize',
                    }}
                  >
                    {gap.severity}
                  </span>
                  <Link
                    href={`/dashboard/holders/${gap.holder_id}`}
                    style={{ fontSize: '12px', color: '#6b7280', textDecoration: 'none' }}
                  >
                    {holderNames[gap.holder_id] || 'Unknown'}
                  </Link>
                </div>
                <div style={{ fontSize: '14px', color: '#111', lineHeight: 1.5 }}>{desc}</div>
                {question && (
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#4b5563',
                      marginTop: '8px',
                      padding: '8px 10px',
                      background: '#fafafa',
                      borderRadius: '8px',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>Ask:</span> {question}
                  </div>
                )}
                <Link
                  href={`/dashboard/holders/${gap.holder_id}/interview`}
                  style={{
                    display: 'inline-block',
                    fontSize: '13px',
                    color: '#534AB7',
                    textDecoration: 'none',
                    marginTop: '8px',
                    fontWeight: 500,
                  }}
                >
                  Start interview to close this &rarr;
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function GapsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <GapsContent />
    </Suspense>
  )
}
