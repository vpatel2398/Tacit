import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: '#E1F5EE', text: '#0F6E56' },
  paused: { bg: '#FAEEDA', text: '#633806' },
  complete: { bg: '#EEEDFE', text: '#3C3489' },
  departed: { bg: '#FAECE7', text: '#712B13' },
}

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

async function HolderProfileContent({ id }: { id: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: holder } = await supabase
    .from('knowledge_holders')
    .select('*')
    .eq('id', id)
    .maybeSingle<any>()

  if (!holder) notFound()

  const [{ count: chunkCount }, { count: sessionCount }, { count: gapCount }] = await Promise.all([
    supabase.from('knowledge_chunks').select('*', { count: 'exact', head: true }).eq('holder_id', id),
    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('holder_id', id),
    supabase.from('gap_flags').select('*', { count: 'exact', head: true }).eq('holder_id', id).eq('status', 'open'),
  ])

  const { data: recentChunks } = await supabase
    .from('knowledge_chunks')
    .select('id, chunk_type, content, source_quote, capture_source, created_at')
    .eq('holder_id', id)
    .order('created_at', { ascending: false })
    .limit(10) as { data: any[] | null }

  const sc = statusColors[holder.status] || statusColors.active

  return (
    <div style={{ padding: '2rem', maxWidth: '820px' }}>
      <Link href="/dashboard/holders" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>
        &larr; Back to Knowledge Holders
      </Link>

      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        padding: '1.5rem', margin: '1rem 0 1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>{holder.name}</h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {holder.role}{holder.role && holder.department ? ' \u00b7 ' : ''}{holder.department}
              {holder.tenure_years ? ` \u00b7 ${holder.tenure_years} years` : ''}
            </p>
          </div>
          <span style={{
            fontSize: '12px', padding: '3px 10px', borderRadius: '20px',
            background: sc.bg, color: sc.text, fontWeight: 500, textTransform: 'capitalize'
          }}>
            {holder.status}
          </span>
        </div>

        {holder.domains && holder.domains.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '1rem' }}>
            {holder.domains.map((d: string) => (
              <span key={d} style={{
                fontSize: '12px', padding: '3px 10px', borderRadius: '6px',
                background: '#f3f4f6', color: '#4b5563'
              }}>{d}</span>
            ))}
          </div>
        )}

        {holder.retiring_at && (
          <div style={{
            marginTop: '1rem', padding: '8px 12px', background: '#FAECE7',
            borderRadius: '8px', fontSize: '13px', color: '#712B13'
          }}>
            &#9888; Leaving on {new Date(holder.retiring_at).toLocaleDateString()} &mdash; prioritise capture
          </div>
        )}

        <div style={{ marginTop: '1.25rem' }}>
          <Link href={`/dashboard/holders/${id}/interview`} style={{
            display: 'inline-block', padding: '10px 20px', background: '#534AB7',
            color: '#fff', borderRadius: '8px', textDecoration: 'none',
            fontSize: '14px', fontWeight: 500
          }}>
            &#127908; Start interview session
          </Link>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem'
      }}>
        {[
          { label: 'Knowledge chunks', value: chunkCount ?? 0, color: '#1D9E75' },
          { label: 'Sessions', value: sessionCount ?? 0, color: '#534AB7' },
          { label: 'Open gaps', value: gapCount ?? 0, color: '#D85A30' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem'
          }}>
            <div style={{ fontSize: '26px', fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px' }}>Captured knowledge</h2>
        {!recentChunks || recentChunks.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '2rem', textAlign: 'center', color: '#6b7280'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>&#9678;</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
              No knowledge captured yet
            </div>
            <div style={{ fontSize: '13px' }}>
              Start an interview session above &mdash; every answer becomes structured knowledge here.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentChunks.map(chunk => {
              const ct = chunkTypeColors[chunk.chunk_type] || chunkTypeColors.contact
              return (
                <div key={chunk.id} style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem 1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                      background: ct.bg, color: ct.text, fontWeight: 500, textTransform: 'capitalize'
                    }}>
                      {chunk.chunk_type.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      via {chunk.capture_source}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#111', lineHeight: 1.5 }}>
                    {chunk.content}
                  </div>
                  {chunk.source_quote && (
                    <div style={{
                      fontSize: '13px', color: '#6b7280', fontStyle: 'italic',
                      marginTop: '6px', paddingLeft: '10px', borderLeft: '2px solid #e5e7eb'
                    }}>
                      &ldquo;{chunk.source_quote}&rdquo;
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default async function HolderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <HolderProfileContent id={id} />
    </Suspense>
  )
}