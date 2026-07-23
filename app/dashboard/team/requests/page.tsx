import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { RequestActions } from './RequestActions'

async function RequestsContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Confirm current user is an admin
  const { data: me } = await supabase
    .from('team_members')
    .select('id, company_id, member_role, companies(name, invite_code)')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const isAdmin = me?.member_role === 'admin'

  // Get pending requests for this company
  const { data: requests } = await supabase
    .from('join_requests')
    .select('id, requester_name, requester_email, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // @ts-expect-error nested relation
  const companyName = me?.companies?.name || 'your company'
  // @ts-expect-error nested relation
  const inviteCode = me?.companies?.invite_code || ''

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>
          Join Requests
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          People asking to join {companyName}.
        </p>
      </div>

      {/* Invite code card */}
      {isAdmin && inviteCode && (
        <div style={{
          background: '#EEEDFE', border: '1px solid #d8d5f7', borderRadius: '12px',
          padding: '1.25rem', marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '13px', color: '#3C3489', marginBottom: '4px', fontWeight: 500 }}>
            Your company invite code
          </div>
          <div style={{
            fontSize: '20px', fontWeight: '600', color: '#26215C',
            fontFamily: 'monospace', letterSpacing: '1px'
          }}>
            {inviteCode}
          </div>
          <div style={{ fontSize: '12px', color: '#6b5fc7', marginTop: '6px' }}>
            Share this code with your team so they can request to join.
          </div>
        </div>
      )}

      {!isAdmin ? (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '14px'
        }}>
          Only admins can review join requests.
        </div>
      ) : !requests || requests.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '2.5rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
          <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>No pending requests</div>
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>
            When someone uses your invite code, their request appears here.
          </div>
        </div>
      ) : (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {requests.map((req, i) => (
            <div key={req.id} style={{
              padding: '1rem 1.25rem',
              borderBottom: i < requests.length - 1 ? '1px solid #f0f0f0' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{req.requester_name}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{req.requester_email}</div>
              </div>
              <RequestActions requestId={req.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <RequestsContent />
    </Suspense>
  )
}
