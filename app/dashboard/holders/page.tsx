import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: '#E1F5EE', text: '#0F6E56' },
  paused: { bg: '#FAEEDA', text: '#633806' },
  complete: { bg: '#EEEDFE', text: '#3C3489' },
  departed: { bg: '#FAECE7', text: '#712B13' },
}

async function HoldersContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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
    .select('id, name, role, department, domains, status, knowledge_completeness, retiring_at')
    .eq('company_id', member.company_id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>
            Knowledge Holders
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            People whose expertise is being captured.
          </p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/holders/new" style={{
            padding: '9px 18px', background: '#534AB7', color: '#fff',
            borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 500
          }}>
            + Add Holder
          </Link>
        )}
      </div>

      {!holders || holders.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '2.5rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>★</div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
            No Knowledge Holders yet
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 1.5rem' }}>
            Add your first senior person to start capturing their expertise.
          </p>
          {isAdmin && (
            <Link href="/dashboard/holders/new" style={{
              display: 'inline-block', padding: '9px 20px', background: '#534AB7',
              color: '#fff', borderRadius: '8px', textDecoration: 'none',
              fontSize: '14px', fontWeight: 500
            }}>
              Add Knowledge Holder
            </Link>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px'
        }}>
          {holders.map(h => {
            const sc = statusColors[h.status] || statusColors.active
            return (
              <Link key={h.id} href={`/dashboard/holders/${h.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
                  padding: '1.25rem', height: '100%'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#111' }}>{h.name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {h.role}{h.role && h.department ? ' · ' : ''}{h.department}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                      background: sc.bg, color: sc.text, fontWeight: 500, textTransform: 'capitalize'
                    }}>
                      {h.status}
                    </span>
                  </div>

                  {h.domains && h.domains.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px', marginTop: '8px' }}>
                      {h.domains.slice(0, 3).map((d: string) => (
                        <span key={d} style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
                          background: '#f3f4f6', color: '#4b5563'
                        }}>{d}</span>
                      ))}
                      {h.domains.length > 3 && (
                        <span style={{ fontSize: '11px', color: '#9ca3af', padding: '2px 4px' }}>
                          +{h.domains.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      <span>Knowledge captured</span>
                      <span>{Math.round((h.knowledge_completeness || 0) * 100)}%</span>
                    </div>
                    <div style={{ height: '5px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(h.knowledge_completeness || 0) * 100}%`,
                        background: '#534AB7', borderRadius: '3px'
                      }} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function HoldersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <HoldersContent />
    </Suspense>
  )
}
