import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

async function SettingsContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: me } = await supabase
    .from('team_members')
    .select('id, company_id, member_role, name, email')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!me) redirect('/onboarding')

  const { data: company } = await supabase
    .from('companies')
    .select('name, industry, invite_code, created_at')
    .eq('id', me.company_id)
    .maybeSingle()

  const { data: topics } = await supabase
    .from('topics')
    .select('id, name, description')
    .eq('company_id', me.company_id)
    .order('name')

  const row = (label: string, value: string) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0',
        fontSize: '14px',
      }}
    >
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '700px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>Settings</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Your workspace and account details.
        </p>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 8px' }}>Company</h2>
        {row('Name', company?.name || '—')}
        {row('Industry', company?.industry || '—')}
        {company?.invite_code && me.member_role === 'admin' && row('Invite code', company.invite_code)}
        {row(
          'Created',
          company?.created_at ? new Date(company.created_at).toLocaleDateString() : '—'
        )}
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 8px' }}>You</h2>
        {row('Name', me.name)}
        {row('Email', me.email || '—')}
        {row('Role', me.member_role)}
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.25rem',
        }}
      >
        <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px' }}>
          Topics ({(topics || []).length})
        </h2>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px' }}>
          Used to organise knowledge and tag Knowledge Holders&rsquo; domains.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {(topics || []).map(t => (
            <span
              key={t.id}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: '#f3f4f6',
                color: '#4b5563',
              }}
            >
              {t.name}
            </span>
          ))}
          {(topics || []).length === 0 && (
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>No topics yet.</span>
          )}
        </div>
      </div>

      {me.member_role === 'admin' && (
        <div style={{ marginTop: '1rem' }}>
          <Link
            href="/dashboard/team/requests"
            style={{
              fontSize: '14px',
              color: '#534AB7',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Manage join requests &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <SettingsContent />
    </Suspense>
  )
}
