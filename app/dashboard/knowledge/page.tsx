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

const ALL_TYPES = Object.keys(chunkTypeColors)

async function KnowledgeContent({
  searchParams,
}: {
  searchParams: { type?: string; holder?: string; q?: string }
}) {
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
    .order('name')

  const holderIds = (holders || []).map((h: { id: string }) => h.id)
  const holderNames: Record<string, string> = {}
  for (const h of holders || []) holderNames[h.id] = h.name

  let chunks: Array<{
    id: string
    holder_id: string
    chunk_type: string
    content: string
    source_quote: string | null
    capture_source: string
    created_at: string
  }> = []

  if (holderIds.length > 0) {
    let query = supabase
      .from('knowledge_chunks')
      .select('id, holder_id, chunk_type, content, source_quote, capture_source, created_at')
      .in('holder_id', holderIds)
      .order('created_at', { ascending: false })
      .limit(100)

    if (searchParams.type) query = query.eq('chunk_type', searchParams.type)
    if (searchParams.holder) query = query.eq('holder_id', searchParams.holder)
    if (searchParams.q) query = query.ilike('content', `%${searchParams.q}%`)

    const { data } = await query
    chunks = data || []
  }

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { ...searchParams, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    const s = params.toString()
    return `/dashboard/knowledge${s ? `?${s}` : ''}`
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>Knowledge Base</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Everything captured across your organisation.
        </p>
      </div>

      {/* Search */}
      <form action="/dashboard/knowledge" method="GET" style={{ marginBottom: '1rem' }}>
        {searchParams.type && <input type="hidden" name="type" value={searchParams.type} />}
        {searchParams.holder && <input type="hidden" name="holder" value={searchParams.holder} />}
        <input
          name="q"
          defaultValue={searchParams.q || ''}
          placeholder="Search captured knowledge..."
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </form>

      {/* Filters */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          <Link
            href={buildUrl({ type: undefined })}
            style={{
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '20px',
              textDecoration: 'none',
              border: !searchParams.type ? '1px solid #534AB7' : '1px solid #e5e7eb',
              background: !searchParams.type ? '#EEEDFE' : '#fff',
              color: !searchParams.type ? '#3C3489' : '#6b7280',
            }}
          >
            All types
          </Link>
          {ALL_TYPES.map(t => {
            const active = searchParams.type === t
            const c = chunkTypeColors[t]
            return (
              <Link
                key={t}
                href={buildUrl({ type: t })}
                style={{
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  border: active ? `1px solid ${c.text}` : '1px solid #e5e7eb',
                  background: active ? c.bg : '#fff',
                  color: active ? c.text : '#6b7280',
                  textTransform: 'capitalize',
                }}
              >
                {t.replace('_', ' ')}
              </Link>
            )
          })}
        </div>

        {(holders || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <Link
              href={buildUrl({ holder: undefined })}
              style={{
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '20px',
                textDecoration: 'none',
                border: !searchParams.holder ? '1px solid #534AB7' : '1px solid #e5e7eb',
                background: !searchParams.holder ? '#EEEDFE' : '#fff',
                color: !searchParams.holder ? '#3C3489' : '#6b7280',
              }}
            >
              Everyone
            </Link>
            {(holders || []).map((h: { id: string; name: string }) => {
              const active = searchParams.holder === h.id
              return (
                <Link
                  key={h.id}
                  href={buildUrl({ holder: h.id })}
                  style={{
                    fontSize: '12px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    border: active ? '1px solid #534AB7' : '1px solid #e5e7eb',
                    background: active ? '#EEEDFE' : '#fff',
                    color: active ? '#3C3489' : '#6b7280',
                  }}
                >
                  {h.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '10px' }}>
        {chunks.length} result{chunks.length === 1 ? '' : 's'}
      </div>

      {chunks.length === 0 ? (
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
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>&#10087;</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
            Nothing found
          </div>
          <div style={{ fontSize: '13px' }}>
            Run an interview with a Knowledge Holder to start capturing.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {chunks.map(chunk => {
            const ct = chunkTypeColors[chunk.chunk_type] || chunkTypeColors.contact
            return (
              <div
                key={chunk.id}
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
                    marginBottom: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: ct.bg,
                      color: ct.text,
                      fontWeight: 500,
                      textTransform: 'capitalize',
                    }}
                  >
                    {chunk.chunk_type.replace('_', ' ')}
                  </span>
                  <Link
                    href={`/dashboard/holders/${chunk.holder_id}`}
                    style={{ fontSize: '12px', color: '#6b7280', textDecoration: 'none' }}
                  >
                    {holderNames[chunk.holder_id] || 'Unknown'}
                  </Link>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                    via {chunk.capture_source}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: '#111', lineHeight: 1.5 }}>
                  {chunk.content}
                </div>
                {chunk.source_quote && (
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      fontStyle: 'italic',
                      marginTop: '6px',
                      paddingLeft: '10px',
                      borderLeft: '2px solid #e5e7eb',
                    }}
                  >
                    &ldquo;{chunk.source_quote}&rdquo;
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; holder?: string; q?: string }>
}) {
  const params = await searchParams
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <KnowledgeContent searchParams={params} />
    </Suspense>
  )
}
