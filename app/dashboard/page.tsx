import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

const chunkTypeColors: Record<string, { bg: string; text: string }> = {
  decision: { bg: '#EEEDFE', text: '#3C3489' },
  heuristic: { bg: '#E1F5EE', text: '#0F6E56' },
  failure_pattern: { bg: '#FAEEDA', text: '#633806' },
  process: { bg: '#E6F1FB', text: '#0C447C' },
  contact: { bg: '#f3f4f6', text: '#4b5563' },
  warning: { bg: '#FAECE7', text: '#712B13' },
  tribal_rule: { bg: '#FDF2F8', text: '#9D174D' },
  workaround: { bg: '#FEF3C7', text: '#92400E' },
}

async function DashboardContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: member } = await supabase
    .from('team_members')
    .select('company_id, member_role, name')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!member) redirect('/onboarding')

  const { data: holders } = await supabase
    .from('knowledge_holders')
    .select('id, name, role, knowledge_completeness, retiring_at, status')
    .eq('company_id', member.company_id)

  const holderIds = (holders || []).map((h: { id: string }) => h.id)
  const holderNames: Record<string, string> = {}
  for (const h of holders || []) holderNames[h.id] = h.name

  // Counts
  let chunkCount = 0
  let gapCount = 0
  let criticalGaps = 0
  let recentChunks: Array<{
    id: string
    holder_id: string
    chunk_type: string
    content: string
    created_at: string
  }> = []

  if (holderIds.length > 0) {
    const [chunksRes, gapsRes, criticalRes, recentRes] = await Promise.all([
      supabase
        .from('knowledge_chunks')
        .select('*', { count: 'exact', head: true })
        .in('holder_id', holderIds),
      supabase
        .from('gap_flags')
        .select('*', { count: 'exact', head: true })
        .in('holder_id', holderIds)
        .eq('status', 'open'),
      supabase
        .from('gap_flags')
        .select('*', { count: 'exact', head: true })
        .in('holder_id', holderIds)
        .eq('status', 'open')
        .eq('severity', 'critical'),
      supabase
        .from('knowledge_chunks')
        .select('id, holder_id, chunk_type, content, created_at')
        .in('holder_id', holderIds)
        .order('created_at', { ascending: false })
        .limit(5),
    ])
    chunkCount = chunksRes.count ?? 0
    gapCount = gapsRes.count ?? 0
    criticalGaps = criticalRes.count ?? 0
    recentChunks = recentRes.data || []
  }

  const { count: pendingQuestions } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', member.company_id)
    .eq('status', 'routed_to_human')

  // Holders at risk: leaving soon or low completeness
  const atRisk = (holders || [])
    .filter((h) => {
      if (h.status === 'departed') return false
      const leavingSoon =
        h.retiring_at && new Date(h.retiring_at).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 180
      return leavingSoon || (h.knowledge_completeness ?? 0) < 0.4
    })
    .sort((a, b) => (a.knowledge_completeness ?? 0) - (b.knowledge_completeness ?? 0))
    .slice(0, 4)

  const stats = [
    {
      label: 'Knowledge Holders',
      value: (holders || []).length,
      color: '#534AB7',
      href: '/dashboard/holders',
    },
    {
      label: 'Knowledge Chunks',
      value: chunkCount,
      color: '#1D9E75',
      href: '/dashboard/knowledge',
    },
    { label: 'Open Gaps', value: gapCount, color: '#D85A30', href: '/dashboard/gaps' },
    {
      label: 'Questions Waiting',
      value: pendingQuestions ?? 0,
      color: '#BA7517',
      href: '/dashboard/questions',
    },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>Knowledge Health</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Your organisation&rsquo;s living knowledge layer &mdash; always on.
        </p>
      </div>

      {/* Alerts */}
      {criticalGaps > 0 && (
        <Link href="/dashboard/gaps" style={{ textDecoration: 'none' }}>
          <div
            style={{
              background: '#FAECE7',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '1rem',
              fontSize: '13px',
              color: '#712B13',
            }}
          >
            <strong>{criticalGaps} critical knowledge gap{criticalGaps > 1 ? 's' : ''}</strong>{' '}
            &mdash; operations could be affected if these people leave. Review now &rarr;
          </div>
        </Link>
      )}

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px',
          marginBottom: '1.5rem',
        }}
      >
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.25rem',
                borderTop: `3px solid ${s.color}`,
                height: '100%',
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 600, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', fontWeight: 500, margin: '4px 0 0', color: '#111' }}>
                {s.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {(holders || []).length === 0 ? (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '2.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>&#9733;</div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
            Add your first Knowledge Holder
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 1.5rem' }}>
            A Knowledge Holder is any senior person whose expertise you want to capture.
          </p>
          <Link
            href="/dashboard/holders/new"
            style={{
              display: 'inline-block',
              padding: '9px 20px',
              background: '#534AB7',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Add Knowledge Holder
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '12px',
          }}
        >
          {/* At risk */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.25rem',
            }}
          >
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 12px' }}>
              Needs attention
            </h2>
            {atRisk.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                Everyone&rsquo;s knowledge is reasonably captured.
              </div>
            ) : (
              atRisk.map(h => (
                <Link
                  key={h.id}
                  href={`/dashboard/holders/${h.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontWeight: 500, color: '#111' }}>{h.name}</span>
                      <span style={{ color: '#6b7280' }}>
                        {Math.round((h.knowledge_completeness ?? 0) * 100)}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: '5px',
                        background: '#f0f0f0',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${(h.knowledge_completeness ?? 0) * 100}%`,
                          background:
                            (h.knowledge_completeness ?? 0) < 0.3 ? '#D85A30' : '#534AB7',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                    {h.retiring_at && (
                      <div style={{ fontSize: '11px', color: '#712B13', marginTop: '3px' }}>
                        Leaving {new Date(h.retiring_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Recent capture */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.25rem',
            }}
          >
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 12px' }}>
              Recently captured
            </h2>
            {recentChunks.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                Nothing captured yet. Start an interview.
              </div>
            ) : (
              recentChunks.map(c => {
                const ct = chunkTypeColors[c.chunk_type] || chunkTypeColors.contact
                return (
                  <div key={c.id} style={{ marginBottom: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '3px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 7px',
                          borderRadius: '20px',
                          background: ct.bg,
                          color: ct.text,
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}
                      >
                        {c.chunk_type.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {holderNames[c.holder_id]}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#4b5563',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {c.content}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
