import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

async function TeamContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: me } = await supabase
    .from('team_members')
    .select('id, company_id, member_role')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!me) redirect('/onboarding')

  const isAdmin = me.member_role === 'admin'

  const { data: company } = await supabase
    .from('companies')
    .select('name, invite_code')
    .eq('id', me.company_id)
    .maybeSingle()

  const { data: members } = await supabase
    .from('team_members')
    .select('id, name, email, role, department, seniority_level, member_role, is_active')
    .eq('company_id', me.company_id)
    .order('member_role')
    .order('name')

  const { count: pendingCount } = await supabase
    .from('join_requests')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', me.company_id)
    .eq('status', 'pending')

  return (
    <div style={{ padding: '2rem', maxWidth: '820px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>Team</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Everyone at {company?.name || 'your company'}.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/dashboard/team/requests"
            style={{
              padding: '9px 18px',
              background: (pendingCount ?? 0) > 0 ? '#534AB7' : '#fff',
              color: (pendingCount ?? 0) > 0 ? '#fff' : '#374151',
              border: (pendingCount ?? 0) > 0 ? 'none' : '1px solid #d1d5db',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Join requests{(pendingCount ?? 0) > 0 ? ` (${pendingCount})` : ''}
          </Link>
        )}
      </div>

      {isAdmin && company?.invite_code && (
        <div
          style={{
            background: '#EEEDFE',
            border: '1px solid #d8d5f7',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '13px', color: '#3C3489', marginBottom: '4px', fontWeight: 500 }}>
            Company invite code
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#26215C',
              fontFamily: 'monospace',
              letterSpacing: '1px',
            }}
          >
            {company.invite_code}
          </div>
          <div style={{ fontSize: '12px', color: '#6b5fc7', marginTop: '6px' }}>
            Share this so colleagues can request to join.
          </div>
        </div>
      )}

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {(members || []).map((m, i) => (
          <div
            key={m.id}
            style={{
              padding: '1rem 1.25rem',
              borderBottom: i < (members || []).length - 1 ? '1px solid #f0f0f0' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>
                {m.name}
                {m.id === me.id && (
                  <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 400 }}> (you)</span>
                )}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginTop: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.email}
                {m.role ? ` \u00b7 ${m.role}` : ''}
                {m.department ? ` \u00b7 ${m.department}` : ''}
              </div>
            </div>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '20px',
                background: m.member_role === 'admin' ? '#EEEDFE' : '#f3f4f6',
                color: m.member_role === 'admin' ? '#3C3489' : '#6b7280',
                fontWeight: 500,
                flexShrink: 0,
                textTransform: 'capitalize',
              }}
            >
              {m.member_role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TeamPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <TeamContent />
    </Suspense>
  )
}
